"""Create responsive WebP derivatives while preserving full-resolution originals."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = (
    "app-screenshots/volt-current/*.png",
    "app-screenshots/emx-windows-tweak-dashboard-*.png",
    "assets/emx-os/*.png",
    "assets/emx-clips/*.png",
    "assets/emx-volt-v0.1.76/dashboard.png",
    "assets/emx-desktop-flow-lite/cover.png",
    "assets/emx-taskbar-studio/appearance.png",
    "assets/free-tools/*.png",
    "assets/free-tools/*.jpg",
    "emx-aim-trainer-command-center.png",
)
WIDTHS = (640, 960)

# Mode cards arrive at card size already (227-622px wide), so the responsive
# ladder above would only upscale them. These are converted once, at their own
# width, next to the PNG the game exported.
NATIVE_PATTERNS = ("assets/project-emx/modes/*.png",)


def output_path(source: Path, width: int) -> Path:
    return source.with_name(f"{source.stem}-{width}.webp")


def main() -> None:
    sources = sorted({path for pattern in PATTERNS for path in ROOT.glob(pattern)})
    created = 0
    original_bytes = 0
    responsive_bytes = 0
    for source in sources:
        with Image.open(source) as image:
            image = image.convert("RGB")
            original_bytes += source.stat().st_size
            for width in WIDTHS:
                if image.width < width:
                    continue
                height = round(image.height * width / image.width)
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                destination = output_path(source, width)
                resized.save(destination, "WEBP", quality=84, method=6)
                responsive_bytes += destination.stat().st_size
                created += 1
    print(f"Created {created} responsive WebP files from {len(sources)} originals.")
    print(f"Original source bytes: {original_bytes:,}; responsive derivative bytes: {responsive_bytes:,}")

    cards = sorted({path for pattern in NATIVE_PATTERNS for path in ROOT.glob(pattern)})
    card_png_bytes = 0
    card_webp_bytes = 0
    for source in cards:
        with Image.open(source) as image:
            destination = source.with_suffix(".webp")
            image.convert("RGB").save(destination, "WEBP", quality=84, method=6)
            card_png_bytes += source.stat().st_size
            card_webp_bytes += destination.stat().st_size
    if cards:
        saved = card_png_bytes - card_webp_bytes
        print(f"Converted {len(cards)} mode cards at native width.")
        print(
            f"Card PNG bytes: {card_png_bytes:,}; WebP bytes: {card_webp_bytes:,} "
            f"({saved:,} saved, {saved / card_png_bytes:.0%})"
        )


if __name__ == "__main__":
    main()
