#!/usr/bin/env python3
"""Verify theme colours in browser screenshots by sampling key pixels.

Checks: Account header gradient, badge tile, bottom-nav indicator,
Home greeter bar, Wallet membership card — compared to each theme's
expected colours with a tolerance.
"""
from PIL import Image
import sys, os

def px(im, x, y):
    r, g, b = im.getpixel((x, y))[:3]
    return (r, g, b)

def dist(a, b):
    return max(abs(a[i] - b[i]) for i in range(3))

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def most_colorful(im, box):
    """Return the most saturated pixel in a box (for the nav indicator line)."""
    best, best_score = None, -1
    for y in range(box[1], box[3]):
        for x in range(box[0], box[2]):
            r, g, b = px(im, x, y)
            score = max(r, g, b) - min(r, g, b) + (r + g + b) / 20
            if score > best_score:
                best_score, best = score, (r, g, b)
    return best

def nearest(name, actual):
    """Nearest theme colour to a sampled pixel."""
    best, bd = None, 1e9
    for tname, cols in EXPECTED.items():
        for c in cols:
            d = dist(actual, hex2rgb(c))
            if d < bd:
                bd, best = d, tname
    return best, bd

def hex2rgb_all():
    pass

# Expected core colours per theme (header centre, greeter centre, card centre, indicator)
EXPECTED = {
    "Member":       {"header": "#C05720", "greeter": "#C05720", "card": "#E8793C", "indicator": "#F08A52", "badge": "#8F3D1A"},
    "Silver Elite": {"header": "#6B7190", "greeter": "#71758E", "card": "#71758E", "indicator": "#A3ABCE", "badge": "#3E4356"},
    "Gold Elite":   {"header": "#86663D", "greeter": "#9A7434", "card": "#A9834A", "indicator": "#D2A973", "badge": "#4F3413"},
    "Platinum Elite": {"header": "#55565C", "greeter": "#606166", "card": "#606166", "indicator": "#B5B2AF", "badge": "#2C2D31"},
    "Titanium Elite": {"header": "#7E3247", "greeter": "#8E3D4E", "card": "#6C434D", "indicator": "#E8836B", "badge": "#5C2740"},
    "Ambassador Elite": {"header": "#333236", "greeter": "#3F3E43", "card": "#3F3E43", "indicator": "#A2A1A7", "badge": "#131314"},
}

TOL = 42

def check(account_png, home_png, wallet_png, theme):
    exp = EXPECTED[theme]
    results = []
    im_a = Image.open(account_png).convert("RGB")
    # Account header (y≈30, gradients run 115deg so sample centre + edges)
    header_samples = [px(im_a, 215, 30), px(im_a, 60, 30), px(im_a, 370, 30)]
    ok_h = any(dist(s, hex2rgb(exp["header"])) < TOL for s in header_samples)
    results.append(("Account header", ok_h, [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in header_samples], exp["header"]))
    # Badge tile (rosette tile at ~(48,116))
    badge = px(im_a, 48, 116)
    ok_b = dist(badge, hex2rgb(exp["badge"])) < 50
    results.append(("Badge tile", ok_b, [f"#{badge[0]:02X}{badge[1]:02X}{badge[2]:02X}"], exp["badge"]))
    # Nav indicator — active tab is Account (rightmost fifth)
    ind = most_colorful(im_a, (344, 850, 430, 885))
    ok_i = ind and dist(ind, hex2rgb(exp["indicator"])) < 55
    results.append(("Nav indicator", ok_i, [f"#{ind[0]:02X}{ind[1]:02X}{ind[2]:02X}" if ind else "-"], exp["indicator"]))
    # Home greeter bar
    if home_png and os.path.exists(home_png):
        im_h = Image.open(home_png).convert("RGB")
        greeter_samples = [px(im_h, 100, 327), px(im_h, 215, 327), px(im_h, 330, 327)]
        ok_g = any(dist(s, hex2rgb(exp["greeter"])) < TOL for s in greeter_samples)
        results.append(("Home greeter", ok_g, [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in greeter_samples], exp["greeter"]))
    # Wallet card
    if wallet_png and os.path.exists(wallet_png):
        im_w = Image.open(wallet_png).convert("RGB")
        card_samples = [px(im_w, 215, 200), px(im_w, 100, 240), px(im_w, 320, 270)]
        ok_c = any(dist(s, hex2rgb(exp["card"])) < TOL for s in card_samples)
        results.append(("Wallet card", ok_c, [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in card_samples], exp["card"]))

    all_ok = True
    print(f"\n=== {theme} ===")
    for label, ok, samples, expected in results:
        status = "PASS" if ok else "FAIL"
        if not ok:
            all_ok = False
        print(f"  [{status}] {label:15s} sampled={samples} expected≈{expected}")
    return all_ok

if __name__ == "__main__":
    theme = sys.argv[1]
    account, home, wallet = sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None, sys.argv[4] if len(sys.argv) > 4 else None
    ok = check(account, home, wallet, theme)
    sys.exit(0 if ok else 1)
