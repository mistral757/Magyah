#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  MAGYAH 30-0 — kód-ellenőrzés
#
#  A játék EGYETLEN index.html, benne egy nagy inline <script> blokkal. Ez a
#  szkript kivágja azt a blokkot egy ideiglenes .js fájlba, és két dolgot néz
#  meg rajta:
#
#    1. SZINTAXIS  (node --check) — elgépelt zárójel, hiányzó vessző. Ezt a
#       böngésző is elkapná, de csak futásidőben, a TELJES játék megállásával.
#
#    2. NEM LÉTEZŐ GLOBÁLIS  (eslint no-undef) — ez a fontosabb. 33 000 sor
#       osztozik EGY globális scope-on: egy elgépelt függvénynév (renderMilestone
#       a renderMilestones helyett) nem hiba fordításkor, csak akkor derül ki,
#       amikor a felhasználó rákattint valamire. Ez az ellenőrzés fordítás-szerű
#       hálót feszít alá.
#
#    3. NYERS JÁTÉKOS- ÉS KLUBNÉV  (tools/nev-audit.js) — jogtisztasági háló.
#       Az adatbázisban a nevek KANONIKUSAK; a felületre viszont csak a
#       megjelenítési rétegen át kerülhetnek (fullName / shortName / teamLabel
#       / clubLabel / leagueLabel). Egy kimaradt burkolás nem hiba a kód
#       szemszögéből — a játék fut, csak épp a valós nevet írja ki.
#
#  Használat:   ./tools/check.sh
#  Kilépési kód 0 = minden rendben.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail
cd "$(dirname "$0")/.."
SRC="index.html"
OUT="$(mktemp -t magyah-XXXXXX.js)"
trap 'rm -f "$OUT"' EXIT

# ─── A BLOKK HATÁRAI: A LEGNAGYOBB <script> … </script> ─────────────────────
# NEM AZ ELSŐ. A 3.9.29 óta a <head>-ben is van egy magában álló <script> —
# a téma-előfestés, harminc sor, hogy frissítéskor ne villanjon sötét. A régi
# `head -1` attól kezdve AZT vágta ki, és a szkript SIKERT jelentett rá:
# harminc sor szintaxisa és nulla ismeretlen globálisa valóban rendben volt,
# csak épp a játék nyolcvanhatezer sorát nem nézte meg senki. Némán, két
# verzión át. (Ugyanez a hiba fordult elő a release.py komment-szűrőjében is.)
# A LEGNAGYOBB blokk a játék — és a méret-korlát ki is mondja, hogy annak kell
# lennie: ha egyszer a nagy blokk elneveződik vagy szétesik, ez a sor megáll,
# nem pedig zöldet jelent.
read -r A B < <(python3 - "$SRC" <<'PY'
import re,sys
s=open(sys.argv[1],encoding="utf-8").read().split("\n")
ny=[i for i,l in enumerate(s) if l=="<script>"]
za=[i for i,l in enumerate(s) if l=="</script>"]
blokkok=[]
for a in ny:
    b=next((x for x in za if x>a),None)
    if b is not None: blokkok.append((a+1,b+1))   # 1-alapú sorszám
if not blokkok: sys.exit("nincs")
a,b=max(blokkok,key=lambda t:t[1]-t[0])
if b-a-1 < 10000: sys.exit("kicsi")
print(a,b)
PY
) || { echo "✗ Nem találom az index.html nagy inline <script> blokkját (vagy gyanúsan kicsi)."; exit 1; }
if [ -z "${A:-}" ] || [ -z "${B:-}" ]; then
  echo "✗ Nem találom az inline <script> blokk határait az index.html-ben."
  exit 1
fi
sed -n "$((A+1)),$((B-1))p" "$SRC" > "$OUT"
LINES=$((B-A-1))
echo "A vizsgált blokk: index.html $((A+1))–$((B-1)). sor ($LINES sor)"

FAIL=0

echo -n "  szintaxis … "
if node --check "$OUT" 2>/tmp/magyah-syntax.err; then
  echo "ok"
else
  echo "HIBA"
  # a node a temp fájl sorszámait írja; azok +A sorral tolódnak az index.html-ben
  sed "s/$(basename "$OUT")/index.html/" /tmp/magyah-syntax.err | head -20
  echo "  (a fenti sorszámokhoz adj hozzá $A-t az index.html-beli helyhez)"
  FAIL=1
fi

