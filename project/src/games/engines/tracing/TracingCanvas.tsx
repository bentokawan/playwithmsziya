import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import type { Glyph } from '@/content/glyphs/types';
import { DUR } from '@/design/motion';
import { useT } from '@/i18n/useT';
import type { DifficultyId, PlayerNumber } from '@/lib/session/session';
import { createFrameScheduler, type FrameScheduler } from './frameScheduler';
import {
  INITIAL_TRACE_STATE,
  pointerDown,
  pointerMove,
  pointerUp,
  prepareGlyph,
  toleranceForLevel,
  type Point,
  type PreparedGlyph,
  type TraceState,
} from './tracing';
import styles from './TracingCanvas.module.css';

export interface TracingCanvasProps {
  readonly glyph: Glyph;
  readonly difficulty: DifficultyId;
  readonly player: PlayerNumber;
  readonly thickLines: boolean;
  readonly calmMotion: boolean;
  readonly onComplete: (info: { readonly attempts: number; readonly firstTry: boolean }) => void;
}

function getTargetPoint(prepared: PreparedGlyph, state: TraceState): Point | null {
  if (state.done) return null;
  const stroke = prepared.strokes[state.strokeIndex];
  if (!stroke || stroke.samples.length === 0) return null;
  return stroke.samples[Math.min(state.progress, stroke.samples.length - 1)];
}

