#!/usr/bin/env python3
"""Generate every PWA icon from the exact user-provided Bonvoy logo.

Rules honoured: the logo itself is the icon — no extra padding, no substitute
artwork. Full-bleed resize only (the artwork already carries its own dark
background, which also makes it safe as a maskable icon).
"""
from PIL import Image

SRC = "/home/z/my-project/upload/images.png"
OUT = "/home/z/my-project/public/icons"

img = Image.open(SRC).convert("RGBA")
print("source:", img.size, img.mode)

# Dominant background colour (sampled from the very corner) — useful sanity print.
w, h = img.size
print("corner pixel:", img.getpixel((2, 2)), img.getpixel((w - 3, h - 3)))

jobs = {
    "icon-512.png": 512,
    "icon-192.png": 192,
    "maskable-512.png": 512,
    "maskable-192.png": 192,
    "apple-touch-icon.png": 180,
    "favicon.png": 48,
}
for name, size in jobs.items():
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(f"{OUT}/{name}", "PNG", optimize=True)
    print("wrote", name, size)
print("done")
