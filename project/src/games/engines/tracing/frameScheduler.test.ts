import { describe, expect, it } from 'vitest';
import { createFrameScheduler } from './frameScheduler';

describe('createFrameScheduler', () => {
  function setup() {
    let nextId = 1;
    let rafCalls = 0;
    let paints = 0;
    const cafIds: number[] = [];
    const pending = new Map<number, FrameRequestCallback>();

    const raf = (cb: FrameRequestCallback): number => {
      rafCalls += 1;
      const id = nextId++;
      pending.set(id, cb);
      return id;
    };

    const caf = (id: number): void => {
      cafIds.push(id);
      pending.delete(id);
    };

    const fire = () => {
      const callbacks = Array.from(pending.values());
      pending.clear();
      for (const cb of callbacks) {
        cb(performance.now());
      }
    };

    const s = createFrameScheduler(
      () => {
        paints += 1;
      },
      raf,
      caf,
    );

    return {
      s,
      fire,
      getRafCalls: () => rafCalls,
      getPaints: () => paints,
      cafIds,
    };
  }

  it('requests one frame for many schedules', () => {
    const { s, getRafCalls } = setup();
    s.schedule();
    s.schedule();
    expect(getRafCalls()).toBe(1);
  });

  it('paints once when the frame fires and can schedule again', () => {
    const { s, fire, getPaints, getRafCalls } = setup();
    s.schedule();
    fire();
    expect(getPaints()).toBe(1);
    s.schedule();
    expect(getRafCalls()).toBe(2);
  });

  it('cancel stops a pending paint', () => {
    const { s, fire, getPaints, cafIds } = setup();
    s.schedule();
    s.cancel();
    expect(cafIds).toEqual([1]);
    fire();
    expect(getPaints()).toBe(0);
  });

  it('schedules again after cancel', () => {
    const { s, getRafCalls } = setup();
    s.schedule();
    s.cancel();
    s.schedule();
    expect(getRafCalls()).toBe(2);
  });
});
