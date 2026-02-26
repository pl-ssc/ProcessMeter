import { env } from '../../config/env.js';

export default async function adminNocodbRoutes(fastify, options) {
    const baseUrl = env.NOCODB_URL;
    const token = env.NOCODB_API_TOKEN;
    const authHeaders = {
        'xc-token': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    // Helper: получить ID базы
    async function getBaseId() {
        if (!baseUrl || !token) {
            throw new Error('NocoDB credentials (NOCODB_URL, NOCODB_API_TOKEN) are not configured on the server');
        }

        const wsRes = await fetch(`${baseUrl}api/v1/workspaces`, { headers: authHeaders });
        if (!wsRes.ok) throw new Error(`Failed to fetch workspaces, status: ${wsRes.status}`);
        const wsData = await wsRes.json();
        const workspaceId = wsData?.list?.[0]?.id;

        if (!workspaceId) throw new Error('No workspaces found');

        const baseRes = await fetch(`${baseUrl}api/v1/workspaces/${workspaceId}/bases`, { headers: authHeaders });
        if (!baseRes.ok) throw new Error('Failed to fetch bases');
        const bases = await baseRes.json();

        const baseId = bases?.list?.[0]?.id;
        if (!baseId) throw new Error('No bases found in workspace');

        return baseId;
    }

    fastify.get('/users', { preHandler: [fastify.authenticate, fastify.requireAdminRole] }, async (request, reply) => {
        try {
            const baseId = await getBaseId();
            const usersRes = await fetch(`${baseUrl}api/v2/meta/bases/${baseId}/users`, { headers: authHeaders });

            if (!usersRes.ok) {
                return reply.code(usersRes.status).send({ error: 'Failed to fetch NocoDB users' });
            }

            const data = await usersRes.json();
            return { users: data.users?.list || [] };
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({ error: `NocoDB Error: ${err.message || 'Unknown network error'}` });
        }
    });

    fastify.post('/users', {
        preHandler: [fastify.authenticate, fastify.requireAdminRole],
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    roles: { type: 'string', enum: ['owner', 'creator', 'editor', 'commenter', 'viewer'], default: 'editor' }
                },
                required: ['email']
            }
        }
    }, async (request, reply) => {
        try {
            const baseId = await getBaseId();
            const { email, roles } = request.body;

            const inviteRes = await fetch(`${baseUrl}api/v2/meta/bases/${baseId}/users`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ email, roles })
            });

            if (!inviteRes.ok) {
                const errorText = await inviteRes.text();
                request.log.error('NocoDB Invite Error: ' + errorText);
                return reply.code(inviteRes.status).send({ error: 'Failed to invite user to NocoDB' });
            }

            try {
                const data = await inviteRes.json();
                return data;
            } catch (e) {
                return { msg: 'User invited successfully' };
            }
        } catch (err) {
            request.log.error(err);
            return reply.code(500).send({ error: `NocoDB Error: ${err.message || 'Unknown network error'}` });
        }
    });
}
