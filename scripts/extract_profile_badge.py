#!/usr/bin/env python3
"""Extract the ORIGINAL membership badge artwork from the user's uploaded icon
(EDIT_20261124_071043.png: white scalloped seal + orange award-medal glyph on a
brick-orange square) into a transparent RGBA PNG for the profile page.

Method:
  1. Flood-fill the flat brick background from every border pixel (tolerance
     based colour match) -> "outside" region. The seal is convex, so the fill
     never leaks into the medal glyph enclosed by the white seal.
  2. Badge mask = NOT outside; feather the mask edge (gaussian) so the scallop
     rim keeps smooth anti-aliasing.
  3. Crop to the artwork bbox and save.
"""
from PIL import Image, ImageFilter
from collections import deque
import numpy as np

SRC = "/home/z/my-project/upload/EDIT_20261124_071043.png"
DST = "/home/z/my-project/public/img/profile-badge-original.png"

img = Image.open(SRC).convert("RGB")
arr = np.asarray(img).astype(np.int16)
h, w, _ = arr.shape

# background reference = median of the four corners
corners = np.concatenate([
    arr[:6, :6].reshape(-1, 3), arr[:6, -6:].reshape(-1, 3),
    arr[-6:, :6].reshape(-1, 3), arr[-6:, -6:].reshape(-1, 3),
])
bg = np.median(corners, axis=0)
print("bg colour:", bg)

dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
outside = dist < 42  # candidate background pixels

# flood fill from all borders across `outside` pixels
reached = np.zeros((h, w), dtype=bool)
dq = deque()
for x in range(w):
    for y in (0, h - 1):
        if outside[y, x] and not reached[y, x]:
            reached[y, x] = True
            dq.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if outside[y, x] and not reached[y, x]:
            reached[y, x] = True
            dq.append((y, x))
while dq:
    y, x = dq.popleft()
    for ny, nx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
        if 0 <= ny < h and 0 <= nx < w and outside[ny, nx] and not reached[ny, nx]:
            reached[ny, nx] = True
            dq.append((ny, nx))

mask = (~reached).astype(np.uint8) * 255
print("badge pixels:", int((mask > 0).sum()), "of", h * w)

# feather the rim for clean anti-aliased edges
alpha = Image.fromarray(mask, "L").filter(ImageFilter.GaussianBlur(0.7))
alpha = np.asarray(alpha)

ys, xs = np.where(mask > 0)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
pad = 2
y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
y1, x1 = min(h - 1, y1 + pad), min(w - 1, x1 + pad)

rgba = np.dstack([np.asarray(img), alpha])[y0:y1 + 1, x0:x1 + 1]
out = Image.fromarray(rgba, "RGBA")
# 2x Lanczos resample of the SAME original artwork so the phone's 3x-DPR
# screen renders it crisp at the 56px display size.
big = out.resize((out.width * 2, out.height * 2), Image.LANCZOS)
big.save(DST)
print("saved", DST, big.size)

# sanity: corners must be fully transparent, seal body opaque
a = np.asarray(out)
print("corner alphas:", a[0, 0, 3], a[0, -1, 3], a[-1, 0, 3], a[-1, -1, 3])
print("centre alpha:", a[a.shape[0] // 2, a.shape[1] // 2, 3])
