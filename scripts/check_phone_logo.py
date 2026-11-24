#!/usr/bin/env python3
"""
Decisive check: which icon variant is the user's phone actually rendering?
Correlates the splash logo crop from the phone screenshot against
  A) the CURRENT icon-512.png  (direct resize of the upload, sticker/canvas ~0.85)
  B) the OLD v5-era icon       (recomposed sticker pasted at 0.73, sticker/canvas ~0.67)
"""
from PIL import Image, ImageFilter
import numpy as np

SRC = "/home/z/my-project/upload/file_0000000089e08211849e68584ca3799d.png"

# ---- phone screenshot sticker crop ----
shot = np.asarray(Image.open("/home/z/my-project/upload/Screenshot_20261124-045139_Chrome.png").convert("L")).astype(np.float64)
sy0, sy1, sx0, sx1 = 1179, 1431, 418, 661
phone = shot[sy0:sy1, sx0:sx1]
ph, pw = phone.shape

def sticker_bbox(arr_lum, thr_frac=0.12):
    strong = arr_lum > 180
    cc = strong.sum(axis=0)
    cols = np.where(cc >= cc.max() * thr_frac)[0]
    rc = strong.sum(axis=1)
    rows = np.where(rc >= rc.max() * thr_frac)[0]
    return rows[0], rows[-1] + 1, cols[0], cols[-1] + 1

def corr(a, b):
    a = a - a.mean(); b = b - b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-9))

# ---- candidate A: current icon-512 ----
iconA = np.asarray(Image.open("/home/z/my-project/public/icons/icon-512.png").convert("L")).astype(np.float64)
r0, r1, c0, c1 = sticker_bbox(iconA)
candA = Image.fromarray(iconA[r0:r1, c0:c1]).resize((pw, ph), Image.LANCZOS)
candA = np.asarray(candA).astype(np.float64)
print(f"A current icon-512 sticker: {c1-c0}x{r1-r0} of 512 -> sticker/canvas={(c1-c0)/512:.2f}  corr={corr(phone, candA):.4f}")

# ---- candidate B: old v5-era recomposed icon (sticker at 0.73 paste box) ----
src = Image.open(SRC).convert("RGB")
arr = np.asarray(src).astype(np.int16)
lum = arr.mean(axis=2)
strong = lum > 180
col_cnt = strong.sum(axis=0); row_cnt = strong.sum(axis=1)
cols = np.where(col_cnt >= col_cnt.max() * 0.08)[0]
rows = np.where(row_cnt >= row_cnt.max() * 0.08)[0]
x0, x1, y0, y1 = int(cols[0]), int(cols[-1]) + 1, int(rows[0]), int(rows[-1]) + 1
side = int(max(x1 - x0, y1 - y0) * 1.045)
ccx, ccy = (x0 + x1) // 2, (y0 + y1) // 2
half = side // 2
sticker = src.crop((max(0, ccx - half), max(0, ccy - half),
                    min(src.size[0], ccx - half + side), min(src.size[1], ccy - half + side)))
sticker = sticker.resize((side, side), Image.LANCZOS)
sl = np.asarray(sticker.convert("L")).astype(np.int16)
dark = sl < 95
passable = np.zeros_like(dark, dtype=bool)
passable[0, :] = dark[0, :]; passable[-1, :] = dark[-1, :]
passable[:, 0] = dark[:, 0]; passable[:, -1] = dark[:, -1]
while True:
    prev = passable
    grown = passable.copy()
    grown[1:, :] |= passable[:-1, :]; grown[:-1, :] |= passable[1:, :]
    grown[:, 1:] |= passable[:, :-1]; grown[:, :-1] |= passable[:, 1:]
    passable = grown & dark
    if (passable == prev).all():
        break
alpha = Image.fromarray(np.where(passable, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
logo_rgba = sticker.convert("RGBA"); logo_rgba.putalpha(alpha)

canvasB = Image.new("RGB", (512, 512), "#000000")
target = int(round(512 * 0.73))
s = logo_rgba.resize((target, target), Image.LANCZOS)
canvasB.paste(s, ((512 - target) // 2, (512 - target) // 2), s)
iconB = np.asarray(canvasB.convert("L")).astype(np.float64)
r0, r1, c0, c1 = sticker_bbox(iconB)
candB = Image.fromarray(iconB[r0:r1, c0:c1]).resize((pw, ph), Image.LANCZOS)
candB = np.asarray(candB).astype(np.float64)
print(f"B old recomposed 0.73:      {c1-c0}x{r1-r0} of 512 -> sticker/canvas={(c1-c0)/512:.2f}  corr={corr(phone, candB):.4f}")

# ---- candidate C: current icon at RAW upload proportions but as apple/favicon? same as A. skip.
winner = "A (current file - phone cache is FRESH)" if corr(phone, candA) > corr(phone, candB) else "B (OLD icon - phone cache is STALE)"
print(f"\n==> phone screenshot matches: {winner}")
