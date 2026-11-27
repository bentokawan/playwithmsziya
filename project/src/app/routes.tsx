import { lazy, Suspense } from 'react'
import { AnimatePresence, m } from 'motion/react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { LoadingState } from '@/components/LoadingState/LoadingState'
import { DUR, EASE_OUT_SOFT } from '@/design/motion'
import { useCalmMotion } from '@/design/useCalmMotion'
import { isGameId } from '@/games/ids'
import { useT } from '@/i18n/useT'
import { OnlineGate } from './OnlineGate'

const SplashPage = lazy(() =>
  import('@/pages/Splash/SplashPage').then((mod) => ({
    default: mod.SplashPage,
  }))
)
const HomePage = lazy(() =>
  import('@/pages/Home/HomePage').then((mod) => ({ default: mod.HomePage }))
)
const IntroPage = lazy(() =>
  import('@/pages/Intro/IntroPage').then((mod) => ({ default: mod.IntroPage }))
)
const PlayPage = lazy(() =>
  import('@/pages/Play/PlayPage').then((mod) => ({ default: mod.PlayPage }))
)
const ResultPage = lazy(() =>
  import('@/pages/Result/ResultPage').then((mod) => ({
    default: mod.ResultPage,
  }))
)
const StickersPage = lazy(() =>
  import('@/pages/Stickers/StickersPage').then((mod) => ({
    default: mod.StickersPage,
  }))
)
const ParentsPage = lazy(() =>
  import('@/pages/Parents/ParentsPage').then((mod) => ({
    default: mod.ParentsPage,
  }))
)
const PlayersPage = lazy(() =>
  import('@/pages/Players/PlayersPage').then((mod) => ({
    default: mod.PlayersPage,
  }))
)
const LeaderboardPage = lazy(() =>
  import('@/pages/Leaderboard/LeaderboardPage').then((mod) => ({
    default: mod.LeaderboardPage,
  }))
)
const HostRoomPage = lazy(() =>
  import('@/pages/Room/HostRoomPage').then((mod) => ({
    default: mod.HostRoomPage,
  }))
)
const JoinRoomPage = lazy(() =>
  import('@/pages/Room/JoinRoomPage').then((mod) => ({
    default: mod.JoinRoomPage,
  }))
)
const AdminRoutes = lazy(() => import('@/admin/AdminRoutes'))
const KitPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/Kit/KitPage').then((mod) => ({ default: mod.KitPage }))
    )
  : null

function LoadingFallback({ isAdmin = false }: { readonly isAdmin?: boolean }) {
  return (
    <LoadingState
      variant="page"
      withBackdrop={!isAdmin}
      showMascot={!isAdmin}
    />
  )
}

function NotFoundView() {
  const t = useT()
  const navigate = useNavigate()
  return (
    <main style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h1 className="t-title">{t('notFound.title')}</h1>
      <button type="button" onClick={() => navigate('/home')}>
        {t('nav.home')}
      </button>
    </main>
  )
}

function ValidatedGameRoute({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const { gameId = '' } = useParams()
  if (!isGameId(gameId)) {
    return <NotFoundView />
  }
  return <>{children}</>
}

export function AppRoutes() {
  const location = useLocation()
  const calm = useCalmMotion()
  const isAdmin = location.pathname.startsWith('/admin')

  const routeElement = (
    <Routes location={location}>
      <Route path="/" element={<SplashPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/dunia/:worldId" element={<Navigate to="/home" replace />} />
      <Route
        path="/game/:gameId/intro"
        element={
          <ValidatedGameRoute>
            <IntroPage />
          </ValidatedGameRoute>
        }
      />
      <Route
        path="/game/:gameId/play"
        element={
          <ValidatedGameRoute>
            {new URLSearchParams(location.search).get('mode') === 'online' ? (
              <OnlineGate>
                <PlayPage />
              </OnlineGate>
            ) : (
              <PlayPage />
            )}
          </ValidatedGameRoute>
        }
      />
      <Route
        path="/game/:gameId/result"
        element={
          <ValidatedGameRoute>
            <ResultPage />
          </ValidatedGameRoute>
        }
      />
      <Route
        path="/game/:gameId/ruang"
        element={
          <ValidatedGameRoute>
            <OnlineGate>
              <HostRoomPage />
            </OnlineGate>
          </ValidatedGameRoute>
        }
      />
      <Route
        path="/gabung"
        element={
          <OnlineGate>
            <JoinRoomPage />
          </OnlineGate>
        }
      />
      <Route
        path="/gabung/:code"
        element={
          <OnlineGate>
            <JoinRoomPage />
          </OnlineGate>
        }
      />
      <Route path="/stiker" element={<StickersPage />} />
      <Route path="/pemain" element={<PlayersPage />} />
      <Route path="/peringkat" element={<LeaderboardPage />} />
      <Route path="/pendamping" element={<ParentsPage />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      {KitPage && <Route path="/_kit" element={<KitPage />} />}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )

  if (isAdmin) {
    return (
      <Suspense fallback={<LoadingFallback isAdmin />}>{routeElement}</Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnimatePresence mode="wait">
        <m.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: calm ? 0 : DUR.fast, ease: EASE_OUT_SOFT }}
        >
          {routeElement}
        </m.div>
      </AnimatePresence>
    </Suspense>
  )
}
