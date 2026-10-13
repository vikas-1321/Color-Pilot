# ColorPilot v0.4

Live color controller for any web page.

## Install (developer mode)
1. Open `chrome://extensions`, turn on **Developer mode**
2. **Load unpacked** and select this folder (if updating: click the reload icon on the extension card)
3. Open a site and click the icon, or press **Alt+Shift+C**

## What's new in v0.4
- **Same-Domain Persistence Across Pages & Sections**: When you customize colors on a site (e.g. `https://www.pantaloons.com/`), your toggled colors automatically persist as you navigate between sections (Men's wear, Women's wear, Kids, product pages, etc.). Works seamlessly on both full page reloads and client-side SPA routing (`pushState`, `popstate`, `hashchange`).
- **New Domain Isolation (Native Defaults Untouched)**: When you open a new or different website, ColorPilot leaves the webpage in its native default colors. Only domains where you've actively customized colors are persisted. Clicking "Reset" removes the domain state and restores the original website styling.
- **Universal Global Theme Library**: Saved themes are now saved globally in local storage across all websites. Because ColorPilot stores semantic roles (`Primary`, `Secondary`, `Accent`, `Background`, `Text`, etc.), you can save a theme on one website and apply it to *any other website* with a single click.

## What's new in v0.3
- **Smart Color Suggestions & Templates**: Dedicated "Suggestions" tab offering 1-click curated templates and geometric color harmonies (Analogous, Complementary, Triadic, Modern SaaS, Cyber Emerald, Sunset, etc.) generated dynamically based on the current UI mode and brand primary hue.
- **Interactive Element Highlighting**: Hover over any color swatch or row to instantly highlight all matching elements across the page with a glowing outline.
- **Direct CSS Variable Overriding**: Mutates `:root` custom properties (`--primary`, shadcn triplets, etc.) directly on `document.documentElement` for instant, native framework reactivity without selector friction.
- **Shadow DOM & Web Components Scanning**: Recursively pierces open `#shadow-root` trees and adopts shadow stylesheets, allowing color inspection and recoloring inside modern web components.
- **Dark / Light Mode Toggle**: Dedicated header button (☀️ / 🌙) to detect and toggle between light and dark themes on the fly and rescan colors immediately.

## What's new in v0.2
**Better recognition.** Roles are scored from four kinds of evidence:
1. **CSS variable names** (`--primary`, `--brand`, `--bg-card`, `--destructive`, ...). Names are tokenized, so `--text-primary` is Text, not Primary, and `--primary-dark` counts as a weaker vote. Variables that alias others are resolved to their final color.
2. **`<meta name="theme-color">`** is treated as the brand color.
3. **Usage**: buttons, links, headings, header/nav/footer/hero backgrounds, area on screen, font size, above-the-fold weight.
4. **OKLCH color science**: dark, low-chroma brand colors (like deep forest green) are no longer mistaken for neutrals. The page background comes from the real canvas (body/html), so a dark hero can no longer steal the Background role.

Hover over a row to see why it got its role. Under each role you can see which variable it came from.

**Changes now always apply.**
- The parser handles `rgb(31 58 46 / var(--tw-bg-opacity))`, `oklch()`, `color-mix()`, `hsl` triplet variables (shadcn), gradients and shadows.
- After every change, ColorPilot checks the page: any element whose color did not actually change is patched directly, including `::before` / `::after`. The status shows "N patched".
- The `theme-color` meta tag follows your primary color.

**Color wheel** (second tab). Adobe-style wheel with 5 handles linked to roles.
- Rules: Analogous, Monochromatic, Triad, Complementary, Split complementary, Square, Compound, Shades, or Free.
- Drag any handle: all linked roles move together. Brightness slider, Random, and Sync-from-page buttons.
- Use the dropdown next to each handle to choose which role it controls.

## Code Structure
The codebase is cleanly divided into modular, single-responsibility files under `src/`:

- [background.js](.../colorpilot/background.js) — Service worker, shortcut handling, and script injection.
- [content.js](.../colorpilot/content.js) — Main entrypoint that boots and orchestrates all modules.
- [`src/state.js`](.../colorpilot/src/state.js) — Central state store, constants, roles, and `Sheet` abstraction.
- [`src/color-math.js`](.../colorpilot/src/color-math.js) — Offscreen canvas parser, OKLab/OKLCH, HSV math, and WCAG contrast.
- [`src/css-parser.js`](.../colorpilot/src/css-parser.js) — CSS tokenizers, Tailwind v3 slash syntax, and shadcn HSL triplets.
- [`src/scanner.js`](.../colorpilot/src/scanner.js) — DOM element & Shadow DOM traversal, computed style extraction.
- [`src/clustering.js`](.../colorpilot/src/clustering.js) — OKLab clustering, satellite shades, and semantic role scoring.
- [`src/overrides.js`](.../colorpilot/src/overrides.js) — `:root` CSS custom property mutation, stylesheet overrides, verification, and interactive highlighting.
- [`src/templates.js`](.../colorpilot/src/templates.js) — Dynamic UI-aware template generation and Dark/Light mode switcher.
- [`src/ui.js`](.../colorpilot/src/ui.js) — Shadow DOM floating GUI, Palette rows, Color Wheel, Suggestions tab, and export overlays.

## Known limits
- Cross-origin stylesheets without CORS: patched per element, so their hover styles may not follow.
- Closed shadow roots and cross-origin iframes are not touched. Colors baked into raster images are not changed.
- Content added after the scan needs a **Rescan**.

