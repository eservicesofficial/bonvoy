#!/usr/bin/env python3
"""Regenerate every PWA icon with a pure black (#000000) background.

The user-provided source artwork (white rounded tile + BON VOY typography +
coral underline) is preserved pixel-for-pixel — only the dark-brown backdrop
is removed and replaced with pure black. The white tile is re-composited via
a supersampled rounded-rect alpha mask so the anti-aliased corners stay smooth.

- `any` icons        : tile = 64% of canvas, centered on pure black.
- `maskable` icons   : tile = 52% of canvas (fits the Android safe zone,
                       radius 40% => max inscribed square side ~56.6%).
"""
from PIL import Image, ImageDraw

SRC = "/home/z/my-project/upload/images.png"
OUT = "/home/z/my-project/public/icons"
BLACK = (0, 0, 0, 255)

img = Image.open(SRC).convert("RGBA")
W, H = img.size
print("source:", img.size, "corner px:", img.getpixel((2, 2)))

# ---------------------------------------------------------------- tile bbox
# White tile = large bright region. Threshold luminance and take its bbox.
gray = img.convert("L")
bright = gray.point(lambda p: 255 if p > 200 else 0)
bbox = bright.getbbox()
print("tile bbox:", bbox)
tx0, ty0, tx1, ty1 = bbox
tw, th = tx1 - tx0, ty1 - ty0
tile = img.crop(bbox)

# ---------------------------------------------------------- corner radius
# On the first bright row the white span is narrower by ~2r at each side.
span_rows = []
for dy in (0, 1, 2):
    row = bright.crop((0, ty0 + dy, W, ty0 + dy + 1))
    rb = row.getbbox()
    if rb:
        span_rows.append(rb[2] - rb[0])
radius_est = max(6, int((tw - min(span_rows)) / 2)) if span_rows else int(tw * 0.22)
print("tile size:", (tw, th), "radius estimate:", radius_est)

# ------------------------------------------------- rounded-rect alpha mask
SS = 4  # supersample factor for smooth anti-aliased corners
mask = Image.new("L", (tw * SS, th * SS), 0)
d = ImageDraw.Draw(mask)
d.rounded_rectangle(
    [0, 0, tw * SS - 1, th * SS - 1],
    radius=radius_est * SS,
    fill=255,
)
mask = mask.resize((tw, th), Image.LANCZOS)
tile.putalpha(mask)

# ------------------------------------------------------------------- jobs
def make_icon(name: int, size: int, tile_ratio: float) -> None:
    canvas = Image.new("RGBA", (size, size), BLACK)
    t = int(round(size * tile_ratio))
    # keep 1:1 aspect of the tile artwork; scale to `t` on its larger side
    scale = min(t / tw, t / th)
    nw, nh = max(1, int(round(tw * scale))), max(1, int(round(th * scale)))
    t_scaled = tile.resize((nw, nh), Image.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(t_scaled, (x, y), t_scaled)
    canvas.convert("RGB").save(f"{OUT}/{name}", "PNG", optimize=True)
    print("wrote", name, f"{size}px tile={nw}x{nh}")

jobs = [
    ("icon-512.png", 512, 0.64),
    ("icon-192.png", 192, 0.64),
    ("apple-touch-icon.png", 180, 0.64),
    ("favicon.png", 48, 0.64),
    ("maskable-512.png", 512, 0.52),
    ("maskable-192.png", 192, 0.52),
]
for name, size, ratio in jobs:
    make_icon(name, size, ratio)
print("done — pure black background, white tile centered, maskable safe zones respected")
