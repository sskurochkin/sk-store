#!/usr/bin/env python3
"""Generate favicon assets from public/favicon.png."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "favicon.png"
APP_DIR = ROOT / "src" / "app"
PUBLIC_DIR = ROOT / "public"

PNG_SIZES: dict[str, int] = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}

ICO_SIZES = (16, 32, 48)


def resize_image(source: Image.Image, size: int) -> Image.Image:
    image = source.convert("RGBA")
    return image.resize((size, size), Image.Resampling.LANCZOS)


def write_png(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def write_ico(path: Path, source: Image.Image) -> None:
    images = [resize_image(source, size) for size in ICO_SIZES]
    path.parent.mkdir(parents=True, exist_ok=True)
    images[0].save(
        path,
        format="ICO",
        sizes=[(img.width, img.height) for img in images],
        append_images=images[1:],
    )


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Source not found: {SOURCE}")

    source = Image.open(SOURCE)
    print(f"Source: {SOURCE} ({source.width}x{source.height})")

    write_ico(APP_DIR / "favicon.ico", source)
    write_ico(PUBLIC_DIR / "favicon.ico", source)
    print("Wrote favicon.ico (16, 32, 48)")

    for filename, size in PNG_SIZES.items():
        write_png(PUBLIC_DIR / filename, resize_image(source, size))
        print(f"Wrote public/{filename} ({size}x{size})")

    write_png(APP_DIR / "icon.png", resize_image(source, 32))
    write_png(APP_DIR / "apple-icon.png", resize_image(source, 180))
    print("Wrote src/app/icon.png and apple-icon.png")

    manifest = """{
  "name": "SK Store",
  "short_name": "SK Store",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
"""
    (PUBLIC_DIR / "site.webmanifest").write_text(manifest, encoding="utf-8")
    print("Wrote public/site.webmanifest")


if __name__ == "__main__":
    main()
