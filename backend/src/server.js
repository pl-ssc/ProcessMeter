import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config(); // local (backend folder)
dotenv.config({ path: path.join(__dirname, '../../.env') }); // root folder

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import Pool from 'pg-pool';
import Client from 'pg/lib/client.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-admin-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || '';
const AUTO_MIGRATE = process.env.AUTO_MIGRATE !== 'false';
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '../../frontend/dist');

if (!TARGET_DATABASE_URL) {
  console.error('TARGET_DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: TARGET_DATABASE_URL });

console.log(`Connecting to database at ${TARGET_DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);

const app = Fastify({ logger: true });

const ensureSchema = async () => {
  console.log('Checking schema status...');
  if (!AUTO_MIGRATE) {
    console.log('AUTO_MIGRATE is false, skipping');
    return;
  }

  try {
    // Check if the users table already exists
    console.log('Querying information_schema for users table...');
    const { rows } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (rows[0].exists) {
      app.log.info('Schema already exists, skipping auto-migration');
      console.log('Schema already exists, skipping auto-migration');
      return;
    }

    const schemaPath = path.join(__dirname, '../../db/schema.sql');
    console.log(`Loading schema from ${schemaPath}`);
    if (!fs.existsSync(schemaPath)) {
      app.log.warn('Migration file schema.sql not found');
      console.log('Migration file schema.sql not found');
      return;
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    if (!sql.trim()) {
      console.log('Schema file is empty');
      return;
    }

    console.log('Applying schema SQL...');
    await pool.query(sql);
    app.log.info('Schema applied successfully');
    console.log('Schema applied successfully');
  } catch (err) {
    app.log.error(err, 'Failed to ensure schema');
    console.error('Failed to ensure schema:', err);
    throw err;
  }
};

const ensureAdminUser = async () => {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    app.log.warn('ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping admin creation');
    return;
  }

  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [ADMIN_USERNAME]);
    if (rows.length > 0) {
      app.log.info({ username: ADMIN_USERNAME }, 'Admin user already exists');
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
      [ADMIN_USERNAME, passwordHash, ADMIN_FULL_NAME || null, 'admin']
    );
    app.log.info({ username: ADMIN_USERNAME }, 'Admin user created successfully');
  } catch (err) {
    app.log.error(err, 'Failed to create admin user');
  }
};

await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
});

await app.register(jwt, { secret: JWT_SECRET });

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'unauthorized' });
  }
});

app.decorate('requireAdmin', async (request, reply) => {
  const key = request.headers['x-admin-key'];
  if (!key || key !== ADMIN_API_KEY) {
    reply.code(403).send({ error: 'forbidden' });
  }
});

app.decorate('requireAdminRole', async (request, reply) => {
  if (request.user?.role !== 'admin') {
    reply.code(403).send({ error: 'forbidden' });
  }
});

const query = (text, params) => pool.query(text, params);

app.get('/api/health', async () => ({ ok: true }));

app.post('/api/auth/login', async (request, reply) => {
  const { username, password } = request.body || {};
  if (!username || !password) {
    return reply.code(400).send({ error: 'username and password required' });
  }

  const { rows } = await query('SELECT id, username, password_hash, full_name, is_active, role FROM users WHERE username = $1', [username]);
  const user = rows[0];
  if (!user || !user.is_active) {
    return reply.code(401).send({ error: 'invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return reply.code(401).send({ error: 'invalid credentials' });
  }

  const token = app.jwt.sign({ sub: user.id, username: user.username, full_name: user.full_name, role: user.role });
  return { token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } };
});

app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request) => {
  return { user: request.user };
});

app.post('/api/users', { preHandler: [app.requireAdmin] }, async (request, reply) => {
  const { username, password, full_name, process_1_access } = request.body || {};
  if (!username || !password) {
    return reply.code(400).send({ error: 'username and password required' });
  }
  if (!Array.isArray(process_1_access) || process_1_access.length === 0) {
    return reply.code(400).send({ error: 'process_1_access required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
      [username, passwordHash, full_name || null, 'respondent']
    );
    const user = rows[0];

    const accessValues = process_1_access.map((f1_index) => [user.id, f1_index]);
    for (const [userId, f1Index] of accessValues) {
      await client.query(
        'INSERT INTO user_process_1_access (user_id, f1_index) VALUES ($1, $2)',
        [userId, f1Index]
      );
    }

    await client.query('SELECT copy_operations_to_user_answers($1)', [user.id]);
    await client.query('COMMIT');
    return { user };
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err);
    return reply.code(500).send({ error: 'create user failed' });
  } finally {
    client.release();
  }

  return reply.code(500).send({ error: 'unexpected' });
});

app.get('/api/admin/users', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request) => {
  const { search, role, status, include_admins } = request.query || {};

  const conditions = [];
  const params = [];
  let idx = 1;

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(username ILIKE $${idx} OR full_name ILIKE $${idx})`);
    idx += 1;
  }

  if (role && (role === 'admin' || role === 'respondent')) {
    params.push(role);
    conditions.push(`role = $${idx}`);
    idx += 1;
  }

  if (include_admins !== 'true') {
    conditions.push(`role <> 'admin'`);
  }

  if (status === 'active') {
    conditions.push('is_active = true');
  } else if (status === 'inactive') {
    conditions.push('is_active = false');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT u.id, u.username, u.full_name, u.role, u.is_active, u.created_at,
            COALESCE(count(a.f1_index), 0) AS access_count
     FROM users u
     LEFT JOIN user_process_1_access a ON a.user_id = u.id
     ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC, u.id DESC`,
    params
  );

  return { users: rows };
});

app.post('/api/admin/users', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request, reply) => {
  const { username, password, full_name, role, process_1_access } = request.body || {};
  if (!username || !password) {
    return reply.code(400).send({ error: 'username and password required' });
  }
  if (!Array.isArray(process_1_access) || process_1_access.length === 0) {
    return reply.code(400).send({ error: 'process_1_access required' });
  }

  const safeRole = role === 'admin' ? 'admin' : 'respondent';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
      [username, passwordHash, full_name || null, safeRole]
    );
    const user = rows[0];

    const accessValues = process_1_access.map((f1_index) => [user.id, f1_index]);
    for (const [userId, f1Index] of accessValues) {
      await client.query(
        'INSERT INTO user_process_1_access (user_id, f1_index) VALUES ($1, $2)',
        [userId, f1Index]
      );
    }

    if (safeRole === 'respondent') {
      await client.query('SELECT copy_operations_to_user_answers($1)', [user.id]);
    }

    await client.query('COMMIT');
    return { user };
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err);
    return reply.code(500).send({ error: 'create user failed' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/process-1', { preHandler: [app.authenticate, app.requireAdminRole] }, async () => {
  const { rows } = await query(
    `SELECT f1_index, f1_name
     FROM process_1
     WHERE is_active IS DISTINCT FROM false
     ORDER BY COALESCE(sort, 0), f1_name`
  );
  return { process_1: rows };
});

app.post('/api/admin/users/:id/reset-password', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request, reply) => {
  const { id } = request.params;
  const { password } = request.body || {};
  if (!password) {
    return reply.code(400).send({ error: 'password required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rowCount } = await query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );

  if (rowCount === 0) {
    return reply.code(404).send({ error: 'user not found' });
  }

  return { ok: true };
});

app.post('/api/admin/users/:id/status', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request, reply) => {
  const { id } = request.params;
  const { is_active } = request.body || {};
  if (typeof is_active !== 'boolean') {
    return reply.code(400).send({ error: 'is_active required' });
  }

  const { rowCount } = await query(
    'UPDATE users SET is_active = $1 WHERE id = $2',
    [is_active, id]
  );

  if (rowCount === 0) {
    return reply.code(404).send({ error: 'user not found' });
  }

  return { ok: true };
});

app.get('/api/admin/users/:id/access', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request) => {
  const { id } = request.params;
  const { rows } = await query(
    'SELECT f1_index FROM user_process_1_access WHERE user_id = $1 ORDER BY f1_index',
    [id]
  );
  return { process_1_access: rows.map((r) => r.f1_index) };
});

app.post('/api/admin/users/:id/access', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request, reply) => {
  const { id } = request.params;
  const { process_1_access } = request.body || {};
  if (!Array.isArray(process_1_access)) {
    return reply.code(400).send({ error: 'process_1_access required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_process_1_access WHERE user_id = $1', [id]);
    for (const f1Index of process_1_access) {
      await client.query(
        'INSERT INTO user_process_1_access (user_id, f1_index) VALUES ($1, $2)',
        [id, f1Index]
      );
    }
    await client.query('DELETE FROM user_answers WHERE user_id = $1', [id]);
    await client.query('SELECT copy_operations_to_user_answers($1)', [id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err);
    return reply.code(500).send({ error: 'update access failed' });
  } finally {
    client.release();
  }

  return { ok: true };
});

app.post('/api/admin/users/access-bulk', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request, reply) => {
  const { user_ids, process_1_access, mode } = request.body || {};
  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return reply.code(400).send({ error: 'user_ids required' });
  }
  if (!Array.isArray(process_1_access)) {
    return reply.code(400).send({ error: 'process_1_access required' });
  }
  const safeMode = mode === 'append' ? 'append' : 'replace';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const userId of user_ids) {
      if (safeMode === 'replace') {
        await client.query('DELETE FROM user_process_1_access WHERE user_id = $1', [userId]);
      }
      for (const f1Index of process_1_access) {
        await client.query(
          'INSERT INTO user_process_1_access (user_id, f1_index) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, f1Index]
        );
      }
      await client.query('DELETE FROM user_answers WHERE user_id = $1', [userId]);
      await client.query('SELECT copy_operations_to_user_answers($1)', [userId]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err);
    return reply.code(500).send({ error: 'bulk update failed' });
  } finally {
    client.release();
  }

  return { ok: true };
});

app.post('/api/admin/import', { preHandler: [app.authenticate, app.requireAdminRole] }, async (request, reply) => {
  const { connectionString } = request.body || {};
  if (!connectionString || typeof connectionString !== 'string') {
    return reply.code(400).send({ error: 'connectionString required' });
  }

  const sourcePool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tables = ['user_answers', 'user_process_1_access', 'process_4', 'process_3', 'process_2', 'process_1', 'systems', 'executors'];
    await client.query(`TRUNCATE TABLE ${tables.join(', ')} CASCADE`);

    const insertTable = async (table, columns) => {
      const { rows } = await sourcePool.query(`SELECT ${columns.join(', ')} FROM ${table}`);
      if (rows.length === 0) return;
      const values = [];
      const placeholders = [];
      rows.forEach((row, rowIndex) => {
        const rowPlaceholders = [];
        columns.forEach((col, colIndex) => {
          values.push(row[col]);
          rowPlaceholders.push(`$${rowIndex * columns.length + colIndex + 1}`);
        });
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
      });
      await client.query(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`,
        values
      );
    };

    await insertTable('process_1', ['f1_index', 'f1_name', 'note', 'is_active', 'sort']);
    await insertTable('process_2', ['f2_index', 'f1_index', 'f2_name', 'sort', 'note', 'is_active']);
    await insertTable('process_3', ['f3_index', 'f2_index', 'f3_name', 'sort', 'note', 'is_active']);
    await insertTable('executors', ['id', 'name', 'note']);
    await insertTable('process_4', ['f4_index', 'f3_index', 'f4_name', 'sort', 'note', 'is_active', 'executor_id']);
    await insertTable('systems', ['system_id', 'system_name', 'is_active']);

    // access table is now empty; admin should reassign access and answers will be generated on user creation

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err);
    return reply.code(500).send({ error: 'import failed' });
  } finally {
    client.release();
    await sourcePool.end();
  }

  return { ok: true };
});

