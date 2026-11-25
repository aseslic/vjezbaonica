# Kako dodati gradivo

Sve lekcije i zadaci nalaze se u JSON datotekama u folderu `src/content/`.
Za dodavanje gradiva ne treba programirati, dovoljno je urediti ili dodati datoteku.

```
src/content/
├── 1-razred/
│   ├── matematika.json
│   ├── bhs-jezik.json
│   └── moja-okolina.json
├── 2-razred/
│   ├── matematika.json
│   ├── bhs-jezik.json
│   └── moja-okolina.json
├── 3-razred/
│   ├── matematika.json
│   ├── bhs-jezik.json
│   └── moja-okolina.json
└── 4-razred/
    ├── matematika.json
    ├── bhs-jezik.json
    └── moja-okolina.json
```

Jedna datoteka sadrži **jedan predmet za jedan razred**. Nova datoteka se sama pojavi u aplikaciji.
Naziv foldera služi samo za preglednost. Razred se uzima iz polja `"grade"` u datoteci.

> **Savjet:** poslije svake izmjene pokreni `npm run provjeri`. Provjera javlja tačno gdje je greška,
> npr. *„2-razred/matematika.json › tema "dijeljenje" › zadatak 3: tačan odgovor "8" nije među ponuđenim odgovorima.”*
> Ista provjera se automatski pokreće na GitHubu pri svakoj promjeni.

---

## Predmet

```json
{
  "grade": 2,
  "id": "moja-okolina",
  "name": "Moja okolina",
  "shortName": "Okolina",
  "order": 3,
  "icon": "🌳",
  "color": "#2E9E5B",
  "paper": "lines",
  "topics": []
}
```

| Polje       | Značenje                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- |
| `grade`     | Razred, od 1 do 9.                                                                        |
| `id`        | Oznaka u adresi: mala slova bez kvačica, brojevi i crtice (`moja-okolina`).               |
| `name`      | Puni naziv predmeta.                                                                      |
| `shortName` | *(neobavezno)* Kraći naziv za korice sveske, ako je puni predug.                          |
| `order`     | *(neobavezno)* Redoslijed na početnoj stranici (manji broj ide prije).                    |
| `icon`      | Emoji na koricama, npr. `"🔢"`, `"📖"`, `"🌳"`, `"🎨"`, `"🎵"`.                            |
| `color`     | Boja korica u obliku `"#RRGGBB"`.                                                         |
| `paper`     | Papir: `"grid"` (kockice, kao sveska za matematiku) ili `"lines"` (linije).               |
| `topics`    | Lista tema (vidi dalje).                                                                  |

## Tema

```json
{
  "id": "dani-u-sedmici",
  "title": "Dani u sedmici",
  "description": "Radni dani i vikend",
  "lesson": [],
  "exercises": [],
  "generators": []
}
```

Teme se prikazuju redom kojim su napisane, pa ih piši redoslijedom kojim se uče u školi.
Tema mora imati barem jedan zadatak (`exercises`) ili generator (`generators`). Za dobru vježbu treba barem 5 zadataka.

## Lekcija (`lesson`)

Lekcija je lista dijelova. Svaki dio ima `type`:

```json
"lesson": [
  { "type": "text", "text": "Sedmica ima **7 dana**." },
  { "type": "example", "title": "Dani u sedmici", "text": "ponedjeljak, utorak, srijeda" },
  { "type": "remember", "text": "Subota i nedjelja su vikend." },
  { "type": "list", "items": ["prva stavka", "druga stavka"] },
  { "type": "calculation", "title": "Pismeno sabiranje", "rows": ["347", "285"], "operator": "+", "result": "632" }
]
```

| `type`     | Izgled                                                        |
| ---------- | ------------------------------------------------------------- |
| `text`     | Običan pasus.                                                 |
| `example`  | Okvir na kockicama s naslovom „Primjer” (ili svojim `title`). |
| `remember` | Istaknut okvir „Zapamti!”.                                    |
| `list`     | Lista s tačkama.                                              |
| `calculation` | Pismeno računanje: brojevi jedan ispod drugog, crta i rezultat. `operator` je `+`, `−`, `·` ili `:`. |

U svakom tekstu:

- `**riječ**` se ističe žutim signirom,
- `\n` prelazi u novi red (korisno za račune u primjeru).

## Zadaci (`exercises`)

Postoje četiri vrste zadataka. Sve vrste mogu imati i ova neobavezna polja:

| Polje         | Značenje                                                                                |
| ------------- | --------------------------------------------------------------------------------------- |
| `instruction` | Kratka uputa iznad pitanja, npr. `"Tekstualni zadatak"` ili `"Napiši brojem"`.          |
| `picture`     | Velika sličica iznad pitanja (emoji), npr. `"🍎🍎🍎"`.                                   |
| `explanation` | Objašnjenje koje dijete vidi nakon odgovora. Preporučeno!                                |
| `speak`       | Tekst za čitanje naglas, ako treba da se razlikuje od pitanja.                          |

### 1. Izbor između ponuđenih odgovora (`choice`)

```json
{
  "type": "choice",
  "question": "Koji dan dolazi poslije utorka?",
  "options": ["ponedjeljak", "srijeda", "četvrtak"],
  "answer": "srijeda",
  "explanation": "ponedjeljak, utorak, srijeda…"
}
```

