import { useState } from 'react';
import { usePreferences } from '@/app/providers/usePreferences';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { ConfirmExit } from '@/components/ConfirmExit/ConfirmExit';
import { Dialog } from '@/components/Dialog/Dialog';
import { GameCard } from '@/components/GameCard/GameCard';
import { GrownUpGate } from '@/components/GrownUpGate/GrownUpGate';
import { HandHint } from '@/components/HandHint/HandHint';
import { HintBubble } from '@/components/HintBubble/HintBubble';
import { Icon, type IconName } from '@/components/icons/Icon';
import { LevelPicker } from '@/components/LevelPicker/LevelPicker';
import { RoundDots } from '@/components/RoundDots/RoundDots';
import { Scene } from '@/components/Scene/Scene';
import { Slot } from '@/components/Slot/Slot';
import { Sticker } from '@/components/Sticker/Sticker';
import { StickerReveal } from '@/components/StickerReveal/StickerReveal';
import { Tile } from '@/components/Tile/Tile';
import { TopNav } from '@/components/TopNav/TopNav';
import { TurnBanner } from '@/components/TurnBanner/TurnBanner';
import { CATALOG } from '@/games/catalog';
import { WORLD_IDS } from '@/games/ids';
import { TracingCanvas } from '@/games/engines/tracing/TracingCanvas';
import { DIGIT_GLYPHS } from '@/content/glyphs/digits';
import { HIJAIYYAH_GLYPHS } from '@/content/glyphs/hijaiyyah';
import { LATIN_LOWER_GLYPHS } from '@/content/glyphs/latin-lower';
import { LATIN_UPPER_GLYPHS } from '@/content/glyphs/latin-upper';
import type { Glyph } from '@/content/glyphs/types';
import { useContent } from '@/lib/content/useContent';
import type { DifficultyId } from '@/lib/session/session';
import logoUrl from '@/assets/logo.svg';
import { Jeje } from '@/worlds/characters/Jeje';
import { Kuku } from '@/worlds/characters/Kuku';
import { Lulu } from '@/worlds/characters/Lulu';
import { MsZiya } from '@/worlds/characters/MsZiya';
import { Pipi } from '@/worlds/characters/Pipi';
import type { CharacterMood } from '@/worlds/characters/types';
import styles from './KitPage.module.css';

const ALL_ICONS: readonly IconName[] = [
  'back',
  'home',
  'sound-on',
  'sound-off',
  'fullscreen-enter',
  'fullscreen-exit',
  'settings',
  'play',
  'replay',
  'star',
  'lock',
  'check',
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'hand-point',
  'listen',
];

