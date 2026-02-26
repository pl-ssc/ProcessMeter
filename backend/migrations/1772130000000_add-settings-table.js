export const shorthands = undefined;

export const up = (pgm) => {
    pgm.sql(`
        CREATE TABLE IF NOT EXISTS settings (
            key        text PRIMARY KEY,
            value      text,
            updated_at timestamptz DEFAULT now()
        );

        -- Seed default SMTP keys so the admin UI always has something to display
        INSERT INTO settings (key, value) VALUES
            ('smtp_host',      ''),
            ('smtp_port',      '587'),
            ('smtp_user',      ''),
            ('smtp_password',  ''),
            ('smtp_from',      ''),
            ('smtp_from_name', ''),
            ('smtp_secure',    'false')
        ON CONFLICT (key) DO NOTHING;
    `);
};

export const down = (pgm) => {
    pgm.sql('DROP TABLE IF EXISTS settings;');
};
