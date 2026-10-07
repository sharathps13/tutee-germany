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
