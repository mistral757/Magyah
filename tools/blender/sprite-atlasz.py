"""🎨 Magyah — a futás-rétegek (arny_NN, id_NN) játékbeli atlasza (Pillow).
  /usr/bin/python3 tools/blender/sprite-atlasz.py MAPPA KIMENET.png [--pixel 40]
Az atlasz két sora, N kocka széltében, egyenként PIXEL×PIXEL:
  0. sor: az árnyalás — a fényesség az R csatornán, az alfa kemény (pixel art);
  1. sor: az azonosító — a kód (mez/csík/nadrág/sportszár/bőr/haj/sötét)
          legközelebbi-szomszéd kicsinyítéssel, hogy a kódok ne keveredjenek.
A játék (sprFutLap) ebből színezi a csíkot a gólszerző mezére."""
import sys, glob, os
from PIL import Image
a = sys.argv[1:]
mappa, ki = a[0], a[1]
P = int(a[a.index("--pixel") + 1]) if "--pixel" in a else 40
arny = [Image.open(p).convert("RGBA") for p in sorted(glob.glob(os.path.join(mappa, "arny_*.png")))]
ids = [Image.open(p).convert("RGBA") for p in sorted(glob.glob(os.path.join(mappa, "id_*.png")))]
assert arny and len(arny) == len(ids), "hiányzó rétegek"
N = len(arny)
lap = Image.new("RGBA", (P * N, P * 2), (0, 0, 0, 0))
for i in range(N):
    s = arny[i].resize((P, P), Image.LANCZOS)
    al = s.split()[3].point(lambda v: 255 if v > 110 else 0)
    L = s.convert("L")
    lap.paste(Image.merge("RGBA", (L, L, L, al)), (i * P, 0))
    d = ids[i].resize((P, P), Image.NEAREST)
    r, g, b, _ = d.split()
    lap.paste(Image.merge("RGBA", (r, g, b, al)), (i * P, P))
lap.save(ki, optimize=True)
print("KESZ", ki, lap.size, os.path.getsize(ki), "bájt")
