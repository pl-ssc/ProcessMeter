export const shorthands = undefined;

export const up = (pgm) => {
    pgm.sql(`
        -- Token table for invitations and password resets
        CREATE TABLE IF NOT EXISTS password_tokens (
            id          bigserial PRIMARY KEY,
            user_id     integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token       text NOT NULL UNIQUE,
            type        text NOT NULL CHECK (type IN ('invite', 'reset')),
            expires_at  timestamptz NOT NULL,
            used_at     timestamptz,
            created_at  timestamptz DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS password_tokens_token_idx   ON password_tokens(token);
        CREATE INDEX IF NOT EXISTS password_tokens_user_id_idx ON password_tokens(user_id);

        -- Seed default email templates into settings
        INSERT INTO settings (key, value) VALUES
            ('email_invite_subject',
             'Приглашение в {{org_name}}'),
            ('email_invite_html',
             '<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#4f46e5">Добро пожаловать в {{org_name}}!</h2>
  <p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
  <p>Администратор создал для вас учётную запись в системе ProcessMeter.</p>
  <p>Для завершения регистрации и установки пароля перейдите по ссылке:</p>
  <p><a href="{{link}}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none">Установить пароль</a></p>
  <p style="color:#888;font-size:12px">Ссылка действительна 24 часа. Если вы не запрашивали приглашение — просто проигнорируйте это письмо.</p>
</div>'),
            ('email_reset_subject',
             'Сброс пароля — {{org_name}}'),
            ('email_reset_html',
             '<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#4f46e5">Сброс пароля</h2>
  <p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
  <p>Для установки нового пароля перейдите по ссылке:</p>
  <p><a href="{{link}}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none">Сбросить пароль</a></p>
  <p style="color:#888;font-size:12px">Ссылка действительна 24 часа. Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
</div>'),
            ('email_survey_complete_subject',
             'Опрос завершён — {{org_name}}'),
            ('email_survey_complete_html',
             '<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#4f46e5">Спасибо за участие!</h2>
  <p>Здравствуйте, <strong>{{full_name}}</strong>!</p>
  <p>Ваши ответы успешно сохранены. Благодарим за участие в оценке процессов.</p>
</div>')
        ON CONFLICT (key) DO NOTHING;
    `);
};

export const down = (pgm) => {
    pgm.sql(`
        DROP TABLE IF EXISTS password_tokens;
        DELETE FROM settings WHERE key LIKE 'email_%';
    `);
};
