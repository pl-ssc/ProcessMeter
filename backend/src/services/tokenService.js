import crypto from 'crypto';
import { query } from '../db/index.js';

const TOKEN_EXPIRY_HOURS = 24;

/**
 * Creates a new password token (invite or reset) for a user.
 * Invalidates any previous tokens of the same type for the same user.
 */
export async function createToken(userId, type) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Expire old tokens of the same type
    await query(
        `UPDATE password_tokens SET used_at = now()
         WHERE user_id = $1 AND type = $2 AND used_at IS NULL`,
        [userId, type]
    );

    await query(
        `INSERT INTO password_tokens (user_id, token, type, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [userId, token, type, expiresAt]
    );

    return token;
}

/**
 * Validates a token. Returns { user, tokenRow } if valid.
 * Throws descriptive errors if invalid/expired/used.
 */
export async function validateToken(token) {
    const { rows } = await query(
        `SELECT pt.id, pt.user_id, pt.type, pt.expires_at, pt.used_at,
                u.username, u.full_name, u.role
         FROM password_tokens pt
         JOIN users u ON u.id = pt.user_id
         WHERE pt.token = $1`,
        [token]
    );

    const row = rows[0];
    if (!row) throw new Error('Ссылка недействительна или уже использована.');
    if (row.used_at) throw new Error('Эта ссылка уже была использована.');
    if (new Date(row.expires_at) < new Date()) throw new Error('Срок действия ссылки истёк.');

    return {
        tokenId: row.id,
        userId: row.user_id,
        type: row.type,
        user: { username: row.username, full_name: row.full_name, role: row.role },
    };
}

/**
 * Marks a token as used.
 */
export async function markTokenUsed(tokenId) {
    await query(
        `UPDATE password_tokens SET used_at = now() WHERE id = $1`,
        [tokenId]
    );
}