app.get('/api/systems', { preHandler: [app.authenticate] }, async () => {
  const { rows } = await query(
    'SELECT system_id, system_name FROM systems WHERE is_active IS DISTINCT FROM false ORDER BY system_name'
  );
  return { systems: rows };
});

app.get('/api/processes', { preHandler: [app.authenticate] }, async () => {
  const { rows } = await query(
    `SELECT p3.f3_index, p3.f3_name, p2.f2_index, p2.f2_name, p1.f1_index, p1.f1_name
     FROM process_3 p3
     LEFT JOIN process_2 p2 ON p2.f2_index = p3.f2_index
     LEFT JOIN process_1 p1 ON p1.f1_index = p2.f1_index
     WHERE p3.is_active IS DISTINCT FROM false
     ORDER BY COALESCE(p1.sort, 0), COALESCE(p2.sort, 0), COALESCE(p3.sort, 0), p3.f3_name`
  );
  return { process_3: rows };
});

app.get('/api/answers', { preHandler: [app.authenticate] }, async (request) => {
  const userId = request.user.sub;
  const { f3_index } = request.query || {};

  const params = [userId];
  let filter = '';
  if (f3_index) {
    params.push(f3_index);
    filter = 'AND p4.f3_index = $2';
  }

  const { rows } = await query(
    `SELECT
        ua.id,
        ua.operation_id,
        ua.labor_hours,
        ua.system_id,
        ua.note,
        ua.is_done,
        ua.done_at,
        p4.f4_name,
        p4.f3_index,
        p3.f3_name,
        p2.f2_index,
        p2.f2_name,
        p1.f1_index,
        p1.f1_name,
        p4.executor_id,
        e.name AS executor_name
     FROM user_answers ua
     JOIN process_4 p4 ON p4.f4_index = ua.operation_id
     LEFT JOIN process_3 p3 ON p3.f3_index = p4.f3_index
     LEFT JOIN process_2 p2 ON p2.f2_index = p3.f2_index
     LEFT JOIN process_1 p1 ON p1.f1_index = p2.f1_index
     LEFT JOIN executors e ON e.id = p4.executor_id
     WHERE ua.user_id = $1
       AND p4.is_active IS DISTINCT FROM false
       ${filter}
     ORDER BY COALESCE(p1.sort, 0), COALESCE(p2.sort, 0), COALESCE(p3.sort, 0), COALESCE(p4.sort, 0), p4.f4_name`
    , params);

  return { answers: rows };
});

