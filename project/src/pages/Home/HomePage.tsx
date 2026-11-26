import { useEffect, useMemo, useRef, useState } from 'react'
import { m } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAudio } from '@/app/providers/useAudio'
import { BlockButton } from '@/components/BlockButton/BlockButton'
import { GameCard } from '@/components/GameCard/GameCard'
import { PageBackdrop } from '@/components/PageBackdrop/PageBackdrop'
import { GrownUpGate } from '@/components/GrownUpGate/GrownUpGate'
import { TopNav } from '@/components/TopNav/TopNav'
import { SPRING, enterProps } from '@/design/motion'
import { useCalmMotion } from '@/design/useCalmMotion'
import { homeGameList, type CatalogEntry } from '@/games/catalog'
import { useT } from '@/i18n/useT'
import { useContent } from '@/lib/content/useContent'
import { useMinWidth } from '@/lib/device/viewport'
import { isOnlineConfigured } from '@/lib/room/online'
import { MsZiya } from '@/worlds/characters/MsZiya'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  const audio = useAudio()
  const calm = useCalmMotion()
  const { readiness } = useContent()
  const t = useT()
  const wide = useMinWidth(1024)

  const [hopping, setHopping] = useState(false)
  const lastGiggleRef = useRef(0)

  useEffect(() => {
    audio.setScene({ music: 'home', ambient: null })
  }, [audio])

  const games = useMemo(
    () =>
      homeGameList(
        (entry) => entry.status === 'ready' && readiness(entry.id).ready
      ),
    [readiness]
  )

  const handleOpenGame = (entry: CatalogEntry) => {
    navigate(`/game/${entry.id}/intro`)
  }

  const handleMascotTap = () => {
    const now = Date.now()
    if (now - lastGiggleRef.current >= 3000) {
      lastGiggleRef.current = now
      audio.sfx('kids-giggle')
    }
    if (!calm) {
      setHopping(true)
      window.setTimeout(() => setHopping(false), 320)
    }
  }

  return (
    <PageBackdrop>
      <div className={styles.page}>
        <TopNav
          leftSlot={
            <>
              <BlockButton
                variant={wide ? 'white' : 'icon'}
                size="nav"
                icon="star"
                label={wide ? t('nav.short.stickers') : t('nav.stickers')}
                onPress={() => navigate('/stiker')}
              />
              <BlockButton
                variant={wide ? 'white' : 'icon'}
                size="nav"
                icon="trophy"
                label={t('nav.leaderboard')}
                onPress={() => navigate('/peringkat')}
              />
              {isOnlineConfigured() && (
                <BlockButton
                  variant="icon"
                  size="nav"
                  icon="link"
                  label={t('nav.joinRoom')}
                  onPress={() => navigate('/gabung')}
                />
              )}
            </>
          }
          rightExtra={
            <>
              <GrownUpGate
                icon="users"
                label={t('nav.players')}
                visibleLabel={wide ? t('nav.short.players') : undefined}
                onPass={() => navigate('/pemain')}
              />
              <GrownUpGate
                onPass={() => navigate('/pendamping')}
                visibleLabel={wide ? t('nav.short.settings') : undefined}
              />
            </>
          }
        />

        <header className={styles.hero}>
          <m.button
            type="button"
            className={styles.mascotBtn}
            aria-label={t('app.name')}
            onClick={handleMascotTap}
            animate={hopping && !calm ? { y: [0, -14, 0] } : { y: 0 }}
            transition={calm ? { duration: 0 } : SPRING.bouncy}
          >
            <MsZiya mood="happy" size={72} />
          </m.button>
          <h1 className={`t-title ${styles.greeting}`}>{t('home.greeting')}</h1>
        </header>

        <main className={styles.main}>
          <ul className={styles.grid}>
            {games.map(({ entry, playable }, idx) => (
              <m.li
                key={entry.id}
                className={styles.item}
                {...enterProps(calm, idx)}
              >
                <GameCard
                  entry={entry}
                  isReady={playable}
                  onOpen={handleOpenGame}
                />
              </m.li>
            ))}
          </ul>
        </main>
      </div>
    </PageBackdrop>
  )
}
