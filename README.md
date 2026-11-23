# A gróf asztalánál

Magyar nyelvű, mobilbarát, kockadobós evőeszköz-minijáték egy D&D-banketthez. Öt fogás, néhány szokatlan családi szokás, és egy vállalhatatlanul kényelmes kijárat az etikettből.

## Indítás

Nyisd meg az `index.html` fájlt egy modern böngészőben, vagy töltsd fel a fájlokat GitHub Pages-re. Nincs csomagtelepítés, fordítás, API-kulcs, adatbázis vagy saját háttérszerver. A képek SVG-ként a kódban vannak; külső betűtípus és külső szolgáltatás sincs.

## GitHub Pages, új repóval

1. Hozz létre egy új GitHub-repót, például `grofi-vacsora` néven. Ingyenes GitHub-fióknál válassz nyilvános repót a Pages használatához.
2. Töltsd fel ennek a mappának a **tartalmát** a repó gyökerébe. Az `index.html` közvetlenül a gyökérbe kerüljön. A `tests/` mappa és ez az útmutató opcionális a futtatáshoz.
3. A repóban: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4. Válaszd ki a `main` ágat és a `/(root)` mappát, majd **Save**.
5. A közzététel után a Pages beállításai között megjelenő linket küldd el a játékosoknak.

A helyes publikálási beállítások hivatalos leírása: [GitHub Pages dokumentáció](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

A hivatkozások relatívak, ezért a játék felhasználói és projektoldalként, illetve repón belüli almappából is működik. A `.nojekyll` fájl a közvetlen statikus kiszolgáláshoz tartozik.

## Játékmenet

1. A játékos fizikailag dob egy d20-szal, és beírja az eredményt. A „Dobok itt” lehetőség beépített dobást ad.
2. Az eredmény az utalás részletességét határozza meg: **1–9** kevés segítség; **10–15** részletesebb segítség; **16–20** pontos leírás. A dobás önmagában nem ér pontot.
3. Tétet választ: **óvatosan** helyes megoldásért +1 pont, hibáért 0; **kockáztatva** helyes megoldásért +2, hibáért −1 pont.
4. Kiválasztja az egyik evőeszközt, majd megerősíti. Az eszközök sorrendje új játékonként változik, de folytatáskor megmarad.
5. A játék elmondja a helyes választ és jóváírja a pontot. Nincs második dobás a válasz után.

**Öt fogásból legalább 3 összpont** jelenti a sikeres vacsorapróbát. Az elérhető tartomány −5 és 10 pont között van.

- **Kimagyarázom!** Egyszer használható az egész vacsora alatt, a választás lezárása előtt. Új dobást ad a segítséghez. Az eredeti és az új dobás közül a jobb marad meg; érvénytelen bevitel vagy a felugró ablak bezárása nem használja el. Ez nem egy elrontott válasz utólagos javítása.
- **„Lássák csak, milyen parasztgyerek vagyok!”** Megerősítés után azonnal lezárja az adott játékos minijátékát. A már megszerzett pontjai megmaradnak; a befejezés szerint innentől mindent kézzel eszik.
- **Nincs lesés.** A végleges szabályoknak megfelelően ezt a segítséget nem tartalmazza a játék.

## A mesélőnek

A játék viktoriánus hangulatú fantázia, nem történelmi etikettvizsga. Az első három fogás az evőeszközök felismerésére épül; az utolsó kettő a Feketerózsa család kitalált szokásait követi. Ezeket a játék külön jelzi.

Minden játékos a saját telefonján játszik. Nincs közös szoba, hálózati szinkron vagy mesélői adminfelület. A végén a játékos megmutatja a pontszámát a mesélőnek. Szükség esetén a mesélő szóban jelzi, mikor léphetnek tovább a következő fogásra.

A haladás `localStorage`-ban marad meg. A kezdőlapon a „Folytatom a vacsorát” gombbal folytatható. Böngészőadat-törlés vagy másik készülék esetén a mentés nem költözik át. Ha a böngésző letiltja a helyi tárolást, az adott megnyitás alatt továbbra is végigjátszható a játék.

## Szerkesztés és ellenőrzés

- `index.html`: az oldal váza.
- `style.css`: reszponzív megjelenés; külső betűtípus nélkül.
- `game.js`: fogások, szövegek, utalások, rajzok, szabályok és helyi mentés.
- `favicon.svg`: az oldal ikonja.
- `tests/check-game.cjs`: függőség nélküli logikai és mentési ellenőrzések.

Fejlesztői előnézethez opcionálisan: `python3 -m http.server 8765`. Ez csak helyi ellenőrzés; a kész játék működéséhez nem kell saját szerver.

Logikai ellenőrzés Node.js-szel: `node tests/check-game.cjs`.
