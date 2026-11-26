import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar'
import { BlockButton } from '@/components/BlockButton/BlockButton'
import { Dialog } from '@/components/Dialog/Dialog'
import { PageBackdrop } from '@/components/PageBackdrop/PageBackdrop'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { ProfileEditor } from '@/components/Roster/ProfileEditor'
import { TopNav } from '@/components/TopNav/TopNav'
import { useT } from '@/i18n/useT'
import {
  activeProfiles,
  addProfile,
  archiveProfile,
  loadProfiles,
  saveProfiles,
  updateProfile,
  type Profile,
  type ProfileInput,
} from '@/lib/profiles/profiles'
import styles from './PlayersPage.module.css'

export function PlayersPage() {
  const navigate = useNavigate()
  const t = useT()

  const [allProfiles, setAllProfiles] = useState<Profile[]>(() =>
    loadProfiles()
  )
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null)

  const active = activeProfiles(allProfiles)

  const persist = (next: Profile[]) => {
    saveProfiles(next)
    setAllProfiles(next)
  }

  const handleSave = (input: ProfileInput) => {
    if (editing) {
      const res = updateProfile(allProfiles, editing.id, input)
      if ('list' in res) {
        persist(res.list)
        setEditorOpen(false)
        setEditing(undefined)
      }
      return
    }
    const res = addProfile(allProfiles, input)
    if ('list' in res) {
      persist(res.list)
      setEditorOpen(false)
    }
  }

  const handleArchive = (id: string) => {
    persist(archiveProfile(allProfiles, id))
  }

  return (
    <PageBackdrop>
      <div className={styles.page}>
        <TopNav onBack={() => navigate('/home')} />

        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={`t-title ${styles.title}`}>{t('profiles.title')}</h1>
            <BlockButton
              variant="primary"
              size="choice"
              icon="plus"
              label={t('profiles.addTitle')}
              onPress={() => {
                setEditing(undefined)
                setEditorOpen(true)
              }}
            />
          </div>

          {active.length === 0 ? (
            <EmptyState message={t('profiles.empty')} />
          ) : (
            <ul className={styles.list}>
              {active.map((p) => (
                <li key={p.id} className={styles.card}>
                  <div className={styles.cardInfo}>
                    <span
                      className={styles.avatar}
                      style={{ background: `var(--player-${p.color})` }}
                    >
                      <AnimalAvatar animal={p.avatar} size={44} />
                    </span>
                    <span className={styles.name}>{p.name}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <BlockButton
                      variant="white"
                      size="nav"
                      label={t('profiles.edit')}
                      onPress={() => {
                        setEditing(p)
                        setEditorOpen(true)
                      }}
                    />
                    <BlockButton
                      variant="white"
                      size="nav"
                      label={t('profiles.archive')}
                      onPress={() => setConfirmDelete(p)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>

        <ProfileEditor
          open={editorOpen}
          profiles={allProfiles}
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setEditorOpen(false)
            setEditing(undefined)
          }}
        />

        <Dialog
          open={confirmDelete !== null}
          onClose={() => setConfirmDelete(null)}
          labelledBy="profile-delete-title"
        >
          {confirmDelete && (
            <div className={styles.confirmBody}>
              <h2
                id="profile-delete-title"
                className={`t-title ${styles.title}`}
              >
                {t('profiles.deleteConfirmTitle', { name: confirmDelete.name })}
              </h2>
              <p className={`t-body ${styles.confirmText}`}>
                {t('profiles.deleteConfirmBody')}
              </p>
              <div className={styles.confirmActions}>
                <BlockButton
                  variant="white"
                  size="choice"
                  label={t('profiles.cancel')}
                  onPress={() => setConfirmDelete(null)}
                />
                <BlockButton
                  variant="pink"
                  size="choice"
                  label={t('profiles.archive')}
                  onPress={() => {
                    handleArchive(confirmDelete.id)
                    setConfirmDelete(null)
                  }}
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </PageBackdrop>
  )
}
