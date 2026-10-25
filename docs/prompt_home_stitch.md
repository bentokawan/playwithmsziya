# Prompt Stitch (Google) — Halaman Home "Play with Ms zia"

Dokumen ini berisi instruksi terstruktur untuk di-input ke **Stitch (stitch.google)** guna men-generate desain UI halaman **Home / Beranda** aplikasi "Play with Ms zia". Arah desain: **bersih, minimalis, tenang** — terinspirasi estetika Skandinavia untuk anak-anak, bukan gaya game anak yang ramai dan penuh ornamen.

---

```markdown
Design a clean, minimalist, and child-friendly Home screen for "Play with Ms zia" — a preschool educational web game for children aged 4–6. The layout is landscape-oriented (1280×720 canvas, touch-friendly, tablet-optimized).

The visual philosophy is calm, warm, and modern — inspired by Scandinavian children's design, Headspace for Kids, and Khan Academy Kids' cleaner layouts. The screen should feel like a cozy, sunlit room: uncluttered, breathable, and immediately intuitive. A child should understand how to navigate this screen within 3 seconds.

---

### 1. Visual Style & Atmosphere

- **Art Direction:** Soft flat illustration style. No chunky outlines, no 3D embossing, no heavy drop shadows. Everything feels light, airy, and gently rounded.
- **Mood:** Calm, warm, inviting, encouraging. A gentle "welcome home" feeling — not an overstimulating arcade.
- **Background:** Solid soft warm white (`#FAF8F5`) or very pale cream (`#FFF9F2`). Completely clean — no patterns, no floating letters, no watermarks, no confetti, no decorative glyphs. Just a quiet, warm canvas.
- **Borders:** Thin 1px borders using `#E8E4DF` (warm light gray) or no borders at all — rely on subtle box shadows for separation instead.
- **Shadows:** Soft blur shadows only — e.g. `box-shadow: 0 2px 12px rgba(31, 42, 92, 0.06)`. No hard offset drop shadows.
- **Corner Radius:** Consistently rounded but not extreme — `border-radius: 16px` for cards, `12px` for buttons, `20px` for the bottom dock.
- **Spacing:** Generous whitespace everywhere. Minimum 16px–24px gaps between all interactive elements. The layout should breathe.
- **Typography:**
  - Headings & Game Titles: **Fredoka** or **Baloo 2** — rounded and friendly, but used at moderate weight (SemiBold, not Extra Bold). No text outlines, no text strokes, no text shadows.
  - Body text, labels, badges: **Nunito** (SemiBold), clean and highly readable.
  - Text color: Deep navy `#1F2A5C` for primary text, `#6B7280` (soft gray) for secondary/meta text.

---

### 2. Layout Structure

The screen has 4 horizontal zones stacked vertically with generous spacing between them:
```

┌─────────────────────────────────────────────────────┐
│ Header Bar │
├─────────────────────────────────────────────────────┤
│ Category Filter Tabs │
├─────────────────────────────────────────────────────┤
│ │
│ Game Card Grid (3 columns × 3 rows) │
│ │
├─────────────────────────────────────────────────────┤
│ Bottom Dock │
└─────────────────────────────────────────────────────┘

```

---

### 3. Component Details

#### 3A. Header Bar

A slim, clean horizontal bar at the top with comfortable padding (16px vertical, 24px horizontal).

- **Left side:**
  - A small, friendly mascot avatar of "Ms zia" (approx 40×40px, circular, with a subtle 2px white border and soft shadow).
  - Next to it: the app title **"Play with Ms zia"** in Fredoka SemiBold, ~18px, navy `#1F2A5C`. Simple text — no bubble letters, no outlines, no colored strokes. Clean and confident.

- **Right side — Utility buttons in a row, spaced 12px apart:**
  - **Language toggle:** A small pill button (height 36px) showing a flag icon (🇮🇩 or 🇬🇧) and the label "ID" or "EN" in Nunito SemiBold 13px. A tiny lock icon `🔒` (12px, muted gray) sits beside it to indicate parental protection. Background: `#F3F1EE`, border: none, corner-radius: 10px.
  - **Fullscreen toggle:** A 36×36px circle button with a subtle expand-arrows icon (thin line icon, navy `#1F2A5C`). Background: `#F3F1EE`.
  - **Sound toggle:** A 36×36px circle button with a speaker icon (thin line style). Background: `#F3F1EE`.
  - All utility buttons have no borders — just the soft light gray background fill and a very subtle hover shadow.

