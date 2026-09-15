# Photo credits

All four photographs are German and sourced from Wikimedia Commons, and **all
four are CC-BY, so attribution is mandatory** — the footer credit line cannot be
emptied. (The original Humboldt hero was CC0; the Cologne cathedral that replaced
it is not, so this obligation is stricter than it first was.) It is rendered in
the footer of both pages,
in the elements marked `data-photo-credit`. If you swap any photo, update this
file **and** `PHOTO_CREDIT` in `_tooling/localise_de.py`, then re-run
`localise_de.py`, `assemble.py germany` and `build_unipage.py germany`.

CC-BY-SA, NC and ND images were deliberately avoided, as on the UK, Canada and
Ireland pages, to keep the licensing obligations to a single visible credit line.

Each file was cropped and resized from the Commons original with `sips`. The
output dimensions match the Irish and Canadian files, which in turn match the
slots, so the layout cannot shift.

---

## students-campus.jpg — hero (`#home`), 1200×1143

> **The filename does not describe the subject**, and it is kept because
> `students-campus.jpg` is a literal key in the compiled stylesheet — the class
> `bg-[url('/assets/img/photos/students-campus.jpg')]` plus the matching escaped
> selector and `url()` in `assets/css/main.css`, and the `<link rel="preload">`
> in the page shell. Renaming the file means editing all of those together;
> `verify_site.py` fails on a mismatch, the browser fails silently.

- **Depicts:** Cologne Cathedral (Kölner Dom) seen across the Rhine, with the
  green steelwork of the Hohenzollern railway bridge at the right edge.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:K%C3%B6lner_Dom_2013-08-04-005.JPG
- **Author / photographer:** Rolf Heinrich, Köln
- **Licence:** CC BY 3.0 — https://creativecommons.org/licenses/by/3.0
- **Attribution required:** yes —
  `Cologne Cathedral — photo by Rolf Heinrich, CC BY 3.0`
- **Crop:** original 3843×5896 (portrait) → `sips -c 3660 3843 --cropOffset 300 0`
  (1.0499:1, anchored high) → resized to 1200×1143, quality 82.
  **The offset is load-bearing:** a centred crop clips the tips off both spires,
  which is the one thing this photograph is for. Anchoring at y=300 keeps them
  with a little sky above. The trade is the excursion boat on the river, which
  falls outside any 1.05:1 window that also holds the spires — the two are 4,605px
  apart in a 3,660px crop, so you cannot have both.
- **Why this and not a university building:** the UK page uses the Radcliffe
  Camera and Ireland the Campanile, both university buildings, and the first
  attempt here followed that pattern with Humboldt's main building on Unter den
  Linden. It was rejected on sight: the forecourt book stalls and contractors'
  crates made a cluttered foreground and the sky was flat grey. This is chosen as
  the better photograph rather than the better-matching subject.
- **Why 1.05:1 and not a landscape file:** the hero panel measures about
  **596×584 CSS px on desktop (1.02:1) and 319×292 on mobile (1.09:1)** —
  essentially square at every breakpoint. The div is `bg-cover bg-center`, so a
  1.8:1 file would have roughly 43% of its width thrown away.
- **Safe to reshape:** referenced only as a CSS `background-image` and a
  `<link rel="preload">` — there is no `<img>` tag for it on either page, so its
  ratio has no effect on layout.

## team-working.jpg — `#relocate` ("The Pathway to Settlement"), 1400×933

- **Depicts:** The main reading room of the Universitätsbibliothek Stuttgart
  (Stadtmitte), looking down over the stacks and study desks.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Lesesaal_Universit%C3%A4tsibliothek_Stuttgart_Stadtmitte.jpg
- **Author / photographer:** Stefan Drößler
- **Licence:** CC BY 4.0 — https://creativecommons.org/licenses/by/4.0
- **Attribution required:** yes —
  `University Library Stuttgart — photo by Stefan Drößler, CC BY 4.0`
