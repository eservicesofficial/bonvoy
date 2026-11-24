#!/usr/bin/env python3
"""
Regenerate EVERY Bonvoy brand asset from the user-supplied logo:
  upload/file_0000000089e08211849e68584ca3799d.png
  (white distressed "BON VOY" sticker on pure black, 1254x1254)

Outputs (all under /home/z/my-project/public):
  icons/icon-192.png / icons/icon-512.png          purpose "any"      - black bg, sticker ~70%
  icons/maskable-192.png / icons/maskable-512.png  purpose "maskable" - black bg, sticker 55% (safe zone)
  icons/apple-touch-icon.png (180x180)             black bg, sticker ~70%
  icons/favicon.png (48x48)                        black bg, sticker ~78%
  logo.png (transparent sticker)                   for in-app UI (MarriottLogo component)
"""
from PIL import Image, ImageFilter
import numpy as np
import os

SRC = "/home/z/my-project/upload/file_0000000089e08211849e68584ca3799d.png"
OUT = "/home/z/my-project/public"
os.makedirs(f"{OUT}/icons", exist_ok=True)

src = Image.open(SRC).convert("RGB")
SW, SH = src.size
print(f"source: {SW}x{SH}")

arr = np.asarray(src).astype(np.int16)
lum = arr.mean(axis=2)

# ---- dense bounding box of the sticker body ----
# per-column / per-row counts of strong-white pixels; the sticker body has
# hundreds per axis while stray distress speckles only contribute a few
strong = lum > 180
col_cnt = strong.sum(axis=0)
row_cnt = strong.sum(axis=1)
col_thr = col_cnt.max() * 0.08
row_thr = row_cnt.max() * 0.08
cols = np.where(col_cnt >= col_thr)[0]
rows = np.where(row_cnt >= row_thr)[0]
x0, x1 = int(cols[0]), int(cols[-1]) + 1
y0, y1 = int(rows[0]), int(rows[-1]) + 1
print(f"sticker dense bbox: x {x0}..{x1} ({x1-x0}px)  y {y0}..{y1} ({y1-y0}px)")

# square crop around the sticker center, padded to keep the distressed fringe
cw, ch = x1 - x0, y1 - y0
side = int(max(cw, ch) * 1.045)  # +~2.2% margin each side
ccx, ccy = (x0 + x1) // 2, (y0 + y1) // 2
half = side // 2
crop_box = (
    max(0, ccx - half), max(0, ccy - half),
    min(SW, ccx - half + side), min(SH, ccy - half + side),
)
sticker = src.crop(crop_box).resize((side, side), Image.LANCZOS)

# ---- transparent version: flood-fill the outer black from the borders ----
sl = np.asarray(sticker.convert("RGB")).astype(np.int16).mean(axis=2)
dark = sl < 95
passable = np.zeros_like(dark, dtype=bool)
passable[0, :] = dark[0, :]
passable[-1, :] = dark[-1, :]
passable[:, 0] = dark[:, 0]
passable[:, -1] = dark[:, -1]
while True:
    prev = passable
    grown = passable.copy()
    grown[1:, :] |= passable[:-1, :]
    grown[:-1, :] |= passable[1:, :]
    grown[:, 1:] |= passable[:, :-1]
    grown[:, :-1] |= passable[:, 1:]
    passable = grown & dark
    if (passable == prev).all():
        break

alpha = np.where(passable, 0, 255).astype(np.uint8)
alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.1))
logo_rgba = sticker.convert("RGBA")
logo_rgba.putalpha(alpha_img)

# trim fully transparent margins
a = np.asarray(alpha_img)
tcols = np.where(a.max(axis=0) > 8)[0]
trows = np.where(a.max(axis=1) > 8)[0]
logo_rgba = logo_rgba.crop(
    (int(tcols[0]), int(trows[0]), int(tcols[-1]) + 1, int(trows[-1]) + 1)
)
logo_rgba.save(f"{OUT}/logo.png")
print(f"logo.png: {logo_rgba.size}, transparent: {(a == 0).mean() * 100:.1f}%")

# ---- "any" icons: the uploaded composition IS the icon (sticker ~86%, centered) ----
def make_plain(size: int, path: str) -> None:
    src.resize((size, size), Image.LANCZOS).save(path)
    print(f"{os.path.basename(path)}: {size}px, uploaded composition")

# ---- maskable: sticker re-centered inside the adaptive-icon safe zone ----
def make_icon(size: int, rel: float, path: str) -> None:
    canvas = Image.new("RGB", (size, size), "#000000")
    target = int(round(size * rel))
    s = logo_rgba.resize((target, target), Image.LANCZOS)
    off = (size - target) // 2
    canvas.paste(s, (off, off), s)
    canvas.save(path)
    print(f"{os.path.basename(path)}: {size}px, sticker box {rel * 100:.0f}%")

make_plain(512, f"{OUT}/icons/icon-512.png")
make_plain(192, f"{OUT}/icons/icon-192.png")
make_plain(180, f"{OUT}/icons/apple-touch-icon.png")
make_plain(48, f"{OUT}/icons/favicon.png")
make_icon(512, 0.58, f"{OUT}/icons/maskable-512.png")
make_icon(192, 0.58, f"{OUT}/icons/maskable-192.png")

# ---- verify ----
print("\n--- verification ---")
for f in ["icons/icon-192.png", "icons/icon-512.png", "icons/maskable-192.png",
          "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon.png", "logo.png"]:
    im = Image.open(f"{OUT}/{f}")
    a = np.asarray(im.convert("RGBA"))
    corners = [a[2, 2], a[2, -3], a[-3, 2], a[-3, -3]]
    # opaque bbox (visual content extent)
    op = a[:, :, 3] > 16
    if op.any():
        ys, xs = np.where(op)
        ext = (xs.max() - xs.min() + 1, ys.max() - ys.min() + 1)
    else:
        ext = (0, 0)
    print(f"{f}: {im.size} {im.mode} corners-lum={[int(c[:3].mean()) for c in corners]} content={ext}")