#### 3B. Category Filter Tab Bar

A horizontal row of 5 filter tabs, centered below the header, with 10px gaps between tabs. Each tab is a rounded pill (height ~40px, horizontal padding 16px–20px).

- **Active tab:** White background, subtle shadow (`0 2px 8px rgba(0,0,0,0.06)`), text in navy `#1F2A5C`, small emoji icon to the left of the label.
- **Inactive tabs:** Transparent background, text in `#9CA3AF` (muted gray), no shadow. On hover: background transitions to `#F9F7F4`.

Tab labels (left to right):
1. ☀️ **Semua Mainan** — shows all 9 games (default active)
2. 🔢 **Angka** — filters to 2 number games
3. 🔤 **Huruf** — filters to 3 letter games
4. 🌙 **Hijaiyyah** — filters to 2 hijaiyyah games
5. 🧩 **Ingat & Main** — filters to 2 memory/puzzle games

#### 3C. Game Card Grid

A responsive 3-column grid of 9 game cards, centered in the content area. Grid gap: 16px–20px both horizontally and vertically. Each card is approx 260–280px wide and 160–170px tall.

**Individual Card Design:**
- **Background:** Pure white `#FFFFFF`.
- **Border:** None — rely on a soft shadow: `box-shadow: 0 2px 16px rgba(31, 42, 92, 0.05)`.
- **Corner radius:** 16px.
- **Internal padding:** 16px.
- **Layout inside card (vertical stack):**
  - **Top area:** A simple, gentle flat illustration or icon (approx 60×60px) representing the game concept. The illustration sits on a very light tinted circle or rounded-square background using the category's pastel color at ~10% opacity. Icons should be clean line-art or minimal flat style — not chunky, not 3D, not embossed.
  - **Category badge:** A tiny pill label (font-size 11px, Nunito SemiBold) showing the category name. Background is the category color at 12% opacity, text color is the category color at full saturation. No border. Positioned above or below the game title.
  - **Game title:** Fredoka SemiBold, 15px, navy `#1F2A5C`. One line, no wrapping.
  - **Star rating:** 3 small stars (14px) in a row. Earned stars are filled gold `#FFD200`, unearned stars are light gray `#E5E7EB`. No outlines on the stars.

**The 9 Game Cards:**

1. **Ayo Berhitung** — Category: Angka (blue). Icon: Simple line-art of 3 fruits (apple, banana, orange) with a small "123" label. Stars: ★★★
2. **Menulis Angka** — Category: Angka (blue). Icon: A clean number "5" with a subtle dotted tracing path and a small pencil. Stars: ★★★
3. **Susun Kata** — Category: Huruf (coral). Icon: Three letter blocks "A", "P", "L" arranged in a row. Stars: ★★★
4. **Bunyi Awal** — Category: Huruf (coral). Icon: A small ear with gentle sound waves and the letter "B". Stars: ★★★
5. **Menulis Huruf** — Category: Huruf (coral). Icon: A clean letter "A" with a dotted tracing path. Stars: ★★★
6. **Dengar & Temukan** — Category: Hijaiyyah (teal). Icon: Arabic letter "ب" with a small speaker icon beside it. Stars: ★★★
7. **Tebalkan Hijaiyyah** — Category: Hijaiyyah (teal). Icon: Arabic letter "ج" with a subtle dotted outline and a small start-point dot. Stars: ★★★
8. **Kartu Kembar** — Category: Ingat & Main (lavender). Icon: Two simple playing cards, one face-up with a star, one face-down. Stars: ★★★
9. **Petualangan Labirin** — Category: Ingat & Main (lavender). Icon: A simple mini-maze path with a small flag at the end. Stars: ★★★