app.post('/api/answers/bulk', { preHandler: [app.authenticate] }, async (request, reply) => {
  const userId = request.user.sub;
  const { items } = request.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return reply.code(400).send({ error: 'items required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      const operationId = item.operation_id;
      if (!operationId) continue;

      const laborHours = item.labor_hours === '' || item.labor_hours === null ? null : item.labor_hours;
      const systemId = item.system_id === '' || item.system_id === null ? null : item.system_id;
      const note = item.note === '' || item.note === null ? null : item.note;

      await client.query(
        `UPDATE user_answers
         SET labor_hours = $1, system_id = $2, note = $3
         WHERE user_id = $4 AND operation_id = $5`,
        [laborHours, systemId, note, userId, operationId]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err);
    return reply.code(500).send({ error: 'bulk update failed' });
  } finally {
    client.release();
  }

  return { ok: true };
});

app.post('/api/answers/complete', { preHandler: [app.authenticate] }, async (request) => {
  const userId = request.user.sub;
  const { rows } = await query(
    `UPDATE user_answers
     SET is_done = true, done_at = now()
     WHERE user_id = $1 AND is_done IS DISTINCT FROM true
     RETURNING id`,
    [userId]
  );

  return { updated: rows.length };
});

if (fs.existsSync(STATIC_DIR)) {
  await app.register(fastifyStatic, {
    root: STATIC_DIR,
    prefix: '/',
  });

  app.setNotFoundHandler((request, reply) => {
    const indexPath = path.join(STATIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      reply.type('text/html').send(fs.createReadStream(indexPath));
      return;
    }
    reply.code(404).send({ error: 'not found' });
  });
}

ensureSchema()
  .then(() => ensureAdminUser())
  .then(() => {
    app.listen({ port: PORT, host: HOST }).catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
