import { env } from '../config/env.js';

class NocoDBClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl || '';
        if (this.baseUrl && !this.baseUrl.endsWith('/')) {
            this.baseUrl += '/';
        }

        this.token = token ? token.trim() : '';
        this.baseIdCache = null;

        this.authHeaders = {
            'xc-token': this.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

    async getBaseId(logger) {
        if (!this.baseUrl || !this.token) {
            throw new Error('NocoDB credentials (NOCODB_URL, NOCODB_API_TOKEN) are not configured on the server');
        }

        if (this.baseIdCache) {
            return this.baseIdCache;
        }

        const baseRes = await fetch(`${this.baseUrl}api/v1/db/meta/projects`, { headers: this.authHeaders });
        if (!baseRes.ok) {
            const errorText = await baseRes.text();
            if (logger) logger.error('NocoDB Error (fetch projects): ' + errorText);

            const err = new Error(`Failed to fetch NocoDB projects, status: ${baseRes.status}`);
            err.status = baseRes.status;
            throw err;
        }

        const bases = await baseRes.json();
        const baseId = bases?.list?.[0]?.id;

        if (!baseId) {
            const err = new Error('No bases found in NocoDB');
            err.status = 404;
            throw err;
        }

        this.baseIdCache = baseId;
        return baseId;
    }

    async getUsers(logger) {
        const baseId = await this.getBaseId(logger);
        const usersRes = await fetch(`${this.baseUrl}api/v2/meta/bases/${baseId}/users`, { headers: this.authHeaders });

        if (!usersRes.ok) {
            if (usersRes.status === 404) {
                this.baseIdCache = null; // Invalidate cache if base is deleted/recreated
            }
            if (logger) logger.error(`Failed to fetch NocoDB users, status: ${usersRes.status}`);

            const err = new Error('Failed to fetch NocoDB users');
            err.status = usersRes.status;
            throw err;
        }

        const data = await usersRes.json();
        return data.users?.list || [];
    }

    async inviteUser(email, roles, logger) {
        const baseId = await this.getBaseId(logger);

        const inviteRes = await fetch(`${this.baseUrl}api/v2/meta/bases/${baseId}/users`, {
            method: 'POST',
            headers: this.authHeaders,
            body: JSON.stringify({ email, roles })
        });

        if (!inviteRes.ok) {
            if (inviteRes.status === 404) {
                this.baseIdCache = null; // Invalidate cache
            }
            const errorText = await inviteRes.text();
            if (logger) logger.error('NocoDB Invite Error: ' + errorText);

            const err = new Error('Failed to invite user to NocoDB');
            err.status = inviteRes.status;
            throw err;
        }

        const contentType = inviteRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await inviteRes.json();
        }

        return { msg: 'User invited successfully' };
    }
}

// Export a singleton instance using env injection
export const nocodbClient = new NocoDBClient(env.NOCODB_URL, env.NOCODB_API_TOKEN);
