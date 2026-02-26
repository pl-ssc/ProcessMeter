import { query } from '../../db/index.js';

export default async function adminDepartmentsRoutes(fastify, options) {
    // Получение всех подразделений
    fastify.get('/', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async (request) => {
        const { rows } = await query('SELECT id, name, is_active FROM departments ORDER BY name');
        return { departments: rows };
    });

    // Создание подразделения
    fastify.post('/', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: { name: { type: 'string', minLength: 1 } },
                required: ['name']
            }
        }
    }, async (request, reply) => {
        const { name } = request.body;
        try {
            const { rows } = await query(
                'INSERT INTO departments (name) VALUES ($1) RETURNING id, name, is_active',
                [name]
            );
            return { department: rows[0] };
        } catch (err) {
            if (err.code === '23505') { // unique violation
                return reply.code(400).send({ error: 'Подразделение с таким названием уже существует' });
            }
            request.log.error(err);
            return reply.code(500).send({ error: 'Ошибка создания подразделения' });
        }
    });

    // Обновление подразделения
    fastify.put('/:id', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                    is_active: { type: 'boolean' }
                }
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { name, is_active } = request.body;

        const updates = [];
        const values = [];
        let idx = 1;

        if (name !== undefined) {
            updates.push(`name = $${idx++}`);
            values.push(name);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${idx++}`);
            values.push(is_active);
        }

        if (updates.length === 0) return { ok: true };

        values.push(id);

        try {
            const { rows } = await query(
                `UPDATE departments SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, is_active`,
                values
            );
            if (!rows[0]) return reply.code(404).send({ error: 'Подразделение не найдено' });
            return { department: rows[0] };
        } catch (err) {
            if (err.code === '23505') {
                return reply.code(400).send({ error: 'Подразделение с таким названием уже существует' });
            }
            request.log.error(err);
            return reply.code(500).send({ error: 'Ошибка обновления подразделения' });
        }
    });
}
