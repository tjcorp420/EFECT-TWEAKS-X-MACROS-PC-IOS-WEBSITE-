# EMX TWEAKS Design System

## Direction

EMX combines premium PC hardware software, competitive gaming utilities, and enthusiast control software. The experience should feel precise and confident rather than noisy.

Avoid generic SaaS cards, full-page gradients, matrix effects, fake telemetry, excessive particles, random cyberpunk decoration, pill-shaped everything, or glow on every surface.

## Foundation tokens

The implemented source of truth is `foundation.css`.

| Role | Token | Baseline |
| --- | --- | --- |
| Canvas | `--emx-bg` | `#05030a` |
| Raised canvas | `--emx-bg-raised` | `#0d0913` |
| Glass surface | `--emx-surface` | translucent dark violet |
| Strong surface | `--emx-surface-strong` | `#171021` |
| Primary text | `--emx-text` | `#f8f5ff` |
| Muted text | `--emx-text-muted` | `#aaa2b8` |
| Green accent | `--emx-green` | `#9bff3a` |
| Purple accent | `--emx-purple` | `#c15cff` |
| Border | `--emx-border` | low-contrast lavender white |
| Focus | `--emx-focus` | green outer ring plus dark separation |

The historic `#39ff14` and `#b026ff` remain brand references, but accessible UI tokens may be adjusted for contrast and readability.

## Typography

- Display: Space Grotesk, then Inter, then a system sans-serif fallback.
- Interface/body: Inter, then Windows/system sans-serif.
- Use type scale and spacing before color or glow to create hierarchy.
- Body copy should normally be 16 px or larger with a 1.55-1.8 line height.
- All-caps labels are short, tracked, and secondary. Do not write paragraphs in all caps.

## Surfaces and spacing

- Compact controls: 10-14 px radius.
- Cards: 16-20 px radius.
- Feature panels: 20-24 px radius.
- Use a 4 px base spacing system, with primary layout steps of 8, 12, 16, 24, 32, 48, 64, and 96 px.
- Glass surfaces require a visible border and readable solid fallback. Blur is enhancement, not the only separation cue.
- Section width defaults to 1200 px with at least 16 px mobile gutters and 24 px desktop gutters.

## Controls

Every interactive control needs default, hover, focus-visible, pressed, disabled, loading, success, warning, and error treatments where applicable. Keyboard focus must never rely only on color.

Primary actions use the green-to-purple relationship sparingly. Secondary actions use a dark surface and clear border. Destructive controls use red and explicit language.

## Motion

- Micro interaction: 120-180 ms.
- Standard transition: 220-350 ms.
- Hero/section reveal: 400-700 ms.
- Prefer opacity and transform. Avoid animated blur, large shadows, layout properties, and perpetual movement.
- No click interception, scroll-jacking, cursor replacement, boot gate, or forced animation may delay navigation.
- `prefers-reduced-motion: reduce` must stop non-essential motion and smooth scrolling.

## Responsive behavior

- Compact mobile: 320-479 px.
- Mobile: 480-767 px.
- Tablet: 768-1023 px.
- Desktop: 1024-1599 px.
- Large desktop: 1600 px and above.

Mobile layouts must be purpose-built. Primary actions remain visible and at least 44 px tall. Navigation collapses into an accessible disclosure instead of relying on a clipped horizontal strip.

## Imagery

Use real EMX product captures with honest captions. Provide intrinsic dimensions, responsive sizing, useful alt text, and lazy loading below the first viewport. Do not expose screenshots containing license keys, email addresses, receipt IDs, hardware IDs, or private dashboards.
