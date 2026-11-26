import { useState } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar';
import { Dialog } from '@/components/Dialog/Dialog';
import { Icon } from '@/components/icons/Icon';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import type { Profile, ProfileInput } from '@/lib/profiles/profiles';
import { ProfileEditor } from './ProfileEditor';
import { RosterPicker } from './RosterPicker';
import styles from './PlayerSlots.module.css';

export interface PlayerSlotsProps {
  readonly count: 1 | 2;
  readonly onCount: (count: 1 | 2) => void;
  readonly ids: readonly (string | null)[];
  readonly onPick: (slot: 0 | 1, id: string | null) => void;
  readonly profiles: readonly Profile[];
  readonly allProfiles: readonly Profile[];
  readonly onAddProfile: (input: ProfileInput) => Profile | null;
  readonly singleProfileOnly?: boolean;
}

export function PlayerSlots({
  count,
  onCount,
  ids,
  onPick,
  profiles,
  allProfiles,
  onAddProfile,
  singleProfileOnly = false,
}: PlayerSlotsProps) {
  const t = useT();
  const calm = useCalmMotion();
  const audio = useAudio();
  const [activeSlot, setActiveSlot] = useState<0 | 1 | null>(null);
  const [editorForSlot, setEditorForSlot] = useState<0 | 1 | null>(null);

  const visibleSlots: readonly (0 | 1)[] = singleProfileOnly || count === 1 ? [0] : [0, 1];
  const currentId = activeSlot !== null ? ids[activeSlot] : null;

  return (
    <div className={styles.wrap}>
      {!singleProfileOnly && (
        <div className={styles.countRow} role="group" aria-label={t('intro.playerCount')}>
          {([1, 2] as const).map((n) => {
            const selected = count === n;
            return (
              <m.button
                key={n}
                type="button"
                className={`${styles.countBtn} ${selected ? styles.countSelected : ''}`}
                aria-pressed={selected}
                data-player-count={n}
                onClick={() => {
                  audio.sfx('tap');
                  onCount(n);
                }}
                {...pressProps(calm)}
              >
                <Icon name={n === 1 ? 'play' : 'users'} size={20} />
                <span>{n === 1 ? t('intro.oneChild') : t('intro.twoChildren')}</span>
              </m.button>
            );
          })}
        </div>
      )}

      <div className={styles.slotsRow}>
        {visibleSlots.map((slot) => {
          const prof = ids[slot] ? profiles.find((p) => p.id === ids[slot]) : undefined;
          const fallbackAvatar = slot === 0 ? 'kelinci' : 'kucing';
          const fallbackColor = slot === 0 ? 'biru' : 'merah-muda';
          const label = prof
            ? prof.name
            : singleProfileOnly
              ? t('profiles.guest')
              : t('intro.guestSlot', { n: slot + 1 });

          return (
            <m.button
              key={slot}
              type="button"
              className={styles.slotBtn}
              data-player-slot={slot + 1}
              onClick={() => {
                audio.sfx('tap');
                setActiveSlot(slot);
              }}
              {...pressProps(calm)}
            >
              <span
                className={styles.avatar}
                style={{
                  background: `var(--player-${prof ? prof.color : fallbackColor})`,
                }}
              >
                <AnimalAvatar animal={prof ? prof.avatar : fallbackAvatar} size={30} />
              </span>
              <span className={styles.slotName}>{label}</span>
            </m.button>
          );
        })}
      </div>

      <Dialog
        open={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        labelledBy="pick-player-title"
      >
        {activeSlot !== null && (
          <div className={styles.sheet}>
            <h2 id="pick-player-title" className={`t-title ${styles.sheetTitle}`}>
              {t('intro.pickProfile')}
            </h2>
            <RosterPicker
              profiles={profiles}
              selected={currentId ? [currentId] : []}
              max={1}
              onChange={(picked) => {
                onPick(activeSlot, picked[0] ?? null);
                setActiveSlot(null);
              }}
              showGuest
              onSelectGuest={() => {
                onPick(activeSlot, null);
                setActiveSlot(null);
              }}
              onAdd={() => {
                const target = activeSlot;
                setActiveSlot(null);
                setEditorForSlot(target);
              }}
            />
          </div>
        )}
      </Dialog>

      <ProfileEditor
        open={editorForSlot !== null}
        profiles={allProfiles}
        onSave={(input) => {
          const created = onAddProfile(input);
          if (created && editorForSlot !== null) {
            onPick(editorForSlot, created.id);
          }
          setEditorForSlot(null);
        }}
        onClose={() => setEditorForSlot(null)}
      />
    </div>
  );
}
