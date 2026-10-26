import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { PreloadPage } from './pages/Preload/PreloadPage';
import { GameIntroPage } from './pages/GameIntro';
import { ResultPage } from './pages/Result';
import { GameShellPage } from './pages/GameShell';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preload" element={<PreloadPage />} />
        <Route path="/game/:gameId/intro" element={<GameIntroPage />} />
        <Route path="/game/:gameId/play" element={<GameShellPage />} />
        <Route path="/game/:gameId/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
