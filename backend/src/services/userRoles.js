const KNOWN_ROLES = ['admin', 'auditor', 'respondent'];

export function normalizeRoles(roles, fallbackRole = 'respondent') {
    const source = Array.isArray(roles) ? roles : [roles];
    const normalized = [];

    for (const role of source) {
        if (typeof role !== 'string') continue;
        const trimmed = role.trim().toLowerCase();
        if (!KNOWN_ROLES.includes(trimmed)) continue;
        if (!normalized.includes(trimmed)) {
            normalized.push(trimmed);
        }
    }

    if (normalized.includes('admin')) {
        return ['admin'];
    }

    if (normalized.length === 0 && KNOWN_ROLES.includes(fallbackRole)) {
        normalized.push(fallbackRole);
    }

    return normalized;
}

export function pickActiveRole({ roles, preferredRole, fallbackRole = 'respondent' }) {
    const normalizedRoles = normalizeRoles(roles, fallbackRole);

    if (preferredRole && normalizedRoles.includes(preferredRole)) {
        return preferredRole;
    }

    if (normalizedRoles.includes(fallbackRole)) {
        return fallbackRole;
    }

    return normalizedRoles[0] || fallbackRole;
}

export function hasRole(user, role) {
    if (!user || !role) return false;
    const roles = normalizeRoles(user.roles ?? user.role, user.role);
    return roles.includes(role);
}

export function buildSessionUser(userRow, process1Access = []) {
    const roles = normalizeRoles(userRow.roles, userRow.role);
    const activeRole = pickActiveRole({
        roles,
        preferredRole: userRow.active_role,
        fallbackRole: 'respondent',
    });

    return {
        id: userRow.id,
        username: userRow.username,
        full_name: userRow.full_name,
        role: activeRole,
        active_role: activeRole,
        roles,
        process_1_access: process1Access,
    };
}
