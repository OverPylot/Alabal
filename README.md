# A grófnő asztalánál

Magyar, mobilbarát, kockadobós D&D-etikettjáték **Helena Valcourt grófnő** vacsoráján, tíz fogással és vegyes nemesi társasággal. A gróf nem szerepel élő vendégként; a levesbe eső monokli az egyik arisztokratáé.

## GitHub Pages

A ZIP-et csomagold ki, és a teljes tartalmát töltsd a repó gyökerébe. Az `assets/` és a `vendor/` mappát is tartsd meg: ezekben vannak a reakcióképek és a helyben futó QR-generátor. Az `index.html` közvetlenül a gyökérbe kerüljön.

A mellékelt `.github/workflows/static.yml` GitHub Actions segítségével publikál. A repóban **Settings → Pages → Source: GitHub Actions**, majd a `main` ágra történő feltöltés indítja a közzétételt. Más alapág esetén a workflow `branches` sorát írd át az ág nevére.

Ha már működik a korábbi statikus workflow, nem kell külön másik workflow-t hozzáadnod. A játék fájljait és az új mappákat frissítsd a meglévő repóban.

[GitHub Pages hivatalos dokumentáció](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Játékmenet

1. Dobj egy d20-szal, és írd be, vagy használd a „Dobok itt” gombot.
2. A dobás az utalást javítja: **1–9** kevés segítség, **10–15** részletesebb, **16–20** pontos leírás.
3. Válassz tétet: **óvatosan** jó válasz +1, rossz 0 pont; **kockáztatva** jó +2, rossz −1 pont.
4. Válassz egy evőeszközt, majd erősítsd meg. A válasz után vicces szöveg és egy társasági reakciókép jelenik meg. Nincs újabb kockadobás.

**Tíz fogás, összesen −10 és +20 pont között. Legalább 6 ponttól Helena láthatóan biztonságban érzi magát veletek: amit rátok bízna, jó kezekben lesz.** Ennél kevesebb pontnál udvarias, de kétkedő „Hát… nem is tudom” befejezés jár.

- **Kimagyarázom!** Egyszer az egész vacsora alatt, a válasz lezárása előtt újradobhatsz jobb utalásért. A jobb dobás marad. Érvénytelen bevitel és a modal bezárása nem használja el.
- **Parasztgyerek-gomb:** megerősítés után neked véget ér a minijáték; ezután mindent kézzel eszel. Az addigi pontok megmaradnak.
- Lesés nincs.

A szabályok viktoriánus hangulatú fantáziát szolgálnak, nem történelmi vizsgát. A Valcourt-házi szokásokat a játék külön kiírja. A rózsás kanál Helena személyes sörbetszokása, nem családnév vagy családi címer.

## Meghívó és QR-kód

A kezdőlapon és a befejezésnél található a **„Meghívó a többieknek · QR-kód”** gomb. Az éles oldalon automatikusan az oldal saját címére készít QR-kódot. A link módosítható, a QR pedig SVG-ként letölthető és nyomtatható. A generálás helyben történik, külső QR-szolgáltatás nélkül.

Helyi előnézetben a játék nem kódolja be automatikusan a localhost-címet, mert az a játékosok telefonján nem működne. Ilyenkor az éles GitHub Pages-linket kell megadni. A QR csak a játék címét tartalmazza, a pontszámot és a mentést nem.

## Technika és mentés

Nincs külön háttérszerver, adatbázis, fiók, API-kulcs vagy futás közbeni fizetős képgenerálás. A négy reakciókép előre elkészült, a repóból töltődik. A képek és a végleges promptok: `assets/KEPEK.md`. A QR-generátor MIT-licencű, licencét a `vendor/` tartalmazza.

Mindenki a saját telefonján játszik. Nincs közös szoba vagy szinkron; a mesélőnek a végső képernyőt kell megmutatni. A böngésző helyben ment, a vacsora a kezdőlapon folytatható. Ez a tízfogásos kiadás külön mentést használ, az ötfogásos régi menetet nem folytatja.

## Ellenőrzés

- Logika: `node tests/check-game.cjs` — húsz ellenőrzés, teljes tízfogásos menet, pontozás, mentés, egyszeri segítség, új befejezések, egybefüggő villák és QR-generálás.
- Opcionális helyi előnézet: `python3 -m http.server 8765`. Ez csak fejlesztéshez kell, a GitHub Pages-en nincs szükség saját szerverre.
