import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { usePreferences } from '@/app/providers/usePreferences';
import assetsMdRaw from '@/assets/ASSETS.md?raw';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { Dialog } from '@/components/Dialog/Dialog';
import { CATALOG_LIST } from '@/games/catalog';
import type { GameId } from '@/games/ids';
import { useT } from '@/i18n/useT';
import { useContent } from '@/lib/content/useContent';
import { saveProfiles } from '@/lib/profiles/profiles';
import { clearRecords } from '@/lib/scores/records';
import type { DifficultyId } from '@/lib/session/session';
import { saveStickers } from '@/lib/stickers/stickers';
import {
  clampTimerSec,
  formatCountdown,
  MAX_TIMER_SEC,
  MIN_TIMER_SEC,
  resolveSessionDurationMs,
  TIME_LIMIT_MS,
  TIMER_STEP_SEC,
  type GameTimerOverrides,
  type TimerLimitsByDifficulty,
} from '@/lib/timer/countdown';
import styles from './ParentsPage.module.css';

type ResetTarget = 'scores' | 'playersAndScores' | 'stickers';
type TimerScope = 'all' | GameId;
const DIFFICULTIES: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];

function parseMarkdownRows(md: string): string[] {
  return md
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && !line.startsWith('| ---') && !line.startsWith('| file'))
    .map((line) =>
      line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(' · '),
    )
    .filter(Boolean);
}

interface SettingSwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onToggle: () => void;
}

function SettingSwitch({ label, checked, onToggle }: SettingSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles.switchRow}
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className={`${styles.track} ${checked ? styles.trackOn : ''}`} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </button>
  );
}

