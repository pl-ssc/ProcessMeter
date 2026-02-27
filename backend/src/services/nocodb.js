import { env } from '../config/env.js';

class NocoDBClient {
    constructor() {
        this.baseUrl = env.NOCODB_URL || '';
        if (this.baseUrl && !this.baseUrl.endsWith('/')) {
            this.baseUrl += '/';
        }
        this.token = env.NOCODB_API_TOKEN;

        this.baseIdCache = null;
    }

    get authHeaders() {
        return {
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
            throw new Error(`Failed to fetch NocoDB projects, status: ${baseRes.status}`);
        }

        const bases = await baseRes.json();
        const baseId = bases?.list?.[0]?.id;

        if (!baseId) throw new Error('No bases found in NocoDB');

        this.baseIdCache = baseId;
        return baseId;
    }

    async getUsers(logger) {
        try {
            const baseId = await this.getBaseId(logger);
            const usersRes = await fetch(`${this.baseUrl}api/v2/meta/bases/${baseId}/users`, { headers: this.authHeaders });

            if (!usersRes.ok) {
                if (logger) logger.error(`Failed to fetch NocoDB users, status: ${usersRes.status}`);
                throw new Error('Failed to fetch NocoDB users');
            }

            const data = await usersRes.json();
            return data.users?.list || [];
        } catch (err) {
            throw err;
        }
    }

    async inviteUser(email, roles, logger) {
        try {
            const baseId = await this.getBaseId(logger);

            const inviteRes = await fetch(`${this.baseUrl}api/v2/meta/bases/${baseId}/users`, {
                method: 'POST',
                headers: this.authHeaders,
                body: JSON.stringify({ email, roles })
            });

            if (!inviteRes.ok) {
                const errorText = await inviteRes.text();
                if (logger) logger.error('NocoDB Invite Error: ' + errorText);
                throw new Error('Failed to invite user to NocoDB');
            }

            const contentType = inviteRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await inviteRes.json();
            }

            return { msg: 'User invited successfully' };
        } catch (err) {
            throw err;
        }
    }
}

// Export a singleton instance
export const nocodbClient = new NocoDBClient();
