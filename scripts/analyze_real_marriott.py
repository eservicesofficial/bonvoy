#!/usr/bin/env python3
"""Compare the REAL Marriott app's status-bar treatment vs our app's.

Analyzes the top 260px of the real Marriott reference screenshots and the two
new Bonvoy (our app) screenshots, plus the seam contrast row-by-row.
"""
from PIL import Image

def top_bands(path, label, x_range=None):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    print(f"\n=== {label} ({w}x{h}) ===")
    x0, x1 = x_range or (0, w)
    for y0 in range(0, 240, 10):
        band = img.crop((x0, y0, x1, min(y0 + 10, h)))
        px = list(band.getdata())
        r = sum(p[0] for p in px) // len(px)
        g = sum(p[1] for p in px) // len(px)
        b = sum(p[2] for p in px) // len(px)
        print(f"  y={y0:3d}  #{r:02x}{g:02x}{b:02x}")
    # Left / centre / right columns to detect horizontal gradient in status area
    print("  -- columns at y=8 (status area top) and y=90 (below bar) --")
    for y in (8, 60, 90, 120):
        row = []
        for frac in (0.03, 0.25, 0.5, 0.75, 0.97):
            p = img.getpixel((int(w * frac), y))
            row.append(f"#{p[0]:02x}{p[1]:02x}{p[2]:02x}")
        print(f"  y={y:3d}: " + "  ".join(row))

top_bands("/home/z/my-project/upload/Screenshot_20261124-052642_Marriott.png", "REAL Marriott #1")
top_bands("/home/z/my-project/upload/Screenshot_20261124-052742_Marriott.png", "REAL Marriott #2")