echo -n "  nem létező globálisok … "
if ! command -v npx >/dev/null 2>&1; then
  echo "kihagyva (nincs npx)"
else
  cp "$OUT" tools/.lint-target.js
  if npx --no-install eslint --config tools/eslint.config.mjs tools/.lint-target.js >/tmp/magyah-lint.out 2>&1; then
    echo "ok"
  else
    echo "HIBA"
    sed "s|tools/.lint-target.js|index.html (blokk-relatív sorszám, +$A az index.html-ben)|" /tmp/magyah-lint.out | head -40
    FAIL=1
  fi
  rm -f tools/.lint-target.js
fi

echo -n "  nyers játékos- és klubnevek … "
if NEV=$(node tools/nev-audit.js 2>&1); then
  echo "ok"
else
  echo "HIBA"
  echo "$NEV" | tail -n +2
  FAIL=1
fi

# 4. KÉTSZER DEKLARÁLT FÜGGVÉNY (3.9.361) — egy közös globális scope-ban a
#    KÉSŐBBI deklaráció csendben felülírja a korábbit. Így írta felül egy új
#    számformázó (huSzam) a meglévő, raggal író huSzam-ot: a node --check és az
#    eslint is zöldet mondott, a játékban pedig minden szám „1234567-es” lett
#    volna. Hiba, ha ugyanaz a név kétszer áll, és a két törzs ELTÉR (a betűre
#    azonos másolat ártalmatlan).
echo -n "  kétszer deklarált függvény … "
if DUP=$(python3 - "$OUT" <<'PY'
import re,sys
L=open(sys.argv[1],encoding="utf-8").read().split("\n")
rx=re.compile(r"^(?:async )?function ([A-Za-z_$][A-Za-z0-9_$]*)\(")
hol={}
for i,l in enumerate(L):
    m=rx.match(l)
    if m: hol.setdefault(m.group(1),[]).append(i)
def torzs(i):
    out=[L[i]]
    for j in range(i+1,len(L)):
        if L[j][:1] not in (""," ","\t","}",")","]") : break
        out.append(L[j])
    return "\n".join(out).rstrip()
rossz=[]
for n,ii in hol.items():
    if len(ii)>1 and len(set(torzs(i) for i in ii))>1: rossz.append(n+" ("+", ".join(str(i+1) for i in ii)+". blokksor)")
if rossz:
    print("\n".join(rossz)); sys.exit(1)
PY
); then
  echo "ok"
else
  echo "HIBA — eltérő törzzsel kétszer deklarálva:"
  echo "$DUP" | sed 's/^/    /'
  echo "  (a blokksorhoz adj hozzá $A-t az index.html-beli helyhez)"
  FAIL=1
fi

# 5. A VERZIÓSZÁM (1.0.4.8.03) — a szabály: docs/VERZIOZAS.md. Forma:
#    1.0.MAJOR.MINOR.PATCH, a PATCH kétjegyű; a version.json `verzio` mezője
#    ugyanez, a régi `v` mező befagyott (3.9.369 — a régi kliensek frissítési
#    sávjáért, SOHA ne írd át).
echo -n "  verziószám … "
if VER=$(python3 - "." <<'PY'
import re,sys,json,os
root=sys.argv[1]
t=open(os.path.join(root,"index.html"),encoding="utf-8").read()
m=re.search(r'const APP_VERSION="([^"]+)";',t)
v=m.group(1) if m else None
hib=[]
if not v or not re.fullmatch(r"1\.0\.\d+\.\d+\.\d{2}",v): hib.append(f"APP_VERSION formája rossz: {v!r} (1.0.MAJOR.MINOR.PATCH, a PATCH kétjegyű)")
try: J=json.load(open(os.path.join(root,"version.json"),encoding="utf-8"))
except Exception as e: J={};hib.append(f"version.json nem olvasható: {e}")
if J.get("verzio")!=v: hib.append(f"version.json verzio={J.get('verzio')!r} ≠ APP_VERSION={v!r}")
if J.get("v")!="3.9.369": hib.append(f"version.json v={J.get('v')!r} — befagyott mező, 3.9.369-nek kell maradnia")
if hib: print("\n".join(hib)); sys.exit(1)
PY
); then
  echo "ok"
else
  echo "HIBA"
  echo "$VER" | sed 's/^/    /'
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then echo "✓ minden rendben"; else echo "✗ javítandó"; fi
exit $FAIL
