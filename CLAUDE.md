# Vježbaonica: upute za AI asistente

Web aplikacija (PWA) za vježbanje gradiva u osnovnoj školi u Bosni i Hercegovini.
React 19, TypeScript, Vite 8, Vitest. Nema servera: hash routing i localStorage.

## Naredbe

```bash
npm run dev          # razvoj
npm test             # svi testovi (Vitest + happy-dom)
npm run provjeri     # samo provjera sadržaja (src/content/content.test.ts)
npm run lint         # oxlint
npm run build        # tsc -b && vite build → dist/
npm run build:demo   # jedna HTML datoteka → dist-demo/index.html
```

Prije svakog commita: `npm run lint && npm test && npm run build`.

## Arhitektura

- `src/content/<razred>-razred/<predmet>.json`: sadržaj. `src/content/index.ts` učitava sve preko
  `import.meta.glob` i provjerava ga funkcijom `validateSubject` (`src/lib/validate.ts`).
  Neispravne datoteke se preskaču, a greške se ispisuju u konzoli i ruše test `content.test.ts`.
- `src/lib/types.ts`: oblik sadržaja (`Subject`, `Topic`, `LessonBlock`, `Exercise`, `Generator`).
- `src/lib/session.ts`: sastavljanje vježbe (`buildSession`), ocjenjivanje (`evaluate`), zvjezdice i natpis na pečatu.
- `src/lib/generators.ts`: generatori matematičkih zadataka (deterministički uz `createRng(seed)`).
- `src/lib/answers.ts`: provjera upisanih odgovora (brojevi, veliko slovo, savjet za kvačice).
- `src/lib/store.ts`, `settings.ts`, `progress.ts`: stanje u localStorage (ključevi `vjezbaonica:*:v1`),
  React hookovi preko `useSyncExternalStore`.
- `src/lib/router.ts`: mali hash ruter. Sve adrese su u objektu `routes`, a prepoznaju se u `src/App.tsx`.
- `src/pages/`: ekrani. `PracticePage.tsx` sadrži tok vježbe: netačna pitanja se ponavljaju na kraju
  (označena s `retry`), a rezultat se računa samo iz prvih odgovora.
- `src/components/`: korice sveske, zadaci (`Exercises.tsx`), pečat (`Stamp.tsx`), zvjezdice, lekcija.
- `src/styles/global.css`: svi stilovi. Boje, slova i razmaci su CSS varijable na vrhu datoteke.

## Pravila

- **Jezik:** sav tekst za korisnika (aplikacija i sadržaj) piše se na bosanskom jeziku, ijekavicom i latinicom:
  tačno, sedmica, saobraćaj, trotoar, hljeb, historija, lijep, vježba. Navodnici „ovako“.
  Poruke djetetu treba pisati rodno neutralno (npr. „Nastavi s vježbanjem“, a ne „gdje si stao“).
- **Matematika:** znakovi `+`, `−` (U+2212), `·` za množenje, `:` za dijeljenje.
  Konvencija množenja: 3 · 4 = 4 + 4 + 4. Termini: sabirak, zbir, umanjenik, razlika, činilac, proizvod,
  djeljenik, djelilac, količnik, prethodnik, sljedbenik.
- **Kod:** identifikatori na engleskom, a komentari i tekst za korisnika na bosanskom.
- **Novi tip zadatka:** `types.ts` → `validate.ts` → `session.ts` (`evaluate`, `correctText`, `isAnswerReady`,
  `DEFAULT_INSTRUCTIONS`) → `components/Exercises.tsx` → `docs/SADRZAJ.md` → testovi.
- **Novi generator:** `generators.ts` → `validate.ts` (`GENERATOR_MIN_MAX` ili `TABLE_GENERATORS`) →
  `generators.test.ts` (provjera tačnosti odgovora) → `docs/SADRZAJ.md`.
- **localStorage:** ako se mijenja oblik spremljenih podataka, dodaj migraciju u `sanitize*` ili povećaj verziju ključa.
- **Dizajn:** đačka sveska, sa kockicama (`paper: "grid"`) ili linijama (`"lines"`) i crvenom marginom.
  Svaka boja ima značenje: plava tinta je tekst, crvena olovka greška, zelena tačno, žuti signir
  odabrano/istaknuto, a ljubičasti pečat rezultat. Font je Andika. Dugmad su velika (najmanje 48 px)
  zbog djece. Pokret ima samo pečat na kraju vježbe i povratna informacija nakon provjere,
  uz poštovanje `prefers-reduced-motion`.
- **Pristupačnost:** prava dugmad i linkovi, `aria-label` na bosanskom i vidljiv fokus.
- **Putanje:** `base: './'` u `vite.config.ts`. Aplikacija radi na GitHub Pages pod bilo kojim imenom repozitorija.
- **Sadržaj:** nikad ne koristiti zaštićene likove ni brendove (crtani filmovi, igrice) u tekstovima i slikama.
