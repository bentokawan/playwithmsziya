import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { TopNav } from '@/components/TopNav/TopNav';
import { CATALOG } from '@/games/catalog';
import { useT } from '@/i18n/useT';
import { useContent } from '@/lib/content/useContent';
import { contentFingerprint, type RoomPlayerInfo, type RoomRole } from '@/lib/room/protocol';
import type { HostMatchConfig, RoomError } from '@/lib/room/roomReducer';
import { useRoomSession } from '@/lib/room/useRoomSession';
import { buildSessionSearch } from '@/lib/session/session';
import styles from './RoomPage.module.css';

export interface RoomLobbyProps {
  readonly code: string;
  readonly role: RoomRole;
  readonly localPlayer: RoomPlayerInfo;
  readonly profileId?: string;
  readonly hostConfig?: HostMatchConfig;
  readonly onBack: () => void;
  readonly onRetry?: () => void;
}

function errorKeyFor(err: RoomError | null) {
  switch (err) {
    case 'no-host':
      return 'room.errNoHost' as const;
    case 'full':
      return 'room.errFull' as const;
    case 'content-mismatch':
      return 'room.errContent' as const;
    case 'closed':
      return 'room.errClosed' as const;
    case 'replaced':
      return 'room.errReplaced' as const;
    case 'timeout':
      return 'room.errTimeout' as const;
    default:
      return 'room.errOffline' as const;
  }
}

