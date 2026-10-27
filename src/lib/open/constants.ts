// Plain module (no DB / server-only imports): safe for schema, server, and client code.

export const OPEN_EVENT_STATUS = {
  DRAFT: 'draft',
  LIVE: 'live',
  CLOSED: 'closed',
} as const;

export const openEventStatusTuple = Object.values(OPEN_EVENT_STATUS) as [string, ...string[]];

export const OPEN_WEIGHT_UNIT = {
  LB: 'lb',
  KG: 'kg',
} as const;

export const openWeightUnitTuple = Object.values(OPEN_WEIGHT_UNIT) as [string, ...string[]];

export const OPEN_RULE_CADENCE = {
  PER_WEEK: 'per_week',
  ONCE_PER_EVENT: 'once_per_event',
  UNLIMITED: 'unlimited',
} as const;

export const openRuleCadenceTuple = Object.values(OPEN_RULE_CADENCE) as [string, ...string[]];

export const OPEN_SCORE_TYPE = {
  TIME: 'time',
  REPS: 'reps',
  ROUNDS_REPS: 'rounds_reps',
  LOAD: 'load',
  POINTS: 'points',
} as const;

export const openScoreTypeTuple = Object.values(OPEN_SCORE_TYPE) as [string, ...string[]];

export const OPEN_AUDIT_VERB = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export const openAuditVerbTuple = Object.values(OPEN_AUDIT_VERB) as [string, ...string[]];

export const OPEN_AUDIT_ENTITY = {
  EVENT: 'event',
  WEEK: 'week',
  TEAM: 'team',
  TEAM_COACH: 'team_coach',
  COACH: 'coach',
  ENTRY: 'entry',
  PARTICIPANT: 'participant',
  RULE: 'rule',
  SCALING: 'scaling',
  WORKOUT: 'workout',
  AWARD: 'award',
  SCORE: 'score',
} as const;

export const openAuditEntityTuple = Object.values(OPEN_AUDIT_ENTITY) as [string, ...string[]];
