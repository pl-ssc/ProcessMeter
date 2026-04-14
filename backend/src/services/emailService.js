import nodemailer from 'nodemailer';
import { query } from '../db/index.js';
import { env } from '../config/env.js';

/** Cached transporter — invalidated when SMTP settings change */
let _transporterCache = null;
let _transporterCacheKey = '';

const DEFAULT_INVITE_SUBJECT = 'Приглашение в {{org_name}}';
const DEFAULT_INVITE_HTML = `
<div style="margin:0;padding:32px 16px;background:#f3f6fb">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe4f0;border-radius:24px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="padding:32px 40px;background:linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%);color:#ffffff">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.78">ProcessLabs</div>
      <h1 style="margin:14px 0 0;font-size:30px;line-height:1.2;font-weight:700">Вас пригласили в {{org_name}}</h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;opacity:0.92">Подключаем вас к рабочему пространству для заполнения и анализа трудоемкости процессов.</p>
    </div>
    <div style="padding:36px 40px">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Здравствуйте, <strong>{{full_name}}</strong>!</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Для вас создана учетная запись в системе <strong>{{org_name}}</strong>. Чтобы завершить регистрацию, задайте пароль по кнопке ниже.</p>
      <div style="margin:28px 0">
        <a href="{{link}}" style="display:inline-block;padding:14px 24px;border-radius:14px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700">Установить пароль</a>
      </div>
      <div style="padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0">
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569"><strong>Ссылка действует 24 часа.</strong></p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b">Если кнопка не открывается, скопируйте ссылку в браузер:</p>
        <p style="margin:8px 0 0;font-size:13px;line-height:1.6;word-break:break-all"><a href="{{link}}" style="color:#2563eb;text-decoration:none">{{link}}</a></p>
      </div>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #e2e8f0;background:#f8fafc">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">Если вы не ожидали это письмо, просто проигнорируйте его.</p>
    </div>
  </div>
</div>`;

const DEFAULT_RESET_SUBJECT = 'Сброс пароля в {{org_name}}';
const DEFAULT_RESET_HTML = `
<div style="margin:0;padding:32px 16px;background:#f3f6fb">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe4f0;border-radius:24px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="padding:32px 40px;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:#ffffff">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.78">ProcessLabs</div>
      <h1 style="margin:14px 0 0;font-size:30px;line-height:1.2;font-weight:700">Сброс пароля</h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;opacity:0.92">Запросили безопасную установку нового пароля для входа в {{org_name}}.</p>
    </div>
    <div style="padding:36px 40px">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Здравствуйте, <strong>{{full_name}}</strong>!</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Чтобы задать новый пароль, перейдите по ссылке ниже. После смены пароля предыдущие сессии входа будут завершены автоматически.</p>
      <div style="margin:28px 0">
        <a href="{{link}}" style="display:inline-block;padding:14px 24px;border-radius:14px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700">Сбросить пароль</a>
      </div>
      <div style="padding:18px 20px;border-radius:18px;background:#fff7ed;border:1px solid #fdba74">
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#9a3412"><strong>Ссылка действует 24 часа и может быть использована только один раз.</strong></p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#9a3412">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      </div>
      <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#64748b;word-break:break-all"><a href="{{link}}" style="color:#ea580c;text-decoration:none">{{link}}</a></p>
    </div>
  </div>
</div>`;

const DEFAULT_SURVEY_COMPLETE_SUBJECT = 'Спасибо за участие в {{org_name}}';
const DEFAULT_SURVEY_COMPLETE_HTML = `
<div style="margin:0;padding:32px 16px;background:#f3f6fb">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe4f0;border-radius:24px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="padding:32px 40px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.78">ProcessLabs</div>
      <h1 style="margin:14px 0 0;font-size:30px;line-height:1.2;font-weight:700">Спасибо за участие</h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;opacity:0.92">Ваши ответы сохранены и учтены в оценке процессов.</p>
    </div>
    <div style="padding:36px 40px">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Здравствуйте, <strong>{{full_name}}</strong>!</p>
      <p style="margin:0;font-size:16px;line-height:1.7">Благодарим за заполнение опроса в <strong>{{org_name}}</strong>. Данные уже доступны для дальнейшего анализа команды ProcessLabs.</p>
    </div>
  </div>
</div>`;

const DEFAULT_SURVEY_REOPENED_SUBJECT = 'Доступ к анкете восстановлен в {{org_name}}';
const DEFAULT_SURVEY_REOPENED_HTML = `
<div style="margin:0;padding:32px 16px;background:#f3f6fb">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe4f0;border-radius:24px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="padding:32px 40px;background:linear-gradient(135deg,#2563eb 0%,#0f172a 100%);color:#ffffff">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.78">ProcessLabs</div>
      <h1 style="margin:14px 0 0;font-size:30px;line-height:1.2;font-weight:700">Доступ к анкете восстановлен</h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;opacity:0.92">Администратор снова открыл возможность редактирования данных в {{org_name}}.</p>
    </div>
    <div style="padding:36px 40px">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Здравствуйте, <strong>{{full_name}}</strong>!</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Ввод данных снова доступен для редактирования.</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7"><strong>Причина:</strong> {{reason}}</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b">Вы можете вернуться в опрос и продолжить работу без потери ранее сохраненных ответов.</p>
    </div>
  </div>
</div>`;

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
            subject: renderTemplate(subjectTpl || DEFAULT_INVITE_SUBJECT, vars),
            html: renderTemplate(htmlTpl || DEFAULT_INVITE_HTML, vars),
        });
    }

    // type === 'reset'
    const subjectTpl = settings.email_reset_subject;
    const htmlTpl = settings.email_reset_html;
    return sendMail({
        to,
        subject: renderTemplate(subjectTpl || DEFAULT_RESET_SUBJECT, vars),
        html: renderTemplate(htmlTpl || DEFAULT_RESET_HTML, vars),
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
        subject: renderTemplate(settings.email_survey_complete_subject || DEFAULT_SURVEY_COMPLETE_SUBJECT, vars),
        html: renderTemplate(settings.email_survey_complete_html || DEFAULT_SURVEY_COMPLETE_HTML, vars),
    });
}

/**
 * Sends a notification when an administrator re-opens a completed survey.
 */
export async function sendSurveyReopenedEmail({ to, fullName, reason }) {
    if (!isValidEmail(to)) {
        throw new Error(`Невалидный email-адрес: ${to}`);
    }

    const orgName = env.ORG_NAME || 'ProcessMeter';
    const settings = await loadSettings('email_%');
    const vars = { full_name: fullName, org_name: orgName, reason };

    return sendMail({
        to,
        subject: renderTemplate(settings.email_survey_reopened_subject || DEFAULT_SURVEY_REOPENED_SUBJECT, vars),
        html: renderTemplate(settings.email_survey_reopened_html || DEFAULT_SURVEY_REOPENED_HTML, vars),
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