export function RoomLobby({
  code,
  role,
  localPlayer,
  profileId,
  hostConfig,
  onBack,
  onRetry,
}: RoomLobbyProps) {
  const navigate = useNavigate();
  const audio = useAudio();
  const { content } = useContent();
  const t = useT();

  const fingerprint = useMemo(() => contentFingerprint(content), [content]);
  const session = useRoomSession({
    code,
    role,
    me: localPlayer,
    content: fingerprint,
    profileId,
    hostConfig,
  });
  const { state, setReady, confirmCountdownDone, leave } = session;

  const [copied, setCopied] = useState(false);
  const [countdownSec, setCountdownSec] = useState(3);
  const navigatedMatchRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.phase !== 'countdown' || !state.match) return;
    const match = state.match;
    const startedAt = Date.now();
    const totalMs = Math.max(300, match.countdownMs);

    const tick = () => {
      const remaining = Math.max(0, totalMs - (Date.now() - startedAt));
      setCountdownSec(Math.max(1, Math.ceil(remaining / 1000)));
      if (remaining <= 0 && navigatedMatchRef.current !== match.matchId) {
        navigatedMatchRef.current = match.matchId;
        confirmCountdownDone();
        const search = buildSessionSearch({
          gameId: match.gameId,
          difficulty: match.difficulty,
          mode: 'online',
          players: 1,
          profileIds: [profileId, undefined],
          room: code,
          locale: match.locale,
          seed: match.seed,
        });
        navigate(`/game/${match.gameId}/play?${search}`, { replace: true });
      }
    };

    tick();
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [code, confirmCountdownDone, navigate, profileId, state.match, state.phase]);

  // If peer already transitioned us to playing via sync, navigate immediately
  useEffect(() => {
    if (state.phase !== 'playing' || !state.match) return;
    if (navigatedMatchRef.current === state.match.matchId) return;
    navigatedMatchRef.current = state.match.matchId;
    const match = state.match;
    const search = buildSessionSearch({
      gameId: match.gameId,
      difficulty: match.difficulty,
      mode: 'online',
      players: 1,
      profileIds: [profileId, undefined],
      room: code,
      locale: match.locale,
      seed: match.seed,
    });
    navigate(`/game/${match.gameId}/play?${search}`, { replace: true });
  }, [code, navigate, profileId, state.match, state.phase]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/gabung/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore clipboard denial */
    }
  };

  const handleSpeakCode = () => {
    const locale = hostConfig?.locale ?? 'id';
    const digits = code.split('').map(Number);
    digits.forEach((digit, idx) => {
      if (Number.isNaN(digit)) return;
      window.setTimeout(() => {
        void audio.speak({ kind: 'num', locale, key: digit });
      }, idx * 550);
    });
  };

  const handleLeave = () => {
    leave();
    onBack();
  };

  const gameMeta = hostConfig ?? state.peerGameInfo;
  const gameTitle = gameMeta ? t(`game.${gameMeta.gameId}.title`) : '';
  const levelLabel = gameMeta ? t(`intro.level.${gameMeta.difficulty}`) : '';
  const hostBadgeMeta = gameMeta ? CATALOG[gameMeta.gameId] : null;

  return (
    <div className={styles.page}>
      <TopNav onBack={handleLeave} />

      <main className={styles.main}>
        <section className={styles.card} data-lobby-phase={state.phase}>
          {state.phase === 'connecting' && (
            <>
              <div className={styles.spinner} aria-hidden="true" />
              <h1 className={`t-title ${styles.title}`}>{t('room.connecting')}</h1>
              <BlockButton variant="white" size="choice" label={t('profiles.cancel')} onPress={handleLeave} />
            </>
          )}

          {state.phase === 'waiting' && role === 'host' && (
            <>
              {hostBadgeMeta && (
                <div className={styles.gameBadge}>
                  <span>{gameTitle}</span>
                  <span>·</span>
                  <span>{levelLabel}</span>
                </div>
              )}
              <h1 className={`t-title ${styles.title}`}>{t('room.hostTitle')}</h1>

              <button
                type="button"
                className={styles.codeBox}
                data-room-code={code}
                aria-label={`${t('room.hostTitle')} ${code.split('').join(' ')}`}
                onClick={handleSpeakCode}
              >
                {code.split('').map((d, i) => (
                  <span key={i} className={styles.digit}>
                    {d}
                  </span>
                ))}
              </button>

              <div className={styles.row}>
                <BlockButton
                  variant="white"
                  size="nav"
                  icon="listen"
                  label={t('play.listen')}
                  onPress={handleSpeakCode}
                />
                <BlockButton
                  variant="white"
                  size="nav"
                  icon="link"
                  label={copied ? t('room.copied') : t('room.copyLink')}
                  onPress={() => void handleCopyLink()}
                />
              </div>

              <div className={styles.playersRow}>
                <div className={styles.readyCard}>
                  <span
                    className={styles.readyAvatar}
                    style={{ background: `var(--player-${localPlayer.color})` }}
                  >
                    <AnimalAvatar animal={localPlayer.avatar} size={36} />
                  </span>
                  <span className={styles.readyName}>{localPlayer.name}</span>
                </div>
              </div>

              <p className={styles.waiting}>{t('room.waitingGuest')}</p>
            </>
          )}

          {state.phase === 'waiting' && role === 'guest' && (
            <>
              <div className={styles.spinner} aria-hidden="true" />
              <h1 className={`t-title ${styles.title}`}>{t('room.waitingHost')}</h1>
              <BlockButton variant="white" size="choice" label={t('profiles.cancel')} onPress={handleLeave} />
            </>
          )}

          {state.phase === 'ready-check' && (
            <>
              {role === 'guest' && state.peer && gameMeta && (
                <p className={styles.inviteText}>
                  {t('room.inviteText', {
                    name: state.peer.player.name,
                    game: gameTitle,
                    level: levelLabel,
                  })}
                </p>
              )}
              {role === 'host' && gameMeta && (
                <div className={styles.gameBadge}>
                  <span>{gameTitle}</span>
                  <span>·</span>
                  <span>{levelLabel}</span>
                </div>
              )}

              <div className={styles.readyGrid}>
                <div
                  className={`${styles.readyCard} ${state.meReady ? styles.readyCardDone : ''}`}
                  data-ready-self={String(state.meReady)}
                >
                  <span
                    className={styles.readyAvatar}
                    style={{ background: `var(--player-${localPlayer.color})` }}
                  >
                    <AnimalAvatar animal={localPlayer.avatar} size={42} />
                  </span>
                  <span className={styles.readyName}>{localPlayer.name}</span>
                  <span className={styles.readyStatus}>
                    {state.meReady ? t('room.readyDone') : t('room.readyWait')}
                  </span>
                </div>

                {state.peer && (
                  <div
                    className={`${styles.readyCard} ${state.peer.ready ? styles.readyCardDone : ''}`}
                    data-ready-peer={String(state.peer.ready)}
                  >
                    <span
                      className={styles.readyAvatar}
                      style={{ background: `var(--player-${state.peer.player.color})` }}
                    >
                      <AnimalAvatar animal={state.peer.player.avatar} size={42} />
                    </span>
                    <span className={styles.readyName}>{state.peer.player.name}</span>
                    <span className={styles.readyStatus}>
                      {state.peer.ready ? t('room.readyDone') : t('room.readyWait')}
                    </span>
                  </div>
                )}
              </div>

              <BlockButton
                variant={state.meReady ? 'pink' : 'primary'}
                size="primary"
                icon={state.meReady ? 'check' : 'play'}
                label={state.meReady ? t('room.cancelReady') : t('room.readyBtn')}
                aria-pressed={state.meReady}
                onPress={() => setReady(!state.meReady)}
              />
            </>
          )}

          {state.phase === 'countdown' && (
            <div className={styles.countdownBox} data-countdown={countdownSec}>
              <span className={styles.countdownNum}>{countdownSec}</span>
            </div>
          )}

          {(state.phase === 'error' || state.phase === 'closed') && (
            <>
              <p className={styles.error} role="alert">
                {t(errorKeyFor(state.error ?? 'closed'))}
              </p>
              <div className={styles.row}>
                <BlockButton
                  variant="primary"
                  size="choice"
                  icon="replay"
                  label={t('room.retry')}
                  onPress={() => {
                    leave();
                    if (onRetry) {
                      onRetry();
                    } else {
                      onBack();
                    }
                  }}
                />
                <BlockButton
                  variant="white"
                  size="choice"
                  icon="back"
                  label={t('nav.back')}
                  onPress={handleLeave}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
