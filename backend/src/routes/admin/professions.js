import { query } from '../../db/index.js';

export default async function adminProfessionsRoutes(fastify, options) {
    // Получение всех профессий
    fastify.get('/', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async (request) => {
        const { rows } = await query('SELECT id, name, is_active FROM professions ORDER BY name');
        return { professions: rows };
    });

    // Создание профессии
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
                'INSERT INTO professions (name) VALUES ($1) RETURNING id, name, is_active',
                [name]
            );
            return { profession: rows[0] };
        } catch (err) {
            if (err.code === '23505') { // unique violation
                return reply.code(400).send({ error: 'Профессия с таким названием уже существует' });
            }
            request.log.error(err);
            return reply.code(500).send({ error: 'Ошибка создания профессии' });
        }
    });

    // Обновление профессии
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
                `UPDATE professions SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, is_active`,
                values
            );
            if (!rows[0]) return reply.code(404).send({ error: 'Профессия не найдена' });
            return { profession: rows[0] };
        } catch (err) {
            if (err.code === '23505') {
                return reply.code(400).send({ error: 'Профессия с таким названием уже существует' });
            }
            request.log.error(err);
            return reply.code(500).send({ error: 'Ошибка обновления профессии' });
        }
    });
}
