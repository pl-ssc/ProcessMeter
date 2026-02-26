import nodemailer from 'nodemailer';
import { query } from '../db/index.js';
import { env } from '../config/env.js';

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
 * Loads a single setting value from the DB.
 */
async function loadSetting(key) {
    const { rows } = await query(`SELECT value FROM settings WHERE key = $1`, [key]);
    return rows[0]?.value ?? '';
}

/**
 * Replaces {{variable}} placeholders in a template string.
 */
function renderTemplate(template, vars) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
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
 * Sends a raw email.
 */
export async function sendMail({ to, subject, html, text }) {
    const { transporter, from } = await createTransporter();
    return transporter.sendMail({ from, to, subject, html, text });
}

/**
 * Sends an invitation email with a set-password link.
 */
export async function sendInviteEmail({ to, fullName, token }) {
    const orgName = env.ORG_NAME || 'ProcessMeter';
    const appUrl = env.APP_URL || 'http://localhost:3001';
    const link = `${appUrl}/?action=set-password&token=${token}`;

    const subjectTpl = await loadSetting('email_invite_subject');
    const htmlTpl = await loadSetting('email_invite_html');

    const vars = { full_name: fullName, org_name: orgName, link };
    return sendMail({
        to,
        subject: renderTemplate(subjectTpl || 'Приглашение в {{org_name}}', vars),
        html: renderTemplate(htmlTpl || '<p>Ссылка для установки пароля: <a href="{{link}}">{{link}}</a></p>', vars),
    });
}

/**
 * Sends a password reset email.
 */
export async function sendResetEmail({ to, fullName, token }) {
    const orgName = env.ORG_NAME || 'ProcessMeter';
    const appUrl = env.APP_URL || 'http://localhost:3001';
    const link = `${appUrl}/?action=set-password&token=${token}`;

    const subjectTpl = await loadSetting('email_reset_subject');
    const htmlTpl = await loadSetting('email_reset_html');

    const vars = { full_name: fullName, org_name: orgName, link };
    return sendMail({
        to,
        subject: renderTemplate(subjectTpl || 'Сброс пароля', vars),
        html: renderTemplate(htmlTpl || '<p>Ссылка для сброса пароля: <a href="{{link}}">{{link}}</a></p>', vars),
    });
}

/**
 * Sends a survey completion notification.
 */
export async function sendSurveyCompleteEmail({ to, fullName }) {
    const orgName = env.ORG_NAME || 'ProcessMeter';

    const subjectTpl = await loadSetting('email_survey_complete_subject');
    const htmlTpl = await loadSetting('email_survey_complete_html');

    const vars = { full_name: fullName, org_name: orgName };
    return sendMail({
        to,
        subject: renderTemplate(subjectTpl || 'Спасибо за участие в опросе', vars),
        html: renderTemplate(htmlTpl || '<p>Ваши ответы сохранены. Спасибо!</p>', vars),
    });
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
