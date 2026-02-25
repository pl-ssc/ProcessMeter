import pg from 'pg';
import pool from '../../db/index.js';

export default async function adminImportRoutes(fastify, options) {
    fastify.post('/import', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    connectionString: { type: 'string', minLength: 1 }
                },
                required: ['connectionString']
            }
        }
    }, async (request, reply) => {
        const { connectionString } = request.body;

        const sourcePool = new pg.Pool({ connectionString });
        let client = null;
        try {
            client = await pool.connect();
            await client.query('BEGIN');

            const tables = ['process_4', 'process_3', 'process_2', 'process_1', 'systems', 'executors'];
            await client.query(`TRUNCATE TABLE ${tables.join(', ')} CASCADE`);

            const insertTable = async (table, columns) => {
                const { rows } = await sourcePool.query(`SELECT ${columns.join(', ')} FROM ${table}`);
                if (rows.length === 0) return;

                const CHUNK_SIZE = 2000;
                for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                    const chunk = rows.slice(i, i + CHUNK_SIZE);
                    const values = [];
                    const placeholders = [];

                    chunk.forEach((row, rowIndex) => {
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
                }
            };

            await insertTable('process_1', ['f1_index', 'f1_name', 'note', 'is_active', 'sort']);
            await insertTable('process_2', ['f2_index', 'f1_index', 'f2_name', 'sort', 'note', 'is_active']);
            await insertTable('process_3', ['f3_index', 'f2_index', 'f3_name', 'sort', 'note', 'is_active']);
            await insertTable('executors', ['id', 'name', 'note']);
            await insertTable('process_4', ['f4_index', 'f3_index', 'f4_name', 'sort', 'note', 'is_active', 'executor_id']);
            await insertTable('systems', ['system_id', 'system_name', 'is_active']);

            // Migrate refdb fX_index references to local auto-generated IDs
            await client.query(`
                UPDATE process_2 p2 SET process_1_id = p1.id FROM process_1 p1 WHERE p2.f1_index = p1.f1_index;
                UPDATE process_3 p3 SET process_2_id = p2.id FROM process_2 p2 WHERE p3.f2_index = p2.f2_index;
                UPDATE process_4 p4 SET process_3_id = p3.id FROM process_3 p3 WHERE p4.f3_index = p3.f3_index;
            `);

            await client.query('COMMIT');
        } catch (err) {
            if (client) await client.query('ROLLBACK');
            request.log.error(err);
            return reply.code(500).send({ error: 'import failed' });
        } finally {
            if (client) client.release();
            await sourcePool.end();
        }

        return { ok: true };
    });
}
