# Tutee Connect — Study in Germany · v4 (immersive journey)

One continuous story: **Dream → Explore → Choose → Prepare → Fly → Begin**. A thin orange "journey thread" with a
plane travels down the page as you scroll (desktop), and a side rail shows the current stage.

| Stage | Section | What happens |
|---|---|---|
| Dream | Hero | Editorial headline "Your world / starts here." (lines reveal separately) over an interactive dotted globe. Mouse steers the globe and moves the sky, stars, coordinate tags and headline at different depths; flight arcs leave Chennai/Dubai, mostly for Germany. On scroll the globe rises and grows as the copy lifts away. |
| Explore | World map (rebuilt second section) | 14 destination pins. Hover/tap draws a route from Chennai with a plane, the photo opens with a circular reveal from the pin's position, facts animate in. Germany → "Explore Germany", other countries → "Ask about …" (pre-fills the passport form). Mobile: swipeable country chips. |
| Choose | University discovery | Full-screen city photography that wipes in direction of travel, giant outlined university initials, name, city, state, badge, "known for" areas, Germany map pin, index strip, arrows, swipe, keyboard; auto-advances until touched. CTAs: Find your university / Explore courses. |
| Prepare | What we do | The whole section's background becomes the service environment (campus, exam, documents, passport stamps, airport gate, Berlin…), mask-wipe transitions, per-service CTA (Get visa guidance, Find my right course…). |
| Prepare | Costs | Scroll-scaling €0, funding + work, loan partners. CTA: Check my eligibility. |
| Fly | Pathway, stories, expanding image band | Timeline, quotes, image grows to full width. CTAs: Start my journey, Get free consultation. |
| Begin | **Passport** | Closed teal passport with gold-foil seal. Opens on scroll-in (or click / any "#begin" CTA). Left page: holder details (name updates as typed) and destination stamps thudding in. Right page: consultation form → "Get your free consultation". |

Desktop cursor: a small ring that grows with a label ("Fly", "View", "Open") over interactive elements.

## Build
`src/index.tpl.html` → `python3 tools/build.py` → `index.html`. `python3 tools/maps.py` regenerates dotted maps.
`python3 tools/inline.py out.html` → single-file preview. Content arrays (DEST, UNIV, SERVICES, FAQ, STORIES) are in `assets/js/app.js`.

## Notes
- Photos: Unsplash (Unsplash License), loaded from images.unsplash.com. Self-host before launch if preferred.
- "Known for" study areas per university are editorial summaries, not course lists.
- Still to verify: annual Germany figures and testimonials. Form posts to `/api/enquiry` (adds `origin`, and the chosen destination).

## v5 changes (only these two areas — everything else is identical to v4)
1. **Hero** — tighter editorial headline, sub-copy with a gold rule, and a new route-ticket CTA ("MAA ··· DE  Start my journey")
   that fills orange on hover while a dot travels the route. Hover any destination on the globe for a postcard preview
   (photo, name, coordinates); the globe draws a route to it; click to jump to it on the world map. On scroll the globe
   swings to Germany and zooms as the copy lifts away.
2. **Why we do / What we do** — replaced the service tabs with a pinned, scroll-driven journey:
   Dream → Explore → Choose → Prepare → Go global. Scrolling (or clicking a stop) moves a plane along the track,
   wipes in the stage photo, swaps the giant background word, blurred ambient backdrop, the "why" statement,
   the services in that stage and a stage-specific CTA. All 9 original services are kept, grouped by stage.
   Mobile: no pinning — swipeable stage chips and swipe on the content. The free-consultation banner follows the section unchanged.

## v6 — hero globe refinement (hero only)
- Globe moved inside the hero (no right-edge clipping), slightly larger, sized from viewport width *and* height;
  verified at 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440, tablet and mobile.
- 14 destinations are now teardrop pins with a soft glow (pre-rendered sprites). Hover: pin grows, pulse ring,
  other pins dim, globe eases to a stop, tooltip with flag + name + descriptor slides in and follows the pin. Click → world map.
- New renderer `assets/js/globe5.js`: land dots batched into 6 fills/frame, sprites instead of per-frame glow,
  time-based easing, DPR cap 1.75, gentle cursor steer (no added spin). Parallax layers eased in rAF (CSS transitions removed).
- Earth background now served up to the 4256px original at q85 (was capped at 2200px).
- Decorative coordinate tags removed so the pins are the only location markers. Flags load from flagcdn.com (added to CSP).

## v7 — destination cards on the globe (hero only)
Hover a pin (desktop) or tap it (touch) → a mini discovery card: destination photo (unique per country), coordinates,
name, one-line description and "Explore <country> →" (jumps to the world map with that country selected).
Switching pins cross-fades the photo and slides the text; the card follows its pin, stays open while the cursor is on it,
and closes ~0.25 s after leaving pin + card. Placement tries right → left → above → below, keeping clear of the viewport
edges, the navigation bar and the headline/CTA block. Photos are pre-loaded after page load so switching is instant.

## v8 — world map pins (map section only)
14 destination dots → small teardrop pins (gold; orange when selected). Hover/focus: pin scales up with a soft ring,
other pins dim, a country-name label slides in; leaving restores everything. Click/tap still selects the country panel
below. Removed: the large orange "FLY" cursor bubble over pins and the route-line/plane animation. The "MAA · YOU"
origin stays a distinct white ring. Pure CSS hover states — no per-frame JavaScript.

## v9 — University "TUM" signature
- Giant university acronym now uses an SVG morphology outline (clean, even stroke, no overlapping-contour artifacts), sized by letter count so it never clips.
- Desktop hover: smooth left-to-right gold→orange fill, brighter outline and soft glow; reverses on leave. No layout shift (overlay layers only).

## v10 — Germany University Explorer
- New page `universities.html` (data: `assets/js/unis-de.js`, 39 real institutions — 32 public, 7 private state-recognised). Search, type/city/study-area filters, Germany map (generated by `tools/demap.py`), map ↔ detail ↔ list sync, prev/next, `?u=<id>` deep links.
- "Enquire about this university" → `index.html?uni=<name>#begin`; the enquiry passport shows "University of interest" and sends it in the `destination` line.
- Landing slider: name typography no longer clips; badge "Public university"; "Explore all German universities →" links to the current slide's university.
- Rankings intentionally not shown; add verified ones via the `rank` field (source + year).

## v18 — Explorer hero + reliable data loading
- Hero: full-bleed Berlin university scene fading into the teal, slow drift + light sweep (no interaction).
- Root cause of "empty explorer after refresh": the page loaded its dataset by a relative path only; on URLs like `/universities/` (trailing slash) it 404'd and the explorer silently rendered nothing. Fixed by: Netlify redirect `/universities/ → /universities`; a loader that waits for the dataset, falls back to `/assets/js/unis-de.js`, shows "Loading universities…", and an error state with Retry; init runs only once data is present.
- `tools/app.py OUT.html` builds the single preview containing both pages (hash routes `#/` and `#/universities?u=id`); selection is kept in the address so refresh restores it.
