import type { id } from './id';

export type MessageKey = keyof typeof id;
export type Messages = Record<MessageKey, string>;
