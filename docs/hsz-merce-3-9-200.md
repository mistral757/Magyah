# 3.9.200 — ⚖ A HSZ fordulószáma és a mezőny tényleges számai

> „Hiper szuper kupa csoportköre 8 meccses. Legyen 7/8 egy ilyen állásnál a
> meccsek száma. Másrészt a mezőny ereje legyen a tényleges számokkal kiírva.
> A számítás is a tényleges számítás legyen és a csapaterő is. Mert a 184 az
> nem igaz, mert azon van még egy kiegyenlítő extra meccserő az én
> meccserőmhöz igazítva. Ezt jelezze a game!"

## 1. A forduló

**A hiba:** a kupaképernyő fejléce a BL hatfordulós csoportkörének hosszával
osztott, ezért a HSZ hetedik fordulója „Csoportkör · 7/6. forduló” lett.

| hol | eddig | most |
|---|---|---|
| a kupaképernyő fejléce | Csoportkör · 7/6. forduló | **Ligaszakasz · 7/8. forduló** |
| a meccs címe | Ligaszakasz · 7. forduló | Ligaszakasz · **7/8.** forduló |
| a meccsnapló fejléce | LIGASZAKASZ · 7. FORDULÓ | LIGASZAKASZ · **7/8.** FORDULÓ |
| a meccs utáni összegző | „A csoportban … Még N forduló a csoportkörből. Az első két helyezett jut tovább.” | „A ligaszakaszban … Még N forduló a ligaszakaszból. 1–8. egyenesen a nyolcaddöntőbe · 9–24. rájátszás · 25–32. kiesik.” |
| a tabella | „Csoport” címke, az első két hely kiemelve, „Az első két helyezett jut tovább.” | „Ligaszakasz” címke, az 1–24. hely kiemelve, szaggatott vonal a 8. és a 24. hely után, a valódi továbbjutási szabály |

**A BL** és a többi csoportkörös sorozat változatlan (pl. „Csoportkör · 1/6.
forduló”, „Az első két helyezett jut tovább.”).

## 2. A mezőny ereje: a tényleges számítás

**Eddig:** a HSZ fejléce a BL képletét mondta: „a bajnoki szinted és a
csapaterőd közül a magasabbhoz igazítva”. Ez a HSZ-re nem igaz. Arról, hogy a
motor minden CPU-ellenfélre ráad egy kiegyenlítést, egy szó sem esett.

**A valódi számítás**, ugyanazokból a függvényekből, amikből a motor számol:

1. **A mezőny** = a nevezéskori meccs-erőd + az osztály-eltolás (D0-n −1,
   osztályonként +1), kerekítve. Ez a kiírt szám, pl. 184.
2. **⚖ A nehézségi kiegyenlítés** = a rejtett meccs-bónuszod fele (morál,
   taktika, aura, kapitány, edző), az idény elején rögzítve
   (`matchHiddenOppBuff`). A motor ezt **minden** ellenfél meccs-erejére
   rárakja.
3. **A mezőny tényleges meccs-ereje** = mezőny + ⚖.

**A fejléc most így szól** (példaszámokkal):

> A sorozat mezőnye: **184** — a nevezéskori meccs-erőd (⚡185,3) −1
> osztály-eltolással (D0-n −1, osztályonként +1), kerekítve.
> ⚖ **Nehézségi kiegyenlítés: +5,0** — a motor ezt MINDEN ellenfél
> meccs-erejére rárakja: a te rejtett meccs-bónuszod (morál, taktika, aura,
> kapitány, edző) fele, az idény elején rögzítve. A mezőny **tényleges**
> meccs-ereje tehát **⚡189,0**, nem 184.
> A ti csapaterőtök: **172,4** · meccs-erőtök most: **⚡186,0** · különbség
> a mezőnyhöz: **−3,0**

* **A ⚖ sor elmarad**, ha nincs kiegyenlítés.
* **A többi sorozat** (BL, OJK, KONF, Magor Kupája, Nyári Kupa) a saját
  képletét tartja meg, de a ⚖ sor és a csapaterő–meccs-erő sor ott is
  megjelenik, mert a kiegyenlítés ott is fut.
* **Közös kupában** a mezőny a szoba közös középértéke. Ott a fejléc nem ír
  ki egyéni képletet, csak azt, hogy közös mezőnyről van szó.

## 3. A következő mérkőzés

Eddig: „Ellenfél ereje: 183,0 · a ti csapaterőtök: 172,4”. Ez két
csapaterő volt, nem az a két szám, amivel a motor számol.

Most:

> Ellenfél: csapaterő 183,0 · **⚡188,0** (saját 183,0 ⚖+5,0)
> Ti: csapaterő 172,4 · **⚡186,0** — a motor a két ⚡-val számol

**A te ⚡-od** ugyanaz a szám, mint az eredményjelzőn: a meccs-erő a 📈 tartós
formával együtt. **Párharcban** a társ saját meccs-ereje áll ott, kiegyenlítés
nélkül.

## Ami nem változott

**A motor:** a mezőny képlete és a kiegyenlítés ugyanaz, ez a verzió csak
őszintén kiírja őket.

## Próba

```bash
node tools/hsz-merce-3-9-200-proba.js
```

A próba **21 állítást** ellenőriz, valódi karrier-állással és a valódi
`startEuroCampaign` → `renderEuroScreen` úton.
