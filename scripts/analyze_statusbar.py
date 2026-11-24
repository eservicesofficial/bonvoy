#!/usr/bin/env python3
"""Deep pixel analysis of the two screenshots: status bar strip vs app header area."""
from PIL import Image

for name in ["Screenshot_20261124-061146_Bonvoy.png", "Screenshot_20261124-061110_Bonvoy.png"]:
    img = Image.open(f"/home/z/my-project/upload/{name}").convert("RGB")
    w, h = img.size
    print(f"\n=== {name}  size={w}x{h} ===")
    # Scan vertical strip at x = w//2 and x = 30 (left edge where status bar bg shows)
    # Print average color of each 8px band from y=0 to y=260
    for y0 in range(0, 260, 8):
        band = img.crop((0, y0, w, min(y0 + 8, h)))
        px = list(band.getdata())
        r = sum(p[0] for p in px) // len(px)
        g = sum(p[1] for p in px) // len(px)
        b = sum(p[2] for p in px) // len(px)
        print(f"  y={y0:3d}-{y0+8:3d}  avg=#{r:02x}{g:02x}{b:02x}")

    # Sample specific left-edge pixels (avoid status icons which sit right side)
    print("  -- left-edge column x=12 samples --")
    for y in [5, 20, 35, 50, 65, 75, 85, 100, 130, 160, 200]:
        p = img.getpixel((12, y))
        print(f"  (12,{y:3d}) #{p[0]:02x}{p[1]:02x}{p[2]:02x}")

    # Bottom banner region check (screenshot 1 showed a cut-off banner)
    print("  -- bottom region y from h-350 --")
    for y0 in range(h - 350, h, 25):
        band = img.crop((0, y0, w, min(y0 + 12, h)))
        px = list(band.getdata())
        r = sum(p[0] for p in px) // len(px)
        g = sum(p[1] for p in px) // len(px)
        b = sum(p[2] for p in px) // len(px)
        print(f"  y={y0:4d}  avg=#{r:02x}{g:02x}{b:02x}")
