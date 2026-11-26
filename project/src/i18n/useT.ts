import { useCallback } from 'react';
import { usePreferences } from '@/app/providers/usePreferences';
import type { Locale } from '@/lib/session/session';
import { en } from './en';
import { id } from './id';
import type { MessageKey } from './types';

export type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: MessageKey, vars?: TranslateVars) => string;

const DICTS = { id, en } as const;

export function translate(locale: Locale, key: MessageKey, vars?: TranslateVars): string {
  const template: string = DICTS[locale][key];
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

export function useT(): TranslateFn {
  const { prefs } = usePreferences();
  const locale: Locale = prefs.locale ?? 'id';
  return useCallback((key: MessageKey, vars?: TranslateVars) => translate(locale, key, vars), [locale]);
}
