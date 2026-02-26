import nodemailer from 'nodemailer';
import { query } from '../db/index.js';
import { env } from '../config/env.js';

/** Cached transporter — invalidated when SMTP settings change */
let _transporterCache = null;
let _transporterCacheKey = '';

/**
 * Loads all relevant settings from the DB in a single query.
 */
async function loadSettings(keyPattern) {
    const { rows } = await query(
        `SELECT key, value FROM settings WHERE key LIKE $1`,
        [keyPattern]
    );
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

/**
 * Loads both SMTP config and email templates in one query.
 */
async function loadAllSettings() {
    const { rows } = await query(
        `SELECT key, value FROM settings WHERE key LIKE 'smtp_%' OR key LIKE 'email_%'`
    );
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

/**
 * Replaces {{variable}} placeholders in a template string.
 * Values are HTML-escaped to prevent XSS in email bodies.
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTemplate(template, vars) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const val = vars[key] ?? '';
        // Links (containing 'link') are trusted internal URLs — don't escape
        return key === 'link' ? val : escapeHtml(val);
    });
}

/**
 * Validates basic email format.
 */
export function isValidEmail(address) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}

/**
 * Builds SMTP config object from a settings map.
 */
function buildSmtpConfig(cfg) {
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
 * Returns a cached Nodemailer transporter (re-creates if SMTP settings changed).
 * Throws if SMTP is not configured.
 */
async function getTransporter() {
    const settings = await loadSettings('smtp_%');
    const cacheKey = JSON.stringify(settings);

    if (_transporterCache && _transporterCacheKey === cacheKey) {
        return _transporterCache;
    }

    const smtp = buildSmtpConfig(settings);
    if (!smtp.host || !smtp.auth.user) {
        throw new Error('SMTP не настроен. Заполните настройки в разделе "Настройки" административной панели.');
    }

    _transporterCache = { transporter: nodemailer.createTransport(smtp), from: smtp.from };
    _transporterCacheKey = cacheKey;
    return _transporterCache;
}

/**
 * Creates a Nodemailer transporter using settings from the DB.
 * Exposed for backward compatibility (e.g. settings page "Test Connection").
 */
export async function createTransporter() {
    return getTransporter();
}

/**
 * Sends a raw email.
 */
export async function sendMail({ to, subject, html, text }) {
    const { transporter, from } = await getTransporter();
    return transporter.sendMail({ from, to, subject, html, text });
}

/**
 * Sends an invitation or password-reset email with a set-password link.
 * @param {'invite'|'reset'} type
 */
export async function sendPasswordLinkEmail({ type, to, fullName, token }) {
    if (!isValidEmail(to)) {
        throw new Error(`Невалидный email-адрес: ${to}`);
    }

    const orgName = env.ORG_NAME || 'ProcessMeter';
    const appUrl = env.APP_URL || 'http://localhost:3001';
    const link = `${appUrl}/?action=set-password&token=${token}`;

    const settings = await loadSettings('email_%');
    const vars = { full_name: fullName, org_name: orgName, link };

    if (type === 'invite') {
        const subjectTpl = settings.email_invite_subject;
        const htmlTpl = settings.email_invite_html;
        return sendMail({
            to,
            subject: renderTemplate(subjectTpl || 'Приглашение в {{org_name}}', vars),
            html: renderTemplate(htmlTpl || '<p>Ссылка для установки пароля: <a href="{{link}}">{{link}}</a></p>', vars),
        });
    }

    // type === 'reset'
    const subjectTpl = settings.email_reset_subject;
    const htmlTpl = settings.email_reset_html;
    return sendMail({
        to,
        subject: renderTemplate(subjectTpl || 'Сброс пароля', vars),
        html: renderTemplate(htmlTpl || '<p>Ссылка для сброса пароля: <a href="{{link}}">{{link}}</a></p>', vars),
    });
}

/** @deprecated Use sendPasswordLinkEmail({ type: 'invite', ... }) */
export async function sendInviteEmail({ to, fullName, token }) {
    return sendPasswordLinkEmail({ type: 'invite', to, fullName, token });
}

/** @deprecated Use sendPasswordLinkEmail({ type: 'reset', ... }) */
export async function sendResetEmail({ to, fullName, token }) {
    return sendPasswordLinkEmail({ type: 'reset', to, fullName, token });
}

/**
 * Sends a survey completion notification.
 */
export async function sendSurveyCompleteEmail({ to, fullName }) {
    if (!isValidEmail(to)) {
        throw new Error(`Невалидный email-адрес: ${to}`);
    }

    const orgName = env.ORG_NAME || 'ProcessMeter';
    const settings = await loadSettings('email_%');
    const vars = { full_name: fullName, org_name: orgName };

    return sendMail({
        to,
        subject: renderTemplate(settings.email_survey_complete_subject || 'Спасибо за участие в опросе', vars),
        html: renderTemplate(settings.email_survey_complete_html || '<p>Ваши ответы сохранены. Спасибо!</p>', vars),
    });
}

/**
 * Verifies SMTP connection using provided config (for "Test Connection" in admin UI).
 * This always creates a fresh transporter (not cached) since it uses user-provided config.
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
