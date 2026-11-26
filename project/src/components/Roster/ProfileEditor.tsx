import { useState } from 'react';
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { Dialog } from '@/components/Dialog/Dialog';
import { useT } from '@/i18n/useT';
import {
  ANIMAL_IDS,
  firstFreeCombo,
  isNameTaken,
  MAX_PROFILE_NAME_LEN,
  PLAYER_COLORS,
  type AnimalId,
  type PlayerColor,
  type Profile,
  type ProfileInput,
} from '@/lib/profiles/profiles';
import styles from './ProfileEditor.module.css';

export interface ProfileEditorProps {
  readonly open: boolean;
  readonly profiles: readonly Profile[];
  readonly initial?: Profile;
  readonly onSave: (input: ProfileInput) => void;
  readonly onClose: () => void;
}

function ProfileEditorForm({
  profiles,
  initial,
  onSave,
  onClose,
}: Omit<ProfileEditorProps, 'open'>) {
  const t = useT();
  const free = firstFreeCombo(profiles);
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState<AnimalId>(initial?.avatar ?? free.avatar);
  const [color, setColor] = useState<PlayerColor>(initial?.color ?? free.color);
  const [errorKey, setErrorKey] = useState<
    'profiles.errorName' | 'profiles.errorDuplicateName' | 'profiles.errorTaken' | null
  >(null);

  const isComboTaken = (a: AnimalId, c: PlayerColor) =>
    profiles.some(
      (p) => !p.archived && p.id !== initial?.id && p.avatar === a && p.color === c,
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_PROFILE_NAME_LEN) {
      setErrorKey('profiles.errorName');
      return;
    }
    if (isNameTaken(profiles, trimmed, initial?.id)) {
      setErrorKey('profiles.errorDuplicateName');
      return;
    }
    if (isComboTaken(avatar, color)) {
      setErrorKey('profiles.errorTaken');
      return;
    }
    onSave({ name: trimmed, avatar, color });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 id="profile-editor-title" className={`t-title ${styles.title}`}>
        {initial ? t('profiles.editTitle') : t('profiles.addTitle')}
      </h2>

      <div className={styles.preview}>
        <span
          className={styles.previewAvatar}
          style={{ background: `var(--player-${color})` }}
        >
          <AnimalAvatar animal={avatar} size={56} />
        </span>
        <span className={styles.previewName}>{name.trim() || t('profiles.namePlaceholder')}</span>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{t('profiles.nameLabel')}</span>
        <input
          type="text"
          className={styles.input}
          value={name}
          maxLength={MAX_PROFILE_NAME_LEN}
          enterKeyHint="done"
          placeholder={t('profiles.namePlaceholder')}
          onChange={(e) => {
            setName(e.target.value);
            setErrorKey(null);
          }}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>{t('profiles.avatarLabel')}</span>
        <div className={styles.animalGrid}>
          {ANIMAL_IDS.map((a) => {
            const taken = isComboTaken(a, color);
            const active = avatar === a;
            const label = t(`animal.${a}`);
            return (
              <button
                key={a}
                type="button"
                className={[
                  styles.pickBtn,
                  active ? styles.pickActive : '',
                  taken ? styles.pickTaken : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={label}
                aria-pressed={active}
                disabled={taken}
                onClick={() => {
                  setAvatar(a);
                  setErrorKey(null);
                }}
              >
                <AnimalAvatar animal={a} size={36} />
                <span className={styles.animalName}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>{t('profiles.colorLabel')}</span>
        <div className={styles.colorGrid}>
          {PLAYER_COLORS.map((c) => {
            const taken = isComboTaken(avatar, c);
            const active = color === c;
            return (
              <button
                key={c}
                type="button"
                className={[
                  styles.colorBtn,
                  active ? styles.pickActive : '',
                  taken ? styles.pickTaken : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ background: `var(--player-${c})` }}
                aria-label={c}
                aria-pressed={active}
                disabled={taken}
                onClick={() => {
                  setColor(c);
                  setErrorKey(null);
                }}
              />
            );
          })}
        </div>
      </div>

      {errorKey && (
        <p className={styles.error} role="alert">
          {t(errorKey)}
        </p>
      )}

      <div className={styles.actions}>
        <BlockButton variant="white" size="choice" label={t('profiles.cancel')} onPress={onClose} />
        <BlockButton
          type="submit"
          variant="primary"
          size="choice"
          label={t('profiles.save')}
          onPress={() => {}}
        />
      </div>
    </form>
  );
}

export function ProfileEditor({ open, profiles, initial, onSave, onClose }: ProfileEditorProps) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="profile-editor-title" size="wide">
      {open && (
        <ProfileEditorForm
          key={initial?.id ?? 'new'}
          profiles={profiles}
          initial={initial}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
