export const LABELS = {
    SEARCH: 'SEARCH',
} as const;
export type Label = (typeof LABELS)[keyof typeof LABELS]

export const ACTOR_STATE = 'ACTOR_STATE';
export const BASE_URL = 'https://humblebundle.com';
