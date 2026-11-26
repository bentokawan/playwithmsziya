import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { RosterPicker } from '@/components/Roster/RosterPicker';
import { TopNav } from '@/components/TopNav/TopNav';
import { useT } from '@/i18n/useT';
import { activeProfiles, loadProfiles } from '@/lib/profiles/profiles';
import type { RoomPlayerInfo } from '@/lib/room/protocol';
import { getActiveRoomController } from '@/lib/room/roomSession';
import { RoomLobby } from './RoomLobby';
import styles from './RoomPage.module.css';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;

export function JoinRoomPage() {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();
  const t = useT();

  const validRouteCode = routeCode && /^\d{4}$/.test(routeCode) ? routeCode : null;
  const profiles = useMemo(() => activeProfiles(loadProfiles()), []);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    profiles[0] ? [profiles[0].id] : [],
  );
  const [codeInput, setCodeInput] = useState<string>(validRouteCode ?? '');
  const [joinedCode, setJoinedCode] = useState<string | null>(() => {
    const existing = getActiveRoomController();
    if (existing && existing.state.role === 'guest' && existing.state.phase !== 'closed') {
      return existing.state.code;
    }
    return validRouteCode;
  });

  const selectedProfile = profiles.find((p) => p.id === selectedIds[0]);
  const localPlayer: RoomPlayerInfo = useMemo(
    () =>
      selectedProfile
        ? { name: selectedProfile.name, avatar: selectedProfile.avatar, color: selectedProfile.color }
        : { name: t('profiles.guest'), avatar: 'kucing', color: 'merah-muda' },
    [selectedProfile, t],
  );

  if (joinedCode) {
    return (
      <RoomLobby
        code={joinedCode}
        role="guest"
        localPlayer={localPlayer}
        profileId={selectedIds[0]}
        onBack={() => {
          setJoinedCode(null);
          if (validRouteCode) {
            navigate('/gabung', { replace: true });
          }
        }}
        onRetry={() => {
          setJoinedCode(null);
          setCodeInput('');
          if (validRouteCode) {
            navigate('/gabung', { replace: true });
          }
        }}
      />
    );
  }

  const handleDigit = (d: string) => {
    if (codeInput.length >= 4) return;
    setCodeInput((prev) => prev + d);
  };

  const handleBackspace = () => {
    setCodeInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className={styles.page}>
      <TopNav onBack={() => navigate('/home')} />
      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={`t-title ${styles.title}`}>{t('room.joinTitle')}</h1>

          {profiles.length > 0 && (
            <RosterPicker
              profiles={profiles}
              selected={selectedIds}
              max={1}
              onChange={setSelectedIds}
              showGuest
              onSelectGuest={() => setSelectedIds([])}
            />
          )}

          <p className={styles.subtitle}>{t('room.enterCode')}</p>
          <div className={styles.codeBox} aria-label={codeInput || '----'}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={styles.digit}>
                {codeInput[i] ?? '•'}
              </span>
            ))}
          </div>

          <div className={styles.keypad}>
            {DIGITS.map((d) => (
              <BlockButton
                key={d}
                variant="white"
                size="choice"
                label={d}
                onPress={() => handleDigit(d)}
              />
            ))}
            <BlockButton
              variant="white"
              size="choice"
              label={t('room.backspace')}
              onPress={handleBackspace}
            />
            <BlockButton
              variant="primary"
              size="choice"
              label={t('room.joinBtn')}
              disabled={codeInput.length !== 4}
              onPress={() => setJoinedCode(codeInput)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
