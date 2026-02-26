import crypto from 'crypto';
import pool, { query } from '../db/index.js';

const TOKEN_EXPIRY_HOURS = 24;

/**
 * Creates a new password token (invite or reset) for a user.
 * Invalidates any previous tokens of the same type for the same user.
 * Both operations run in a transaction to avoid race conditions.
 */
export async function createToken(userId, type) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Expire old tokens of the same type
        await client.query(
            `UPDATE password_tokens SET used_at = now()
             WHERE user_id = $1 AND type = $2 AND used_at IS NULL`,
            [userId, type]
        );

        await client.query(
            `INSERT INTO password_tokens (user_id, token, type, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [userId, token, type, expiresAt]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

    return token;
}

/**
 * Validates a token. Returns { tokenId, userId, type, user } if valid.
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

/**
 * Deletes a token by its raw token string (used when email sending fails).
 */
export async function deleteToken(token) {
    await query(`DELETE FROM password_tokens WHERE token = $1`, [token]);
}