**Category color mapping (used at low opacity for card accents):**
- Angka: Soft blue `#4DB8FF` → card accent tint: `rgba(77, 184, 255, 0.10)`
- Huruf: Soft coral `#FF6B6B` → card accent tint: `rgba(255, 107, 107, 0.10)`
- Hijaiyyah: Soft teal `#3DE6CF` → card accent tint: `rgba(61, 230, 207, 0.10)`
- Ingat & Main: Soft lavender `#9B8CFF` → card accent tint: `rgba(155, 140, 255, 0.10)`

#### 3D. Bottom Dock

A floating horizontal bar at the bottom of the screen, centered, with rounded corners (`border-radius: 20px`). Width: ~90% of the viewport or auto-fit content. Background: white `#FFFFFF` with a soft upward shadow (`0 -2px 16px rgba(31, 42, 92, 0.06)`). Internal padding: 12px 24px. Items are laid out in a single row with `justify-content: space-between` and `align-items: center`.

**Dock contents (left to right):**

1. **Child Profile module:**
   - A small circular avatar (32×32px) with a gentle 2px border in `#E8E4DF`.
   - Beside it: Nickname **"Adik Bintang"** (Nunito SemiBold, 14px, navy) on one line, and a tiny muted label below: "🔥 3 hari berturut" (play streak, Nunito Regular 11px, `#9CA3AF`).

2. **Star Counter module:**
   - A small gold star icon `⭐` (20px).
   - Next to it: **"12 Bintang"** (Nunito SemiBold, 14px, navy).

3. **Mode Toggle:**
   - A compact segmented control / toggle pill (height 36px, corner-radius 10px, background `#F3F1EE`).
   - Two segments: **"👤 1 Pemain"** and **"👥 2 Pemain"**.
   - Active segment: white background with subtle shadow, navy text.
   - Inactive segment: transparent, muted gray text.

4. **Parent Area button:**
   - A small pill button (height 36px): subtle gray background `#F3F1EE`, icon of a small lock `🔒`, label **"Orang Tua"** in Nunito SemiBold 12px, muted gray text `#9CA3AF`.
   - On hover, a tooltip or micro-label: "Tahan 3 detik".

---

### 4. Color Palette Summary

| Role | Color | Usage |
|---|---|---|
| Primary Background | `#FAF8F5` (warm white) | Full page background |
| Card Surface | `#FFFFFF` (white) | Game cards, bottom dock |
| Subtle Surface | `#F3F1EE` (light warm gray) | Button backgrounds, inactive tabs |
| Border / Divider | `#E8E4DF` (warm gray) | Thin separators if needed |
| Primary Text | `#1F2A5C` (deep navy) | Headings, game titles, active labels |
| Secondary Text | `#9CA3AF` (muted gray) | Meta info, inactive labels |
| Angka Accent | `#4DB8FF` (soft blue) | Category badges, card accent tint |
| Huruf Accent | `#FF6B6B` (soft coral) | Category badges, card accent tint |
| Hijaiyyah Accent | `#3DE6CF` (soft teal) | Category badges, card accent tint |
| Ingat & Main Accent | `#9B8CFF` (soft lavender) | Category badges, card accent tint |
| Star Gold | `#FFD200` | Filled star ratings |
| Star Empty | `#E5E7EB` | Unfilled star ratings |

---

### 5. Key Design Constraints

- **NO** busy background patterns, floating letters, watermarked glyphs, or confetti.
- **NO** thick navy outlines (4-6px). Use thin 1px borders or shadows only.
- **NO** hard offset drop shadows. Only soft blurred shadows.
- **NO** saturated/vibrant fills on large surfaces. Category colors appear only as subtle tints at ~10% opacity.
- **NO** 3D embossed elements, chunky buttons, or heavy decorative textures.
- **NO** text outlines, text shadows, or text strokes on typography.
- Minimum touch target: 44×44px (all interactive elements).
- All interactive elements must have clear hover/focus states (subtle shadow increase or gentle background shift).
- The overall screen should feel like a well-designed, calm Scandinavian toy shelf — organized, warm, and inviting — not like a noisy carnival game booth.
```
