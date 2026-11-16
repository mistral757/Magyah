"""🎨 Magyah — a Blender-kockák sprite-sheetté fűzése (Pillow).
  /usr/bin/python3 tools/blender/sprite-sheet.py MAPPA KIMENET.png [--pixel 48] [--nagyit 1]
(a rendszer-Python kell: a /usr/local alatti 3.11 nem látja az apt-os Pillow-t)
--pixel N: a kockákat N×N-re kicsinyíti (pixelesít), majd --nagyit-szorosan,
  legközelebbi-szomszéd módon nagyítja — a játék retro stílusához."""
import sys, glob, os
from PIL import Image
args = sys.argv[1:]
mappa, ki = args[0], args[1]
pix = int(args[args.index("--pixel") + 1]) if "--pixel" in args else None
nagy = int(args[args.index("--nagyit") + 1]) if "--nagyit" in args else 1
kockak = [Image.open(p).convert("RGBA") for p in sorted(glob.glob(os.path.join(mappa, "futas_*.png")))]
if pix:
    kockak = [k.resize((pix, pix), Image.LANCZOS) for k in kockak]
    # az alfa kemény élt kap (pixel art)
    kockak = [Image.merge("RGBA", (*k.split()[:3], k.split()[3].point(lambda a: 255 if a > 110 else 0))) for k in kockak]
w, h = kockak[0].size
lap = Image.new("RGBA", (w * len(kockak), h), (0, 0, 0, 0))
for i, k in enumerate(kockak): lap.paste(k, (i * w, 0))
if nagy > 1: lap = lap.resize((lap.width * nagy, lap.height * nagy), Image.NEAREST)
lap.save(ki); print("KESZ", ki, lap.size)
