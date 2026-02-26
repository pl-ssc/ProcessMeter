import nodemailer from 'nodemailer';
import { query } from '../db/index.js';

/**
 * Loads SMTP settings from the `settings` table.
 */
async function loadSmtpConfig() {
    const { rows } = await query(
        `SELECT key, value FROM settings WHERE key LIKE 'smtp_%'`
    );
    const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]));
    return {
        host: cfg.smtp_host,
        port: parseInt(cfg.smtp_port, 10) || 587,
        secure: cfg.smtp_secure === 'true',
        auth: {
            user: cfg.smtp_user,
            pass: cfg.smtp_password,
        },
        from: cfg.smtp_from
            ? `"${cfg.smtp_from_name || ''}" <${cfg.smtp_from}>`
            : null,
    };
}

/**
 * Creates a Nodemailer transporter using settings from the DB.
 * Throws if SMTP is not configured.
 */
export async function createTransporter() {
    const cfg = await loadSmtpConfig();
    if (!cfg.host || !cfg.auth.user) {
        throw new Error('SMTP не настроен. Заполните настройки в разделе "Настройки" административной панели.');
    }
    return { transporter: nodemailer.createTransport(cfg), from: cfg.from };
}

/**
 * Sends an email. Loads SMTP config on every call (allows live update without restart).
 * @param {object} options - { to, subject, html, text }
 */
export async function sendMail({ to, subject, html, text }) {
    const { transporter, from } = await createTransporter();
    return transporter.sendMail({ from, to, subject, html, text });
}

/**
 * Verifies SMTP connection using provided config (for "Test Connection" in admin UI).
 */
export async function testSmtpConnection(cfg) {
    const transporter = nodemailer.createTransport({
        host: cfg.smtp_host,
        port: parseInt(cfg.smtp_port, 10) || 587,
        secure: cfg.smtp_secure === 'true',
        auth: {
            user: cfg.smtp_user,
            pass: cfg.smtp_password,
        },
    });
    await transporter.verify();
    return true;
}
