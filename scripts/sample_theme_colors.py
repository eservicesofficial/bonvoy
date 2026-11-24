#!/usr/bin/env python3
"""Sample exact colors from the membership reference screenshots."""
from PIL import Image
import os

FILES = {
    "Member (orange)": "EDIT_20261124_050108.png",
    "Silver Elite": "EDIT_20261124_050142.png",
    "Gold Elite": "EDIT_20261124_050230.png",
    "Platinum Elite": "EDIT_20261124_050245.png",
    "Ambassador Elite": "EDIT_20261124_050259.png",
}

# Sample points (x, y) as fractions of width/height
POINTS = {
    "bg-top-left": (0.03, 0.04),
    "bg-top-right": (0.97, 0.04),
    "bg-mid-left": (0.03, 0.30),
    "bg-mid-right": (0.97, 0.30),
    "card-left": (0.10, 0.60),
    "card-mid": (0.50, 0.60),
    "card-right": (0.88, 0.60),
    "back-btn": (0.12, 0.18),
}

for label, fname in FILES.items():
    path = os.path.join("/home/z/my-project/upload", fname)
    im = Image.open(path).convert("RGB")
    w, h = im.size
    print(f"\n=== {label} ({w}x{h}) ===")
    for plabel, (fx, fy) in POINTS.items():
        x, y = int(w * fx), int(h * fy)
        r, g, b = im.getpixel((x, y))
        print(f"  {plabel:14s} ({x:4d},{y:4d})  #{r:02X}{g:02X}{b:02X}")
