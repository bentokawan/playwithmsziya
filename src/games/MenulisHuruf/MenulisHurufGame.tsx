import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../types';
import styles from './MenulisHurufGame.module.css';

/**
 * Contoh implementasi kontrak GameProps.
 * Canvas tracing sederhana huruf A: user menggambar di atas garis pandu.
 * Ganti isi render/logika dengan game lain — shell di luar tetap sama.
 */

interface Point {
  x: number;
  y: number;
}

// Garis pandu huruf A dalam koordinat relatif (0-1)
const GUIDE_LINES: readonly [Point, Point][] = [
  [{ x: 0.3, y: 0.85 }, { x: 0.5, y: 0.15 }], // kaki kiri
  [{ x: 0.5, y: 0.15 }, { x: 0.7, y: 0.85 }], // kaki kanan
  [{ x: 0.38, y: 0.55 }, { x: 0.62, y: 0.55 }], // palang
];

const FINISH_RADIUS = 0.045;
const PROGRESS_TARGET = 0.7; // proporsi panjang pandu yang harus tertebal

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function MenulisHurufGame({ onFinish }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const drawnRef = useRef<boolean[][]>([]); // grid tutupan per pandu
  const drawingRef = useRef(false);

  const GRID = 24;

  useEffect(() => {
    drawnRef.current = GUIDE_LINES.map(() => Array(GRID).fill(false));
  }, []);

  const measureCoverage = () => {
    const covered = drawnRef.current.reduce(
      (acc, cells) => acc + cells.filter(Boolean).length,
      0,
    );
    const total = GUIDE_LINES.length * GRID;
    return covered / total;
  };

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (done || !drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const p = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };

    // Tandai sel pandu yang tersentuh
    drawnRef.current = drawnRef.current.map((cells, lineIdx) => {
      const [a, b] = GUIDE_LINES[lineIdx];
      const next = [...cells];
      for (let i = 0; i < GRID; i++) {
        const t = (i + 0.5) / GRID;
        const pt = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        if (!next[i] && dist(p, pt) < FINISH_RADIUS * 1.6) next[i] = true;
      }
      return next;
    });

    const cov = measureCoverage();
    setProgress(cov);
    if (cov >= PROGRESS_TARGET) {
      setDone(true);
      setTimeout(() => onFinish({ stars: 3, score: Math.round(cov * 100) }), 900);
    } else {
      paint();
    }
  };

  const paint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Garis pandu (tertebal = ungu, belum = putus-putus)
    GUIDE_LINES.forEach(([a, b], lineIdx) => {
      const cells = drawnRef.current[lineIdx] ?? [];
      for (let i = 0; i < GRID; i++) {
        const t0 = i / GRID;
        const t1 = (i + 1) / GRID;
        const p0 = { x: a.x + (b.x - a.x) * t0, y: a.y + (b.y - a.y) * t0 };
        const p1 = { x: a.x + (b.x - a.x) * t1, y: a.y + (b.y - a.y) * t1 };
        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        if (cells[i]) {
          ctx.strokeStyle = '#8b7fe8';
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = '#ddd9f6';
          ctx.setLineDash([6, 8]);
        }
        ctx.moveTo(p0.x * width, p0.y * height);
        ctx.lineTo(p1.x * width, p1.y * height);
        ctx.stroke();
      }
    });

    // Titik mulai hijau
    const [a] = GUIDE_LINES[0];
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(a.x * width, a.y * height, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#d9f2e5';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(a.x * width, a.y * height, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#3ccb7f';
    ctx.fill();
  };

  useEffect(() => {
    paint();
    const onResize = () => paint();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={(e) => {
          drawingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointer(e);
        }}
        onPointerMove={handlePointer}
        onPointerUp={() => (drawingRef.current = false)}
        onPointerLeave={() => (drawingRef.current = false)}
      />
      <div className={styles.hints}>
        <span className={styles.startHint}>✦ Mulai di sini</span>
        <span className={styles.progressLabel}>
          {done ? 'Hebat! Huruf A selesai 🎉' : `${Math.round(progress * 100)}%`}
        </span>
      </div>
    </div>
  );
}
