import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/app/providers/usePreferences';
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Icon } from '@/components/icons/Icon';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { PageBackdrop } from '@/components/PageBackdrop/PageBackdrop';
import { TopNav } from '@/components/TopNav/TopNav';
import { CATALOG } from '@/games/catalog';
import { isGameId, type GameId } from '@/games/ids';
import { useT } from '@/i18n/useT';
import { activeProfiles, loadProfiles } from '@/lib/profiles/profiles';
import {
  buildProfileScoreDetail,
  formatSessionDate,
  type GamePointBreakdown,
} from '@/lib/scores/profileDetail';
import { loadRecords } from '@/lib/scores/records';
import styles from './PlayerDetailPage.module.css';

const INITIAL_VISIBLE_SESSIONS = 5;

function GameBreakdownCard({
  game,
  focused,
  locale,
}: {
  readonly game: GamePointBreakdown;
  readonly focused: boolean;
  readonly locale: 'id' | 'en';
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);

  const entry = CATALOG[game.gameId];
  const gameTitle = t(`game.${game.gameId}.title`);
  const hasMore = game.sessions.length > INITIAL_VISIBLE_SESSIONS;
  const visibleSessions =
    expanded || !hasMore ? game.sessions : game.sessions.slice(0, INITIAL_VISIBLE_SESSIONS);

  return (
    <article
      className={`${styles.gameCard} ${focused ? styles.gameCardFocused : ''}`}
      data-game-card={game.gameId}
    >
      <header className={styles.gameHeader}>
        <span className={styles.gameIconWrap} aria-hidden="true">
          <ObjectImage objectId={entry.icon} size={42} decorative />
        </span>

        <div className={styles.gameHeaderText}>
          <h3 className={styles.gameTitle}>{gameTitle}</h3>
          <div className={styles.gameMetaRow}>
            <span className={styles.metaChip}>{t('leaderboard.plays', { n: game.plays })}</span>
            <span className={styles.metaChip}>
              {t('detail.bestScore', { score: game.bestScore })}
            </span>
            {game.totalRounds > 0 && (
              <span className={styles.metaChip}>
                {t('detail.summaryFirstTry', {
                  n: game.totalFirstTry,
                  total: game.totalRounds,
                })}
              </span>
            )}
            {game.wins > 0 && (
              <span className={styles.winChip}>{t('detail.summaryWins', { n: game.wins })}</span>
            )}
          </div>
        </div>

        <span className={styles.gameTotalPill}>
          {t('score.points', { score: game.totalPoints })}
        </span>
      </header>

      <ul className={styles.bucketList}>
        {game.buckets.map((bucket) => {
          const modeLabel = t(`detail.mode.${bucket.mode}`);
          const levelLabel = t(`intro.level.${bucket.difficulty}`);
          return (
            <li
              key={`${bucket.mode}-${bucket.difficulty}`}
              className={styles.bucketRow}
              data-bucket-row="true"
            >
              <div className={styles.bucketMain}>
                <span className={styles.bucketTitle}>
                  {t('detail.bucketLine', {
                    game: gameTitle,
                    mode: modeLabel,
                    level: levelLabel,
                  })}
                </span>
                <span className={styles.bucketSub}>
                  {t('leaderboard.plays', { n: bucket.plays })} ·{' '}
                  {t('detail.bestScore', { score: bucket.bestScore })}
                  {bucket.wins > 0 ? ` · ${t('detail.summaryWins', { n: bucket.wins })}` : ''}
                </span>
              </div>
              <span className={styles.bucketPoints}>
                {t('score.points', { score: bucket.points })}
              </span>
            </li>
          );
        })}
      </ul>

      <div className={styles.sessionsSection}>
        <h4 className={styles.sessionsHeading}>{t('detail.sessionsTitle')}</h4>
        <ol className={styles.sessionList} data-sessions-list="true">
          {visibleSessions.map(({ record, stars }) => {
            const modeLabel = t(`detail.mode.${record.mode}`);
            const levelLabel = t(`intro.level.${record.difficulty}`);
            const dateStr = formatSessionDate(record.finishedAt, locale);

            return (
              <li key={record.id} className={styles.sessionRow} data-session-row="true">
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionTitleRow}>
                    <span className={styles.sessionTitle}>
                      {t('detail.sessionLine', {
                        game: gameTitle,
                        mode: modeLabel,
                        level: levelLabel,
                      })}
                    </span>
                    {record.won === true && (
                      <span className={styles.wonPill}>
                        <Icon name="crown" size={13} />
                        <span>{t('detail.wonBadge')}</span>
                      </span>
                    )}
                  </div>
                  <div className={styles.sessionMeta}>
                    {dateStr && <span>{dateStr}</span>}
                    {record.rounds > 0 && (
                      <>
                        {dateStr && <span aria-hidden="true">·</span>}
                        <span>{t('detail.summaryRounds', { n: record.rounds })}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {t('detail.summaryFirstTry', {
                            n: record.firstTryCount,
                            total: record.rounds,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.sessionRight}>
                  <span
                    className={styles.stars}
                    role="img"
                    aria-label={t('leaderboard.stars', { n: stars })}
                  >
                    {[1, 2, 3].map((idx) => (
                      <Icon
                        key={idx}
                        name="star"
                        size={15}
                        className={idx <= stars ? styles.starOn : styles.starOff}
                      />
                    ))}
                  </span>
                  <div className={styles.sessionScoreCol}>
                    <span className={styles.sessionScorePill}>
                      {t('detail.sessionScore', { score: record.score })}
                    </span>
                    {record.maxScore > 0 && (
                      <span className={styles.sessionMax}>
                        {t('detail.sessionOfMax', { max: record.maxScore })}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {hasMore && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded
              ? t('detail.showLessSessions')
              : t('detail.showAllSessions', { n: game.sessions.length })}
          </button>
        )}
      </div>
    </article>
  );
}

export function PlayerDetailPage() {
  const { profileId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { prefs } = usePreferences();
  const t = useT();

  const locale = prefs.locale ?? 'id';
  const focusGameParam = searchParams.get('game');
  const focusLevelParam = searchParams.get('level');
  const focusGameId: GameId | undefined =
    focusGameParam && isGameId(focusGameParam) ? focusGameParam : undefined;

  const backHref = focusGameId
    ? `/peringkat?game=${focusGameId}${focusLevelParam ? `&level=${focusLevelParam}` : ''}`
    : '/peringkat';

  const profile = useMemo(() => {
    const active = activeProfiles(loadProfiles());
    return active.find((p) => p.id === profileId) ?? null;
  }, [profileId]);

  const records = useMemo(() => loadRecords(), []);

  const detail = useMemo(() => {
    if (!profile) return null;
    return buildProfileScoreDetail(profile, records, focusGameId);
  }, [profile, records, focusGameId]);

  return (
    <PageBackdrop>
      <div className={styles.page}>
        <TopNav onBack={() => navigate(backHref)} />

        <main className={styles.main}>
          {!detail ? (
            <EmptyState
              message={t('detail.notFound')}
              actionLabel={t('detail.backToLeaderboard')}
              actionIcon="back"
              onAction={() => navigate('/peringkat')}
            />
          ) : (
            <>
              <section
                className={styles.heroCard}
                style={{ borderColor: `var(--player-${detail.profile.color})` }}
                data-player-detail-hero="true"
              >
                <div className={styles.heroTop}>
                  <span
                    className={styles.heroAvatar}
                    style={{ background: `var(--player-${detail.profile.color})` }}
                  >
                    <AnimalAvatar animal={detail.profile.avatar} size={56} />
                  </span>

                  <div className={styles.heroText}>
                    <p className={styles.heroEyebrow}>{t('detail.title')}</p>
                    <h1 className={`t-title ${styles.heroName}`}>{detail.profile.name}</h1>
                  </div>

                  <span className={styles.totalPill} data-total-points="true">
                    {detail.totalPoints > 0 && <Icon name="trophy" size={20} />}
                    <span>{t('score.points', { score: detail.totalPoints })}</span>
                  </span>
                </div>

                {detail.totalPlays > 0 && (
                  <div className={styles.statsBar}>
                    <span className={styles.statPill}>
                      {t('leaderboard.plays', { n: detail.totalPlays })}
                    </span>
                    <span className={styles.statPill}>
                      {t('detail.summaryGames', { n: detail.gamesPlayed })}
                    </span>
                    {detail.totalRounds > 0 && (
                      <span className={styles.statPill}>
                        {t('detail.summaryRounds', { n: detail.totalRounds })}
                      </span>
                    )}
                    {detail.totalRounds > 0 && (
                      <span className={styles.statPill}>
                        {t('detail.summaryFirstTry', {
                          n: detail.totalFirstTry,
                          total: detail.totalRounds,
                        })}
                      </span>
                    )}
                    {detail.totalWins > 0 && (
                      <span className={styles.winChip}>
                        {t('detail.summaryWins', { n: detail.totalWins })}
                      </span>
                    )}
                  </div>
                )}
              </section>

              {detail.totalPlays === 0 ? (
                <EmptyState
                  message={t('detail.emptyForPlayer', { name: detail.profile.name })}
                  actionLabel={t('leaderboard.emptyAction')}
                  onAction={() => navigate('/home')}
                />
              ) : (
                <>
                  <section className={styles.section} data-mode-breakdown="true">
                    <h2 className={styles.sectionTitle}>{t('detail.byModeTitle')}</h2>
                    <div className={styles.modeGrid}>
                      {detail.byMode.map((item) => (
                        <div key={item.mode} className={styles.modeCard}>
                          <span className={styles.modeName}>
                            {t('detail.modeSummaryLine', {
                              mode: t(`detail.mode.${item.mode}`),
                            })}
                          </span>
                          <span className={styles.modePoints}>
                            {t('score.points', { score: item.points })}
                          </span>
                          <span className={styles.modeMeta}>
                            {t('leaderboard.plays', { n: item.plays })}
                            {item.wins > 0
                              ? ` · ${t('detail.summaryWins', { n: item.wins })}`
                              : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('detail.byGameTitle')}</h2>
                    <div className={styles.gameList}>
                      {detail.byGame.map((game) => (
                        <GameBreakdownCard
                          key={game.gameId}
                          game={game}
                          focused={game.gameId === focusGameId}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </section>

                  <p className={styles.scoringNote}>{t('detail.scoringNote')}</p>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </PageBackdrop>
  );
}