export function KitPage() {
  const { prefs, update } = usePreferences();
  const { content } = useContent();
  const [level, setLevel] = useState<DifficultyId>('mudah');
  const [exitOpen, setExitOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className="t-title">Design System v2 Kit</h1>
        <BlockButton
          variant={prefs.calmMotion ? 'pink' : 'white'}
          size="nav"
          label={`Calm: ${prefs.calmMotion ? 'ON' : 'OFF'}`}
          onPress={() => update({ calmMotion: !prefs.calmMotion })}
        />
        <BlockButton
          variant="white"
          size="nav"
          label={`Locale: ${(prefs.locale ?? 'id').toUpperCase()}`}
          onPress={() => update({ locale: prefs.locale === 'en' ? 'id' : 'en' })}
        />
        <span className="t-body">{`Content: ${content.source} (v${content.version ?? 'bundled'})`}</span>
      </div>

      <section className={styles.section}>
        <h2 className="t-title">Icons</h2>
        <div className={styles.row}>
          {ALL_ICONS.map((name) => (
            <Icon key={name} name={name} size={32} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">BlockButton</h2>
        <div className={styles.row}>
          <BlockButton variant="primary" size="primary" icon="play" label="Mulai" onPress={() => {}} />
          <BlockButton variant="pink" size="choice" icon="star" label="Pink" onPress={() => {}} />
          <BlockButton variant="white" size="choice" icon="home" label="White" onPress={() => {}} />
          <BlockButton variant="icon" size="nav" icon="back" label="Back" onPress={() => {}} />
          <BlockButton variant="primary" size="choice" label="Disabled" disabled onPress={() => {}} />
          <BlockButton variant="primary" size="choice" label="Loading" loading onPress={() => {}} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">Tile &amp; Slot</h2>
        <div className={styles.row}>
          <Tile char="A" color="blue" state="idle" onPress={() => {}} />
          <Tile char="B" color="pink" state="selected" onPress={() => {}} />
          <Tile char="C" color="white" state="correct" onPress={() => {}} />
          <Tile char="D" color="blue" state="retry" onPress={() => {}} />
          <Tile char="7" color="blue" state="locked" onPress={() => {}} />
          <Tile char="ب" color="lantern" state="idle" lang="ar" onPress={() => {}} />
        </div>
        <div className={styles.row}>
          <Slot state="empty" ghostChar="A" />
          <Slot state="filled">P</Slot>
          <Slot state="correct">E</Slot>
          <Slot state="hint" ghostChar="L" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">HintBubble, HandHint, RoundDots, TurnBanner</h2>
        <div className={styles.row}>
          <HintBubble objectId="apple" onListen={() => {}} />
          <HintBubble objectId="cat" onListen={() => {}} speaking />
          <HandHint target={null} mode="point" inline />
          <HandHint target={null} mode="trace" inline />
          <RoundDots total={4} done={2} player={1} />
          <RoundDots total={4} done={3} player={2} />
        </div>
        <div className={styles.row}>
          <TurnBanner
            profile={{ name: 'Ana', avatar: 'kelinci', color: 'biru' }}
            visible
            variant="chip"
          />
          <TurnBanner
            profile={{ name: 'Budi', avatar: 'kucing', color: 'merah-muda' }}
            visible
            variant="chip"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">TopNav, Dialog, ConfirmExit, GrownUpGate</h2>
        <TopNav onBack={() => {}} center={<RoundDots total={3} done={1} />} rightExtra={<GrownUpGate onPass={() => setGatePassed(true)} />} />
        <div className={styles.row}>
          <BlockButton variant="white" size="choice" label="Open ConfirmExit" onPress={() => setExitOpen(true)} />
          <BlockButton variant="white" size="choice" label="Open Dialog" onPress={() => setDialogOpen(true)} />
          {gatePassed && <span className="t-body">Gate passed!</span>}
        </div>
        <ConfirmExit open={exitOpen} onStay={() => setExitOpen(false)} onLeave={() => setExitOpen(false)} />
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} labelledBy="kit-dialog-title">
          <h3 id="kit-dialog-title" className="t-title">Dialog</h3>
          <BlockButton variant="primary" size="choice" label="Close" onPress={() => setDialogOpen(false)} />
        </Dialog>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">LevelPicker</h2>
        <LevelPicker value={level} onChange={setLevel} />
      </section>

      <section className={styles.section}>
        <h2 className="t-title">Sticker &amp; StickerReveal</h2>
        <div className={styles.row}>
          <Sticker stickerId="angka-03" owned />
          <Sticker stickerId="huruf-02" owned={false} />
          <StickerReveal stickerId="memori-02" isNew />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">GameCard</h2>
        <div className={styles.row}>
          <GameCard entry={CATALOG['menulis-huruf']} onOpen={() => {}} />
          <GameCard entry={CATALOG['ayo-berhitung']} onOpen={() => {}} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">Logo &amp; Characters (5 × 3 moods)</h2>
        <img src={logoUrl} alt="Play with Ms Ziya" style={{ height: 64, width: 'auto', alignSelf: 'flex-start' }} />
        {(['happy', 'thinking', 'wow'] as readonly CharacterMood[]).map((mood) => (
          <div key={mood} className={styles.row}>
            <span className="t-body" style={{ minWidth: 90 }}>{mood}</span>
            <MsZiya mood={mood} size={72} />
            <Jeje mood={mood} size={56} />
            <Pipi mood={mood} size={96} />
            <Lulu mood={mood} size={64} />
            <Kuku mood={mood} size={88} />
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className="t-title">TracingCanvas (Glyph A) &amp; All Glyphs</h2>
        <div style={{ width: 260 }}>
          <TracingCanvas
            glyph={LATIN_UPPER_GLYPHS.A}
            difficulty="mudah"
            player={1}
            thickLines={prefs.thickLines}
            calmMotion={prefs.calmMotion}
            onComplete={() => {}}
          />
        </div>
        <div className={styles.row} style={{ flexWrap: 'wrap', gap: 8 }}>
          {(
            [
              ...Object.values(DIGIT_GLYPHS),
              ...Object.values(LATIN_UPPER_GLYPHS),
              ...Object.values(LATIN_LOWER_GLYPHS),
              ...Object.values(HIJAIYYAH_GLYPHS),
            ] as readonly Glyph[]
          ).map((g) => (
            <svg
              key={g.id}
              viewBox="0 0 100 100"
              width={48}
              height={48}
              style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--bg-surface)' }}
            >
              <title>{g.id}</title>
              {g.strokes.map((s, i) =>
                s.dot ? (
                  <circle key={i} cx={s.points[0][0]} cy={s.points[0][1]} r={5} fill="var(--ink-primary)" />
                ) : (
                  <polyline
                    key={i}
                    points={s.points.map(([x, y]) => `${x},${y}`).join(' ')}
                    fill="none"
                    stroke="var(--ink-primary)"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ),
              )}
            </svg>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="t-title">Scene Preview (4 worlds)</h2>
        <div className={styles.row}>
          {WORLD_IDS.map((w) => (
            <div key={w} style={{ width: 280, height: 180, overflow: 'hidden', borderRadius: 24 }}>
              <Scene worldId={w}>
                <TopNav onBack={() => {}} backIcon="home" />
              </Scene>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
