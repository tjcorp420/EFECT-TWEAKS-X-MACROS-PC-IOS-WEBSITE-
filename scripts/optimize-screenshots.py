"""Create responsive WebP derivatives while preserving full-resolution originals."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = (
    "app-screenshots/volt-current/*.png",
    "app-screenshots/emx-windows-tweak-dashboard-*.png",
    "assets/emx-os/*.png",
    "assets/emx-clips/*.png",
    "assets/free-tools/*.png",
    "assets/free-tools/*.jpg",
    "emx-aim-trainer-command-center.png",
)
WIDTHS = (640, 960)


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


if __name__ == "__main__":
    main()
