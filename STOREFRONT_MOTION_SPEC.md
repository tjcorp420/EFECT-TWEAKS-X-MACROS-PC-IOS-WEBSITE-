# Storefront Motion Specification

The home intro is an original EMX sequence driven by published catalog records whose `showInIntro` flag is enabled. It does not copy third-party artwork, layouts, wording, or claims.

- Default duration: 7.6 seconds, bounded to 3–12 seconds.
- Replay: once per session by default; internal same-origin navigation never replays it.
- Accessibility: `prefers-reduced-motion` disables the sequence; skip is visible and keyboard operable.
- Content: logo identity, then up to five ordered product records, then the EMX finale.
- Intensity: `calm`, `balanced`, or `high` is accepted by the settings model.
- Failure behavior: missing API/settings falls back to checked-in catalog/default settings; an empty catalog skips the intro.

Motion must remain behind controls, avoid rapid flashing, and never block access longer than the configured duration.