export function TracingCanvas({
  glyph,
  difficulty,
  player,
  thickLines,
  calmMotion,
  onComplete,
}: TracingCanvasProps) {
  const audio = useAudio();
  const t = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prepared = useMemo(() => prepareGlyph(glyph), [glyph]);
  const tol = toleranceForLevel(difficulty, thickLines);

  const stateRef = useRef<TraceState>(INITIAL_TRACE_STATE);
  const activePointerRef = useRef<number | null>(null);
  const schedulerRef = useRef<FrameScheduler | null>(null);
  const completedRef = useRef(false);
  const completeTimerRef = useRef<number | null>(null);
  const [doneUi, setDoneUi] = useState(false);
  const [dotUi, setDotUi] = useState<{ readonly point: Point | null; readonly active: boolean }>(
    () => ({
      point: getTargetPoint(prepared, INITIAL_TRACE_STATE),
      active: false,
    }),
  );

  const syncDotUi = useCallback(
    (st: TraceState) => {
      setDotUi({
        point: getTargetPoint(prepared, st),
        active: st.active,
      });
    },
    [prepared],
  );

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssSize = canvas.width / dpr;
    if (cssSize <= 0) return;

    const scale = cssSize / 100;
    const st = stateRef.current;
    const fillCol = st.done ? '#1F9E5C' : player === 2 ? '#E8458B' : '#0A8FD6';

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    // 1. Base track + dashed sky-300 center line
    for (let i = 0; i < prepared.strokes.length; i++) {
      const s = prepared.strokes[i];
      if (s.dot) {
        const pt = s.samples[0];
        ctx.beginPath();
        ctx.arc(pt.x * scale, pt.y * scale, tol * scale, 0, Math.PI * 2);
        ctx.fillStyle = i < st.strokeIndex || st.done ? fillCol : '#EAF7FF';
        ctx.fill();
        continue;
      }

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = tol * 2 * scale;
      ctx.strokeStyle = '#EAF7FF';
      ctx.setLineDash([]);
      s.samples.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x * scale, pt.y * scale);
        else ctx.lineTo(pt.x * scale, pt.y * scale);
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = Math.max(2, 2.5 * scale);
      ctx.strokeStyle = '#7FD3FF';
      ctx.setLineDash([6, 6]);
      s.samples.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x * scale, pt.y * scale);
        else ctx.lineTo(pt.x * scale, pt.y * scale);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Filled progress
    for (let i = 0; i < prepared.strokes.length; i++) {
      const s = prepared.strokes[i];
      if (s.dot) continue;
      if (i > st.strokeIndex && !st.done) continue;
      const endIdx = i < st.strokeIndex || st.done ? s.samples.length - 1 : st.progress;
      if (endIdx <= 0) continue;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = tol * 1.6 * scale;
      ctx.strokeStyle = fillCol;
      for (let k = 0; k <= endIdx; k++) {
        const pt = s.samples[k];
        if (k === 0) ctx.moveTo(pt.x * scale, pt.y * scale);
        else ctx.lineTo(pt.x * scale, pt.y * scale);
      }
      ctx.stroke();
    }

    // 3. Direction arrow for mudah / sedang
    if (!st.done) {
      const curStroke = prepared.strokes[st.strokeIndex];
      if (curStroke) {
        const targetPt = curStroke.samples[Math.min(st.progress, curStroke.samples.length - 1)];
        const showArrow =
          !curStroke.dot &&
          curStroke.samples.length > 2 &&
          (difficulty === 'mudah' || difficulty === 'sedang');
        if (showArrow) {
          const nextPt = curStroke.samples[Math.min(st.progress + 3, curStroke.samples.length - 1)];
          const angle = Math.atan2(nextPt.y - targetPt.y, nextPt.x - targetPt.x);
          const ax = (targetPt.x + Math.cos(angle) * tol * 1.1) * scale;
          const ay = (targetPt.y + Math.sin(angle) * tol * 1.1) * scale;
          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, -5);
          ctx.lineTo(-4, 5);
          ctx.closePath();
          ctx.fillStyle = '#1B2559';
          ctx.fill();
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }, [prepared, tol, player, difficulty]);

  const paintRef = useRef(paint);
  useEffect(() => {
    paintRef.current = paint;
    schedulerRef.current?.schedule();
  }, [paint]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const scheduler = createFrameScheduler(
      () => paintRef.current(),
      (cb) => window.requestAnimationFrame(cb),
      (id) => window.cancelAnimationFrame(id),
    );
    schedulerRef.current = scheduler;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const side = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(side * dpr);
      canvas.height = Math.round(side * dpr);
      scheduler.schedule();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      scheduler.cancel();
      schedulerRef.current = null;
      if (completeTimerRef.current !== null) {
        window.clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
    };
  }, []);

  const toLogical = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100,
      y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100,
    };
  };

  const handleFinishCheck = (next: TraceState, strokeCompleted: boolean) => {
    if (strokeCompleted && !next.done) {
      audio.sfx('stroke-done');
    }
    if (next.done && !completedRef.current) {
      completedRef.current = true;
      setDoneUi(true);
      audio.sfx('correct');
      const delayMs = calmMotion ? 0 : Math.round(DUR.celebrate * 1000);
      completeTimerRef.current = window.setTimeout(() => {
        onComplete({
          attempts: 1 + next.rejectedStarts,
          firstTry: next.rejectedStarts === 0,
        });
      }, delayMs);
    }
  };

  const endPointer = (pointerId: number) => {
    if (activePointerRef.current !== pointerId) return;
    activePointerRef.current = null;
    stateRef.current = pointerUp(stateRef.current);
    syncDotUi(stateRef.current);
    schedulerRef.current?.schedule();
  };

  const handleReset = () => {
    if (completeTimerRef.current !== null) {
      window.clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    activePointerRef.current = null;
    completedRef.current = false;
    stateRef.current = {
      ...INITIAL_TRACE_STATE,
      rejectedStarts: stateRef.current.rejectedStarts,
    };
    setDoneUi(false);
    syncDotUi(stateRef.current);
    schedulerRef.current?.schedule();
  };

  const showStartDot = !doneUi && !dotUi.active && dotUi.point !== null;

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      data-glyph-id={glyph.id}
      data-done={doneUi ? 'true' : 'false'}
    >
      <div className={styles.canvasBox}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerDown={(e) => {
            if (completedRef.current || activePointerRef.current !== null) return;
            activePointerRef.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            const res = pointerDown(stateRef.current, prepared, toLogical(e), tol);
            stateRef.current = res.state;
            syncDotUi(res.state);
            schedulerRef.current?.schedule();
            handleFinishCheck(res.state, res.strokeCompleted);
          }}
          onPointerMove={(e) => {
            if (activePointerRef.current !== e.pointerId || completedRef.current) return;
            const res = pointerMove(stateRef.current, prepared, toLogical(e), tol);
            stateRef.current = res.state;
            if (res.strokeCompleted) syncDotUi(res.state);
            schedulerRef.current?.schedule();
            handleFinishCheck(res.state, res.strokeCompleted);
          }}
          onPointerUp={(e) => endPointer(e.pointerId)}
          onPointerCancel={(e) => endPointer(e.pointerId)}
          onLostPointerCapture={(e) => endPointer(e.pointerId)}
        />

        {showStartDot && dotUi.point && (
          <span
            className={`${styles.startDot} ${calmMotion ? styles.startDotCalm : ''}`}
            style={{
              left: `${dotUi.point.x}%`,
              top: `${dotUi.point.y}%`,
              width: `${tol * 2}%`,
              height: `${tol * 2}%`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <BlockButton
        variant="white"
        size="nav"
        icon="replay"
        label={t('trace.again')}
        onPress={handleReset}
        className={styles.againBtn}
      />
    </div>
  );
}
