import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'phone-360x800', width: 360, height: 800 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
] as const;

const ROUTES = [
  { name: 'home', path: '/home' },
  { name: 'intro-g01', path: '/game/ayo-berhitung/intro' },
  { name: 'play-g01', path: '/game/ayo-berhitung/play?level=mudah&players=1' },
] as const;

test.describe('Touch targets & responsive layout (T7.4)', () => {
  for (const vp of VIEWPORTS) {
    test(`no horizontal overflow & valid touch targets at ${vp.name}`, async ({ page }, info) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        window.__MSZ_TEST__ = {};
        window.localStorage.setItem(
          'msz:prefs',
          JSON.stringify({
            schemaVersion: 1,
            locale: 'id',
            muted: false,
            musicOn: true,
            calmMotion: true,
            thickLines: false,
            hijaiyyahNatureOnly: false,
          }),
        );
      });

      for (const route of ROUTES) {
        await page.goto(route.path);
        await page.waitForTimeout(250);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${route.path} overflow at ${vp.name}`).toBeLessThanOrEqual(2);

        const boxes = await page.evaluate(() => {
          const els = Array.from(
            document.querySelectorAll('button, a, [role="button"], [role="switch"]'),
          );
          return els
            .map((el) => {
              const r = el.getBoundingClientRect();
              const isChoice = el.hasAttribute('data-choice');
              return {
                tag: el.tagName,
                text: (el.textContent ?? '').trim().slice(0, 24),
                aria: el.getAttribute('aria-label') ?? '',
                isChoice,
                w: Math.round(r.width),
                h: Math.round(r.height),
              };
            })
            .filter((b) => b.w > 0 && b.h > 0);
        });

        for (const box of boxes) {
          if (box.isChoice) {
            expect(
              Math.min(box.w, box.h),
              `choice ${box.text || box.aria} at ${route.path} ${vp.name}: ${box.w}x${box.h}`,
            ).toBeGreaterThanOrEqual(64);
          } else {
            expect(
              Math.min(box.w, box.h),
              `control ${box.text || box.aria} at ${route.path} ${vp.name}: ${box.w}x${box.h}`,
            ).toBeGreaterThanOrEqual(48);
          }
        }

        if (info.project.name === 'chromium-tablet') {
          await page.screenshot({
            path: `e2e/__screenshots__/${vp.name}-${route.name}.png`,
            fullPage: false,
          });
        }
      }
    });
  }
});