export function ParentsPage() {
  const navigate = useNavigate();
  const audio = useAudio();
  const { prefs, update } = usePreferences();
  const { content } = useContent();
  const t = useT();
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [typedConfirm, setTypedConfirm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [timerScope, setTimerScope] = useState<TimerScope>('all');

  const timedGames = useMemo(
    () => CATALOG_LIST.filter((entry) => entry.status === 'ready' && entry.timed),
    [],
  );

  const getTimerSec = (scope: TimerScope, diff: DifficultyId): number => {
    if (scope === 'all') {
      const custom = prefs.timerLimits?.[diff];
      return typeof custom === 'number' ? custom : Math.round(TIME_LIMIT_MS[diff] / 1000);
    }
    return Math.round(resolveSessionDurationMs(scope, diff, prefs) / 1000);
  };

  const isCustomForScope = (scope: TimerScope, diff: DifficultyId): boolean => {
    if (scope === 'all') {
      return typeof prefs.timerLimits?.[diff] === 'number';
    }
    return typeof prefs.gameTimers?.[scope]?.[diff] === 'number';
  };

  const hasAnyOverrideInScope = (scope: TimerScope): boolean => {
    if (scope === 'all') {
      return DIFFICULTIES.some((d) => typeof prefs.timerLimits?.[d] === 'number');
    }
    return DIFFICULTIES.some((d) => typeof prefs.gameTimers?.[scope]?.[d] === 'number');
  };

  const adjustTimer = (diff: DifficultyId, deltaSec: number) => {
    const current = getTimerSec(timerScope, diff);
    const nextSec = clampTimerSec(current + deltaSec);
    if (timerScope === 'all') {
      const nextLimits: TimerLimitsByDifficulty = {
        ...(prefs.timerLimits ?? {}),
        [diff]: nextSec,
      };
      update({ timerLimits: nextLimits });
      return;
    }
    const nextGameTimers: GameTimerOverrides = {
      ...(prefs.gameTimers ?? {}),
      [timerScope]: {
        ...(prefs.gameTimers?.[timerScope] ?? {}),
        [diff]: nextSec,
      },
    };
    update({ gameTimers: nextGameTimers });
  };

  const resetTimerScope = () => {
    if (timerScope === 'all') {
      update({ timerLimits: undefined });
      return;
    }
    if (!prefs.gameTimers) return;
    const rest: Partial<Record<GameId, TimerLimitsByDifficulty>> = { ...prefs.gameTimers };
    delete rest[timerScope];
    update({ gameTimers: Object.keys(rest).length > 0 ? rest : undefined });
  };

  useEffect(() => {
    audio.setScene({ music: null, ambient: null });
  }, [audio]);

  const bundledCreditLines = useMemo(() => parseMarkdownRows(assetsMdRaw).slice(0, 15), []);

  const resetConfig = useMemo(() => {
    if (!resetTarget) return null;
    if (resetTarget === 'scores') {
      return {
        description: t('parents.resetScoresConfirm'),
        keyword: t('parents.resetScoresKeyword'),
        doneMessage: t('parents.resetScoresDone'),
      };
    }
    if (resetTarget === 'playersAndScores') {
      return {
        description: t('parents.resetAllPlayersConfirm'),
        keyword: t('parents.resetAllPlayersKeyword'),
        doneMessage: t('parents.resetAllPlayersDone'),
      };
    }
    return {
      description: t('parents.resetConfirm'),
      keyword: t('parents.resetStickersKeyword'),
      doneMessage: t('parents.resetStickersDone'),
    };
  }, [resetTarget, t]);

  const isConfirmMatch =
    resetConfig !== null &&
    typedConfirm.trim().toLocaleUpperCase() === resetConfig.keyword.toLocaleUpperCase();

  const openResetDialog = (target: ResetTarget) => {
    setResetTarget(target);
    setTypedConfirm('');
    setStatusMessage(null);
  };

  const closeResetDialog = () => {
    setResetTarget(null);
    setTypedConfirm('');
  };

  const handleConfirmReset = () => {
    if (!resetTarget || !resetConfig || !isConfirmMatch) return;
    if (resetTarget === 'scores') {
      clearRecords();
    } else if (resetTarget === 'playersAndScores') {
      saveProfiles([]);
      clearRecords();
    } else {
      saveStickers([]);
    }
    setStatusMessage(resetConfig.doneMessage);
    closeResetDialog();
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleConfirmReset();
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className="t-title">{t('parents.title')}</h1>
          <BlockButton
            variant="primary"
            size="nav"
            icon="check"
            label={t('parents.close')}
            onPress={() => navigate('/home')}
          />
        </header>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('parents.language')}</h2>
          <div className={styles.langRow}>
            <BlockButton
              variant={(prefs.locale ?? 'id') === 'id' ? 'pink' : 'white'}
              size="choice"
              label={t('lang.id')}
              ariaPressed={(prefs.locale ?? 'id') === 'id'}
              onPress={() => update({ locale: 'id' })}
            />
            <BlockButton
              variant={prefs.locale === 'en' ? 'pink' : 'white'}
              size="choice"
              label={t('lang.en')}
              ariaPressed={prefs.locale === 'en'}
              onPress={() => update({ locale: 'en' })}
            />
          </div>
        </section>

        <section className={styles.card}>
          <SettingSwitch
            label={t('parents.music')}
            checked={prefs.musicOn}
            onToggle={() => update({ musicOn: !prefs.musicOn })}
          />
          <SettingSwitch
            label={t('parents.hijaiyyahNature')}
            checked={prefs.hijaiyyahNatureOnly}
            onToggle={() => update({ hijaiyyahNatureOnly: !prefs.hijaiyyahNatureOnly })}
          />
          <SettingSwitch
            label={t('parents.calmMotion')}
            checked={prefs.calmMotion}
            onToggle={() => update({ calmMotion: !prefs.calmMotion })}
          />
          <SettingSwitch
            label={t('parents.thickLines')}
            checked={prefs.thickLines}
            onToggle={() => update({ thickLines: !prefs.thickLines })}
          />
        </section>

        <section className={styles.card} aria-labelledby="parents-timer-title">
          <h2 id="parents-timer-title" className={styles.cardTitle}>
            {t('parents.timerTitle')}
          </h2>

          <SettingSwitch
            label={t('parents.timerOn')}
            checked={prefs.timerOn}
            onToggle={() => update({ timerOn: !prefs.timerOn })}
          />

          {prefs.timerOn && (
            <div className={styles.timerConfig} data-timer-config="true">
              <p className={styles.timerHint}>{t('parents.timerHint')}</p>

              <div className={styles.timerScopeRow}>
                <label htmlFor="parents-timer-scope" className={styles.timerScopeLabel}>
                  {t('parents.timerScopeLabel')}
                </label>
                <select
                  id="parents-timer-scope"
                  className={styles.timerSelect}
                  value={timerScope}
                  onChange={(e) => setTimerScope(e.target.value as TimerScope)}
                >
                  <option value="all">{t('parents.timerScopeAll')}</option>
                  {timedGames.map((g) => {
                    const hasCustom = hasAnyOverrideInScope(g.id);
                    const suffix = hasCustom ? ` · ${t('parents.timerCustomBadge')}` : '';
                    return (
                      <option key={g.id} value={g.id}>
                        {`${t(`game.${g.id}.title`)}${suffix}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.timerGrid}>
                {DIFFICULTIES.map((diff) => {
                  const sec = getTimerSec(timerScope, diff);
                  const isCustom = isCustomForScope(timerScope, diff);
                  const levelLabel = t(`intro.level.${diff}`);
                  return (
                    <div
                      key={diff}
                      className={styles.timerRow}
                      data-timer-level={diff}
                    >
                      <div className={styles.timerLevelInfo}>
                        <span className={styles.timerLevelName}>{levelLabel}</span>
                        <span
                          className={
                            isCustom ? styles.timerBadgeCustom : styles.timerBadgeDefault
                          }
                        >
                          {isCustom
                            ? t('parents.timerCustomBadge')
                            : t('parents.timerDefaultBadge')}
                        </span>
                      </div>

                      <div className={styles.timerStepper}>
                        <button
                          type="button"
                          className={styles.stepBtn}
                          aria-label={`${t('parents.timerDecrease', { level: levelLabel })} −${TIMER_STEP_SEC}`}
                          disabled={sec <= MIN_TIMER_SEC}
                          onClick={() => adjustTimer(diff, -TIMER_STEP_SEC)}
                        >
                          −{TIMER_STEP_SEC}
                        </button>
                        <span className={styles.timerValue} data-timer-value={diff}>
                          <strong>{formatCountdown(sec * 1000)}</strong>
                          <small>{t('parents.timerSeconds', { n: sec })}</small>
                        </span>
                        <button
                          type="button"
                          className={styles.stepBtn}
                          aria-label={`${t('parents.timerIncrease', { level: levelLabel })} +${TIMER_STEP_SEC}`}
                          disabled={sec >= MAX_TIMER_SEC}
                          onClick={() => adjustTimer(diff, TIMER_STEP_SEC)}
                        >
                          +{TIMER_STEP_SEC}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasAnyOverrideInScope(timerScope) && (
                <div className={styles.timerResetRow}>
                  <button
                    type="button"
                    className={styles.timerResetBtn}
                    onClick={resetTimerScope}
                  >
                    {t('parents.timerReset')}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className={styles.card} aria-labelledby="parents-data-title">
          <h2 id="parents-data-title" className={styles.cardTitle}>
            {t('parents.dataTitle')}
          </h2>

          {statusMessage && (
            <p className={styles.successBanner} role="status" aria-live="polite" data-reset-status="true">
              {statusMessage}
            </p>
          )}

          <div className={styles.resetList}>
            <div className={styles.resetRow}>
              <div className={styles.resetInfo}>
                <strong className={styles.resetLabel}>{t('parents.resetScores')}</strong>
                <span className={styles.resetDesc}>{t('parents.resetScoresDesc')}</span>
              </div>
              <BlockButton
                variant="white"
                size="nav"
                label={t('parents.resetScores')}
                className={styles.resetBtn}
                onPress={() => openResetDialog('scores')}
              />
            </div>

            <div className={styles.resetRow}>
              <div className={styles.resetInfo}>
                <strong className={styles.resetLabel}>{t('parents.resetAllPlayers')}</strong>
                <span className={styles.resetDesc}>{t('parents.resetAllPlayersDesc')}</span>
              </div>
              <BlockButton
                variant="pink"
                size="nav"
                label={t('parents.resetAllPlayers')}
                className={styles.resetBtn}
                onPress={() => openResetDialog('playersAndScores')}
              />
            </div>

            <div className={styles.resetRow}>
              <div className={styles.resetInfo}>
                <strong className={styles.resetLabel}>{t('parents.resetStickers')}</strong>
                <span className={styles.resetDesc}>{t('parents.resetStickersDesc')}</span>
              </div>
              <BlockButton
                variant="white"
                size="nav"
                label={t('parents.resetStickers')}
                className={styles.resetBtn}
                onPress={() => openResetDialog('stickers')}
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('parents.about')}</h2>
          <p className="t-body">{t('parents.aboutBody')}</p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('parents.credits')}</h2>
          <ul className={`t-body ${styles.creditsList}`}>
            {content.source !== 'bundled' && content.credits.length > 0
              ? content.credits.map((c) => (
                  <li key={c.path}>{`${c.path} · ${c.license}${c.author ? ` · ${c.author}` : ''}`}</li>
                ))
              : bundledCreditLines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>
      </div>

      <Dialog
        open={resetConfig !== null}
        onClose={closeResetDialog}
        labelledBy="reset-dialog-title"
      >
        {resetConfig && (
          <form className={styles.confirmBody} onSubmit={handleFormSubmit}>
            <h2 id="reset-dialog-title" className={`t-title ${styles.confirmTitle}`}>
              {t('parents.confirmSureTitle')}
            </h2>
            <p className={`t-body ${styles.confirmDesc}`}>{resetConfig.description}</p>

            <div className={styles.typeField}>
              <label htmlFor="reset-confirm-input" className={styles.typeLabel}>
                {t('parents.typeToConfirm', { keyword: resetConfig.keyword })}
              </label>
              <code className={styles.keywordPill}>{resetConfig.keyword}</code>
              <input
                id="reset-confirm-input"
                type="text"
                className={styles.confirmInput}
                value={typedConfirm}
                onChange={(e) => setTypedConfirm(e.target.value)}
                placeholder={t('parents.typePlaceholder', { keyword: resetConfig.keyword })}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>

            <div className={styles.confirmActions}>
              <BlockButton
                variant="white"
                size="nav"
                label={t('profiles.cancel')}
                className={styles.dialogBtn}
                onPress={closeResetDialog}
              />
              <BlockButton
                variant="pink"
                size="nav"
                type="submit"
                label={t('parents.confirmAction')}
                className={styles.dialogBtn}
                disabled={!isConfirmMatch}
                onPress={handleConfirmReset}
              />
            </div>
          </form>
        )}
      </Dialog>
    </main>
  );
}