- `answer` mora biti napisan **potpuno isto** kao jedan od ponuđenih odgovora.
- Odgovori se miješaju. Ako redoslijed treba ostati isti (npr. `<`, `=`, `>`), dodaj `"shuffle": false`.

### 2. Upis odgovora (`input`)

```json
{
  "type": "input",
  "question": "Kako se zove mladunče psa?",
  "answer": ["štene", "kuče"]
}
```

- `answer` može biti jedan tekst ili lista svih prihvatljivih odgovora.
- Veliko i malo slovo se ne razlikuju, osim ako dodaš `"caseSensitive": true` (npr. za vježbe velikog slova).
- Ako su svi odgovori brojevi, dijete dobija tastaturu s brojevima.
- Ako dijete napiše riječ bez kvačica (`kuca` umjesto `kuća`), odgovor nije tačan, ali dobija savjet da pazi na č, ć, dž, đ, š, ž.
  Ispod polja za upis su dugmad sa slovima s kvačicama.

### 3. Tačno ili netačno (`truefalse`)

```json
{
  "type": "truefalse",
  "statement": "Medvjed je domaća životinja.",
  "answer": false,
  "explanation": "Medvjed je divlja životinja."
}
```

`answer` je `true` (tačno) ili `false` (netačno), bez navodnika.

### 4. Poredaj (`order`)

```json
{
  "type": "order",
  "question": "Poredaj radne dane redom.",
  "items": ["ponedjeljak", "utorak", "srijeda", "četvrtak", "petak"]
}
```

`items` se piše **tačnim redoslijedom**. Aplikacija ih sama izmiješa. Stavke se ne smiju ponavljati.
Kod slaganja rečenice od riječi pazi da je samo jedan redoslijed tačan (prva riječ velikim slovom, tačka uz zadnju riječ).

## Generatori matematičkih zadataka (`generators`)

Generator svaki put napravi nove zadatke, pa dijete može vježbati unedogled.

```json
"generators": [
  { "type": "addition", "max": 100, "count": 15 },
  { "type": "multiplication", "tables": [2, 3, 4, 5, 10] }
]
```

| `type`           | Primjer zadatka                         | Parametri                    |
| ---------------- | --------------------------------------- | ---------------------------- |
| `addition`       | 34 + 25 = ?                             | `max`: najveći zbir          |
| `subtraction`    | 68 − 23 = ?                             | `max`: najveći umanjenik     |
| `missing-addend` | 23 + ? = 40                             | `max`: najveći zbir          |
| `multiplication` | 3 · 7 = ?                               | `tables`: brojevi od 1 do 10 |
| `division`       | 42 : 6 = ?                              | `tables`: djelioci od 1 do 10 |
| `compare`        | 47 ? 52 (odaberi <, = ili >)            | `max`: najveći broj          |
| `neighbors`      | Koji broj je prethodnik broja 40?       | `max`: najveći broj          |
| `place-value`    | Koliko desetica ima broj 47? (za `max` od 100 do 9999: Koja cifra je na mjestu stotica u broju 4357?) | `max`: najveći broj |
| `rounding`       | Zaokruži na desetice: 347               | `to`: 10, 100 ili 1000; `max`: najveći broj |
| `long-multiplication` | 324 · 3 = ?                        | `max`: najveći proizvod; `digits` (neobavezno): jednocifreni činioci |
| `long-division`  | 856 : 4 = ?                             | `max`: najveći djeljenik; `digits` (neobavezno): djelioci od 2 do 9 |
| `division-remainder` | 17 : 5 = ? (odaberi „3, ostatak 2“) | `max`: najveći djeljenik; `digits` (neobavezno) |
| `unit-conversion` | 3 m = ? cm, 4000 g = ? kg              | `units`: lista od `"length"` (dužina), `"mass"` (masa), `"volume"` (zapremina tečnosti) |
| `roman`          | XIV = ? i 14 = ? (rimskim ciframa)      | `max`: najveći broj (do 3999) |
| `equation`       | x + 25 = 60, 7 · x = 42, x : 6 = 45     | `max`: najveći broj; `ops`: lista znakova od `"+"`, `"−"`, `"·"`, `":"` |

Za `addition` i `subtraction` dodaj `"carry": false` kad zadaci trebaju biti **bez prelaza** preko desetice
(npr. 34 + 25, a ne 38 + 25).

`count` je broj zadataka koje generator ubaci u temu (zadano: 20). Iz svih zadataka teme
aplikacija nasumično bira onoliko koliko je podešeno u postavkama (5, 10 ili 15).

Generatori sami pišu i objašnjenje, npr. *„Saberi desetice pa jedinice: 30 + 20 = 50, 4 + 5 = 9, pa je 50 + 9 = 59.”*

## Pravopis i jezik

- Tekstovi su na ijekavici, latinicom: *lijep, rijeka, vježba, sedmica, tačno, saobraćaj, trotoar*.
- Navodnici: „ovako“.
- Oznake računskih radnji kao u našim udžbenicima: `+`, `−` (znak minus), `·` (množenje), `:` (dijeljenje).
- Množenje: 3 · 4 = 4 + 4 + 4 (tri puta po četiri).
