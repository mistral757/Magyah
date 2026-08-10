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
#  Használat:   ./tools/check.sh
#  Kilépési kód 0 = minden rendben.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail
cd "$(dirname "$0")/.."
SRC="index.html"
OUT="$(mktemp -t magyah-XXXXXX.js)"
trap 'rm -f "$OUT"' EXIT

# A blokk határai: az első magában álló <script> és </script> sor.
A=$(grep -n '^<script>$'  "$SRC" | head -1 | cut -d: -f1)
B=$(grep -n '^</script>$' "$SRC" | head -1 | cut -d: -f1)
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

if [ "$FAIL" -eq 0 ]; then echo "✓ minden rendben"; else echo "✗ javítandó"; fi
exit $FAIL
