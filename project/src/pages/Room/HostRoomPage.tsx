import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/app/providers/usePreferences';
import { CATALOG } from '@/games/catalog';
import { isGameId } from '@/games/ids';
import { useT } from '@/i18n/useT';
import { activeProfiles, loadProfiles } from '@/lib/profiles/profiles';
import { newRoomCode, type RoomPlayerInfo } from '@/lib/room/protocol';
import type { HostMatchConfig } from '@/lib/room/roomReducer';
import { getActiveRoomController } from '@/lib/room/roomSession';
import { newSeed, parseSessionConfig } from '@/lib/session/session';
import { RoomLobby } from './RoomLobby';
import styles from './RoomPage.module.css';

export function HostRoomPage() {
  const { gameId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { prefs } = usePreferences();
  const t = useT();

  const validId = isGameId(gameId) ? gameId : null;
  const entry = validId ? CATALOG[validId] : null;
  const profiles = useMemo(() => activeProfiles(loadProfiles()), []);
  const parsed = useMemo(() => {
    if (!validId) return null;
    return parseSessionConfig(validId, searchParams, new Set(profiles.map((p) => p.id)));
  }, [validId, searchParams, profiles]);

  const localProfile = profiles.find((p) => p.id === parsed?.profileIds[0]);
  const localPlayer: RoomPlayerInfo = useMemo(
    () =>
      localProfile
        ? { name: localProfile.name, avatar: localProfile.avatar, color: localProfile.color }
        : { name: t('profiles.guest'), avatar: 'kelinci', color: 'biru' },
    [localProfile, t],
  );

  const [code, setCode] = useState<string>(() => {
    const existing = getActiveRoomController();
    if (existing && existing.state.role === 'host' && existing.state.phase !== 'closed') {
      return existing.state.code;
    }
    return newRoomCode();
  });

  const [seed] = useState(() => newSeed());
  const hostConfig: HostMatchConfig | undefined = useMemo(() => {
    if (!validId || !entry || !parsed) return undefined;
    return {
      gameId: validId,
      difficulty: parsed.difficulty,
      seed,
      locale: prefs.locale ?? 'id',
      totalRounds: entry.rounds[parsed.difficulty],
    };
  }, [entry, parsed, prefs.locale, seed, validId]);

  if (!validId || !entry || !parsed || !hostConfig) {
    return (
      <main className={styles.page}>
        <h1 className="t-title">{t('notFound.title')}</h1>
      </main>
    );
  }

  return (
    <RoomLobby
      code={code}
      role="host"
      localPlayer={localPlayer}
      profileId={parsed.profileIds[0]}
      hostConfig={hostConfig}
      onBack={() => navigate(`/game/${validId}/intro`)}
      onRetry={() => setCode(newRoomCode())}
    />
  );
}
