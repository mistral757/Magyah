#!/usr/bin/env bash
# Az IDÉNY-MÉRLEG két védőhálója. Egyik sem szintaktikai hiba — a check.sh
# mindkettőn átengedné —, viszont mindkettő NÉMÁN hamis mérleget csinál.
#
#  1. KÖNYVELETLEN MOZGÁS. A büdzsé két kapun mozoghat: budgetPay és
#     budgetEarn (a budgetSet a kettőre épül). Aki közvetlenül ír az
#     S.transferBudget-re, annak a pénze eltűnik a mérlegből, és a hiba nem ott
#     jelentkezik, hanem egy „nekem nem stimmel" bejelentésben, kiadásokkal
#     később. A valóban indokolt helyek (a két kapu maga, a null-védelem, a
#     betöltés, a karrieren kívüli nullázás) az INDOKOLT szóval vannak
#     megjelölve a sorban. Új helyet CSAK akkor jelölj meg, ha tényleg nem
#     pénzmozgás; ha az, tedd át a kapura.
#
#  2. ELGÉPELT KATEGÓRIA. A budgetPay(x,"sceout") nem hibázik: az ismeretlen
#     kulcs az „Egyéb" sorba esik, és a felhasználó egy néma, magyarázat
#     nélküli tételt lát. Ezért minden hívási hely kategóriáját összevetjük a
#     LEDGER_CATS katalógussal.
cd "$(dirname "$0")/.." || exit 1
rc=0

bad=$(grep -n 'S\.transferBudget[[:space:]]*[-+]\?=' index.html | grep -v 'INDOKOLT' | grep -v '==')
if [ -n "$bad" ]; then
  echo "✗ könyvelés nélküli büdzsé-írás:"
  echo "$bad"
  echo
  echo "Tedd át budgetPay(összeg,kategória[,név]) / budgetEarn(...) hívásra,"
  echo "vagy — ha tényleg nem pénzmozgás — írd a sor végére, hogy INDOKOLT, és mondd meg, miért."
  rc=1
else
  echo "✓ minden büdzsé-mozgás a könyvelésen megy át"
fi

# A katalógus kulcsai: a LEDGER_CATS blokk `kulcs:{` sorai.
cats=$(sed -n '/^const LEDGER_CATS=/,/^};/p' index.html \
       | grep -o '^ *[a-zA-Z]*:' | tr -d ' :' | sort -u)
# A hívási helyek kategóriái. NEM csak a második argumentum: a híresség-ág egy
# alapértelmezésen át adja át (`cat||"fameAd"`), ezért a hívás utáni szakaszból
# szedjük ki az EGYSZAVAS sztringeket — a játékosnevek (szóközzel) így kimaradnak.
used=$(python3 - <<'PY'
import re
s=open('index.html').read()
out=set()
for m in re.finditer(r'(?:budgetPay|budgetEarn|budgetSet|ledgerNote|famePay)\(', s):
    # csak a HÍVÁS argumentumlistája: a legelső ';' vagy sorvég lezárja
    seg=re.split(r'[;\n]', s[m.end():m.end()+160], 1)[0]
    for lit in re.findall(r'"([A-Za-z]+)"', seg):
        out.add(lit)
print("\n".join(sorted(out)))
PY
)
unknown=""
for c in $used; do
  echo "$cats" | grep -qx "$c" || unknown="$unknown $c"
done
if [ -n "$unknown" ]; then
  echo "✗ ismeretlen kategória a hívási helyeken:$unknown"
  echo "  (ezek némán az „Egyéb\" sorba esnének — vedd fel őket a LEDGER_CATS-be, vagy javítsd az elgépelést)"
  rc=1
else
  echo "✓ minden hívási hely kategóriája szerepel a katalógusban ($(echo "$used" | wc -w) használatban)"
fi

exit $rc
