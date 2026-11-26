import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState/EmptyState'
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar'
import { Icon } from '@/components/icons/Icon'
import { PageBackdrop } from '@/components/PageBackdrop/PageBackdrop'
import { TopNav } from '@/components/TopNav/TopNav'
import { CATALOG_LIST } from '@/games/catalog'
import { isGameId, type GameId } from '@/games/ids'
import { useT } from '@/i18n/useT'
import { loadProfiles } from '@/lib/profiles/profiles'
import { leaderboard } from '@/lib/scores/leaderboard'
import { loadRecords } from '@/lib/scores/records'
import type { DifficultyId } from '@/lib/session/session'
import styles from './LeaderboardPage.module.css'

type Category = 'overall' | 'game'

const LEVELS: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang']
const DEFAULT_GAME: GameId = CATALOG_LIST[0].id

export function LeaderboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const t = useT()

  const initialGameParam = searchParams.get('game')
  const initialLevelParam = searchParams.get('level')
  const hasValidInitialGame = Boolean(
    initialGameParam && isGameId(initialGameParam)
  )

  const [category, setCategory] = useState<Category>(
    hasValidInitialGame ? 'game' : 'overall'
  )
  const [selectedGame, setSelectedGame] = useState<GameId>(
    hasValidInitialGame && initialGameParam && isGameId(initialGameParam)
      ? initialGameParam
      : DEFAULT_GAME
  )
  const [level, setLevel] = useState<DifficultyId>(
    LEVELS.includes(initialLevelParam as DifficultyId)
      ? (initialLevelParam as DifficultyId)
      : 'mudah'
  )

  const records = useMemo(() => loadRecords(), [])
  const profiles = useMemo(() => loadProfiles(), [])

  const rows = useMemo(() => {
    const filter =
      category === 'overall'
        ? 'all'
        : { gameId: selectedGame, difficulty: level }
    return leaderboard(records, profiles, filter)
  }, [records, profiles, category, selectedGame, level])

  const selectCategory = (next: Category) => {
    setCategory(next)
    if (next === 'overall') {
      setSearchParams({})
    } else {
      setSearchParams({ game: selectedGame, level })
    }
  }

  const selectGame = (next: GameId) => {
    setSelectedGame(next)
    setCategory('game')
    setSearchParams({ game: next, level })
  }

  const selectLevel = (next: DifficultyId) => {
    setLevel(next)
    if (category === 'game') {
      setSearchParams({ game: selectedGame, level: next })
    }
  }

  const subtitle =
    category === 'overall'
      ? t('leaderboard.overallSubtitle')
      : t('leaderboard.byGameSubtitle', {
          game: t(`game.${selectedGame}.title`),
          level: t(`intro.level.${level}`),
        })

  return (
    <PageBackdrop>
      <div className={styles.page}>
        <TopNav onBack={() => navigate('/home')} />

        <main className={styles.main}>
          <header className={styles.header}>
            <span className={styles.titleIcon} aria-hidden="true">
              <Icon name="trophy" size={28} />
            </span>
            <div className={styles.headerText}>
              <h1 className={`t-title ${styles.title}`}>
                {t('leaderboard.title')}
              </h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </header>

          <div
            className={styles.tabs}
            role="tablist"
            aria-label={t('leaderboard.categoryLabel')}
          >
            <button
              id="tab-overall"
              type="button"
              role="tab"
              aria-selected={category === 'overall'}
              aria-controls="leaderboard-panel"
              className={`${styles.tabBtn} ${category === 'overall' ? styles.tabActive : ''}`}
              onClick={() => selectCategory('overall')}
            >
              <Icon name="trophy" size={20} />
              <span>{t('leaderboard.tabOverall')}</span>
            </button>
            <button
              id="tab-game"
              type="button"
              role="tab"
              aria-selected={category === 'game'}
              aria-controls="leaderboard-panel"
              className={`${styles.tabBtn} ${category === 'game' ? styles.tabActive : ''}`}
              onClick={() => selectCategory('game')}
            >
              <Icon name="play" size={20} />
              <span>{t('leaderboard.tabByGame')}</span>
            </button>
          </div>

          <section
            id="leaderboard-panel"
            role="tabpanel"
            aria-labelledby={
              category === 'overall' ? 'tab-overall' : 'tab-game'
            }
            className={styles.panel}
          >
            {category === 'game' && (
              <div className={styles.filterCard}>
                <div className={styles.filterSection}>
                  <span className={styles.filterLabel}>
                    {t('leaderboard.chooseGame')}
                  </span>
                  <div
                    className={styles.gameGrid}
                    role="group"
                    aria-label={t('leaderboard.chooseGame')}
                  >
                    {CATALOG_LIST.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={`${styles.gameChip} ${selectedGame === g.id ? styles.gameChipActive : ''}`}
                        aria-pressed={selectedGame === g.id}
                        onClick={() => selectGame(g.id)}
                      >
                        {t(`game.${g.id}.title`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterDivider} />

                <div className={styles.filterSection}>
                  <span className={styles.filterLabel}>
                    {t('leaderboard.chooseLevel')}
                  </span>
                  <div
                    className={styles.levelGrid}
                    role="group"
                    aria-label={t('intro.level')}
                  >
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        className={`${styles.levelChip} ${level === lvl ? styles.levelChipActive : ''}`}
                        aria-pressed={level === lvl}
                        onClick={() => selectLevel(lvl)}
                      >
                        {t(`intro.level.${lvl}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rows.length === 0 ? (
              <EmptyState
                message={t('leaderboard.empty')}
                actionLabel={t('leaderboard.emptyAction')}
                onAction={() => navigate('/home')}
              />
            ) : (
              <ol className={styles.list}>
                {rows.map((row) => (
                  <li
                    key={row.profile.id}
                    className={`${styles.row} ${row.rank <= 3 ? styles[`rowTop${row.rank}`] : ''}`}
                  >
                    <span
                      className={`${styles.rank} ${row.rank <= 3 ? styles[`rank${row.rank}`] : ''}`}
                      aria-label={`#${row.rank}`}
                    >
                      {row.rank <= 3 ? <Icon name="trophy" size={18} /> : null}
                      <span>{row.rank}</span>
                    </span>

                    <span
                      className={styles.avatar}
                      style={{
                        background: `var(--player-${row.profile.color})`,
                      }}
                    >
                      <AnimalAvatar animal={row.profile.avatar} size={40} />
                    </span>

                    <div className={styles.info}>
                      <span className={styles.name}>{row.profile.name}</span>
                      <div className={styles.badges}>
                        {category === 'overall' ? (
                          <span className={styles.metaChip}>
                            {t('leaderboard.plays', { n: row.plays })}
                          </span>
                        ) : row.lastImprovement > 0 ? (
                          <span className={styles.gainChip}>
                            {t('score.gain', { n: row.lastImprovement })}
                          </span>
                        ) : row.isNewRecord ? (
                          <span className={styles.gainChip}>
                            {t('score.newRecord')}
                          </span>
                        ) : null}
                        {row.mostImproved && (
                          <span className={styles.improvedChip}>
                            {t('score.mostImproved')}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`${styles.scorePill} ${row.rank === 1 ? styles.scorePillFirst : ''}`}
                    >
                      {t('score.points', { score: row.best })}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </main>
      </div>
    </PageBackdrop>
  )
}
