#!/usr/bin/env python3
"""
PWA app icons = the user's uploaded logo image EXACTLY, only resized to the
required PNG dimensions. No recomposition, no recoloring, no safe-zone
repositioning — just LANCZOS downscale of the original file.

Source: upload/file_0000000089e08211849e68584ca3799d.png (1254x1254)
Output: public/icons/{icon-512,icon-192,maskable-512,maskable-192,
        apple-touch-icon,favicon}.png
"""
from PIL import Image
import numpy as np

SRC = "/home/z/my-project/upload/file_0000000089e08211849e68584ca3799d.png"
OUT = "/home/z/my-project/public/icons"

src = Image.open(SRC).convert("RGB")
print(f"source: {src.size} {src.mode}")

targets = {
    "icon-512.png": 512,
    "icon-192.png": 192,
    "maskable-512.png": 512,
    "maskable-192.png": 192,
    "apple-touch-icon.png": 180,
    "favicon.png": 48,
}

for name, size in targets.items():
    im = src.resize((size, size), Image.LANCZOS)
    im.save(f"{OUT}/{name}")
    print(f"{name}: {im.size}")

# verify: all outputs identical composition to the source (corners black)
print("\n--- verification ---")
for name in targets:
    a = np.asarray(Image.open(f"{OUT}/{name}").convert("RGB")).astype(np.int16)
    corners = [a[1, 1].mean(), a[1, -2].mean(), a[-2, 1].mean(), a[-2, -2].mean()]
    print(f"{name}: corner-lum={[int(c) for c in corners]}")
