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

if [ "$FAIL" -eq 0 ]; then echo "✓ minden rendben"; else echo "✗ javítandó"; fi
exit $FAIL
