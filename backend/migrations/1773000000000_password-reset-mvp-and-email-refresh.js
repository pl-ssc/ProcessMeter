export const shorthands = undefined;

const inviteHtml = `
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

const resetHtml = `
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

const surveyHtml = `
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

export const up = (pgm) => {
    pgm.sql(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_changed_at timestamptz;

        UPDATE users
        SET password_changed_at = COALESCE(password_changed_at, now());

        ALTER TABLE users
        ALTER COLUMN password_changed_at SET DEFAULT now();

        UPDATE settings SET value = 'Приглашение в {{org_name}}' WHERE key = 'email_invite_subject';
        UPDATE settings SET value = $invite$${inviteHtml}$invite$ WHERE key = 'email_invite_html';

        UPDATE settings SET value = 'Сброс пароля в {{org_name}}' WHERE key = 'email_reset_subject';
        UPDATE settings SET value = $reset$${resetHtml}$reset$ WHERE key = 'email_reset_html';

        UPDATE settings SET value = 'Спасибо за участие в {{org_name}}' WHERE key = 'email_survey_complete_subject';
        UPDATE settings SET value = $survey$${surveyHtml}$survey$ WHERE key = 'email_survey_complete_html';
    `);
};

export const down = (pgm) => {
    pgm.sql(`
        ALTER TABLE users
        DROP COLUMN IF EXISTS password_changed_at;
    `);
};