- **Shot:** 9 February 2023.
- **Crop:** original 6048×4024 → `sips -c 4024 6036 --cropOffset 0 6` (exact 3:2)
  → resized to 1400×933, quality 82.
- **Note:** this image is rendered with `w-full h-auto object-cover`, so **its
  aspect ratio drives the layout**. Any replacement must also be 3:2.

## family.jpg — `#relocate` ("Relocating with Your Family?"), 1400×1050

- **Depicts:** A large half-timbered (Fachwerk) house on a cobbled corner in
  Quedlinburg, Saxony-Anhalt — a UNESCO World Heritage old town.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Quedlinburg_(9107124578).jpg
- **Author / photographer:** David Short
- **Licence:** CC BY 2.0 — https://creativecommons.org/licenses/by/2.0
- **Attribution required:** yes —
  `half-timbered house, Quedlinburg — photo by David Short, CC BY 2.0`
- **Shot:** 16 June 2013.
- **Crop:** original 3648×2432 → `sips -c 2175 2900 --cropOffset 100 0` (4:3,
  anchored top-left) → resized to 1400×1050, quality 78.
  **The offset is load-bearing:** the camera burned a `16.06.2013 07:31`
  timestamp into the bottom-right corner. The crop excludes the right 20% and the
  bottom 6.5% specifically to remove it. Check any recrop for the stamp before
  shipping.
- **Why this subject:** homes rather than people, the same trade the UK page
  makes with Notting Hill, Canada with Cabbagetown and Ireland with the Georgian
  doors. See the note on photographs of people below.

## germany-city.jpg — `#universities` panel background, 1400×933

- **Depicts:** Munich seen from the tower of Alter Peter, with the twin domes of
  the Frauenkirche and the spire of the Neues Rathaus over the old-town rooftops.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Munich_-_View_from_Alter_Peter.jpg
- **Author / photographer:** Andrew Parlette
- **Licence:** CC BY 2.0 — https://creativecommons.org/licenses/by/2.0
- **Attribution required:** yes —
  `Munich from Alter Peter — photo by Andrew Parlette, CC BY 2.0`
- **Crop:** original 11811×4777 (a 2.47:1 panorama) → `sips -c 4777 7166
  --cropOffset 0 4300` (3:2, anchored right) → resized to 1400×933, quality 82.
  Anchoring right was needed: the panorama's left half is undifferentiated
  rooftops, and both landmarks sit in the right third.
- **Note:** this file is referenced by a Tailwind arbitrary-value class,
  `bg-[url('/assets/img/photos/germany-city.jpg')]`, which is a literal key into
  the compiled stylesheet. Renaming the file means editing **both** the class in
  the HTML and the escaped selector plus `url()` in `assets/css/main.css`.
  `verify_site.py` fails on a mismatch; the browser fails silently. That rule was
  renamed from `ireland-city.jpg` when this page was scaffolded from the Irish
  assets.

---

## Combined credit line (as rendered in the footer)

> Photography: Cologne Cathedral © Rolf Heinrich (CC BY 3.0); University Library
> Stuttgart © Stefan Drößler (CC BY 4.0); half-timbered house, Quedlinburg ©
> David Short (CC BY 2.0); Munich from Alter Peter © Andrew Parlette (CC BY 2.0).
> Via Wikimedia Commons.

Generated from `PHOTO_CREDIT` in `_tooling/localise_de.py` — change it there and
rebuild, never in the built HTML.

## On photographs of people

As on the UK, Canadian and Irish pages, none of the four photos has an
identifiable person as its subject. The students at the Stuttgart desks are small,
incidental and not identifiable, and the cathedral frame has no one in it. Two
otherwise good LMU Munich candidates were rejected for exactly this reason — both
had identifiable people as the subject.
Appropriately licensed photos of people are scarce on Commons — nearly all are
CC-BY-SA — so recognisable German places were the better trade. If you want
students in the hero, buy a stock licence and drop in a file at roughly 1.05:1.
