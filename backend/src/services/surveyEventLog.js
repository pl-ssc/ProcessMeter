import { query } from '../db/index.js';

export async function recordSurveyEvent(db, { userId, actorUserId = null, eventType, reason = null, payload = {} }) {
    const run = typeof db === 'function' ? db : db?.query?.bind(db) || query;
    const { rows } = await run(
        `INSERT INTO survey_event_log (user_id, actor_user_id, event_type, reason, payload)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         RETURNING id, user_id, actor_user_id, event_type, reason, payload, created_at`,
        [userId, actorUserId, eventType, reason, JSON.stringify(payload)]
    );

    return rows[0];
}
