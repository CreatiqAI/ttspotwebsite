# Local shops and partner carousel — 2026-09-16

Source visual: C:/Users/Steven/AppData/Local/Temp/codex-clipboard-b6f80e03-b6ed-4eb4-8585-13ac6896b9b2.png

Source: supplied desktop composition, 1510 × 1042 pixels. Implementation screenshot, viewport and density normalization: unavailable. Browser tool fails on initialization with `failed to write kernel assets: The system cannot find the path specified. (os error 3)`.

States requiring visual review: vendor section on desktop/mobile; first partner slide; second partner slide; signup dialog.

Implemented: existing centre road preserved; large italic black/red community heading, three community pillars, vendor invitation on the left, two-page partner experience on the right. Existing first-page business-offer content retained. Partner page uses the supplied Soundstream asset and an invitation for another brand. No unconfirmed partnership claim is made.

Fidelity surfaces awaiting browser evidence:
- Typography: inherited site racing display type, stronger headline hierarchy; wrapping unverified.
- Layout: centre-road clearance, mobile stacking and carousel proportions unverified.
- Colors: existing black/red palette retained; rendered contrast unverified.
- Images: existing full-quality brand assets reused. Reference car photography and TypeOne logo are not added; separate supplied assets are unavailable.
- Copy: vendor invitation and partner preview labels implemented; no new live signup claims.

Checks: map, music, highway/performance and SEO checks passed. Carousel mock checks cover initial page, buttons, keys, swipe selection, resizing and reduced motion. These are not visual or browser interaction checks.

Full-view comparison: blocked. Focused comparison: blocked. Console: unavailable. No screenshot comparison iterations completed.

Implementation checklist: capture desktop/mobile and both carousel pages when browser tooling is restored; compare against source; verify signup and touch/keyboard behavior visually.

final result: blocked

# Mobile reference enhancement — 2026-09-28

Scope: existing mobile website only (max-width 760px); hero and desktop are explicitly excluded. The supplied nine-panel board is a visual direction, not authorization to add its fictional partner/event data or replace the working product with a new app.

Reference: C:/Users/Steven/AppData/Local/Temp/codex-clipboard-43c642ea-2a48-46c8-941f-a0954e20e38f.png. Board panels have different content lengths; comparison uses corresponding content regions, not fabricated pixel-perfect whole-screen alignment.
Preview: http://127.0.0.1:4173/. Browser CSS viewports: 390x844 and 320x740 mobile; 1440x900 desktop. Screenshot export uses browser rendering; no density-equality claim against the reference board.
Evidence: ../mobile-about-v2.png, ../mobile-features-v2.png, ../mobile-map-v2.png, ../mobile-events-v2.png, ../desktop-preserved-v2.png. Reference and implementation screenshots were opened together for visual comparison.

Iteration 1 findings and fixes:
- P2: about section retained an extra desktop headline; hide it only within the mobile media query.
- P2: map teaser label wrapped into disconnected inline boxes; fixed flex specificity on the hidden mobile element.
- P2: map section headline followed body copy; reordered phone layout only.
- P2: old reward child backgrounds remained bright red; changed phone child backgrounds to transparent on a dark ground.
- P3: collapsed feature cards lacked reference-style descriptions; added concise supporting lines while preserving full copy in keyboard-operable details.

Post-fix comparison: condensed italic headings, red icons, rounded dark compact cards, photographic chapter break, map category row, business benefit cards, partner grid, event cards and closing image are coherent with the reference. Readable at 390px and no horizontal page overflow at 320px. Existing side road is deliberately retained; so are the actual CarPlay map/music and six existing features. Event dates are labeled past; unconfirmed partnerships remain disclosed.

Desktop regression: widths, heights, fonts, padding, background colors and display values for hero, hero headline, experience, discovery, vendors, FAQ, final invite and footer match the captured baseline exactly. All mobile-only elements computed display:none at 1440px. No existing hero rules or markup changed.

Browser interactions: feature details expand, FAQ expands, map category selection updates aria-pressed, event-card link selects the autoshow category, vendor CTA opens the correct registration form, scroll reaches finish and shows the finish invitation. Local preview does not serve the Vercel signup API; no live data-submission claim from that preview.
Checks: check-performance.cjs, check-events.cjs, check-music.cjs and check-seo.cjs passed. Music's existing inline-source comparison now normalizes Windows line endings like the highway check.
No unresolved P0/P1/P2 visual findings. P3: photography is an editorial generated scene rather than the exact reference photographs; existing brand assets and actual listings are used.

final result: passed

## 2026-09-28 — Mobile closing chapter reference correction
- Replaced the squeezed final CTA with a mobile-only garage photograph, two-line heading, full-width early-access CTA, three icon links and centered community tagline.
- Rebuilt mobile footer as vertical navigation and two stacked CTAs. Reset inherited absolute navigation positioning; desktop mobile-only navigation is explicitly hidden.
- Visual QA: 390x844 and 320x844, no horizontal overflow. Early-access button opens the existing form. Finish prompt still triggers above the footer.
- Desktop 1440x900: hero, experience, discovery, vendors, FAQ, final CTA and footer geometry matches the pre-change baseline (footer 345.59375px).
- Reference comparison: automotive photo-led CTA and vertical footer hierarchy matched; existing legal links retained, no invented social destinations. Full-resolution generated garage photo stored as optimized WebP.
- Checks: check-performance.cjs, check-seo.cjs, git diff --check passed.
- Result: passed.

## 2026-09-28 — Mobile ending highway clearance
- Reserved a 52px left lane outside the closing section so its photo and opaque content never cover the road or animated car. Adjusted mobile heading scale to retain usable content width.
- Browser verified at 390px: uninterrupted road beside photo, heading and CTA. At 320px: photo starts at x=52, content width 221px, no horizontal overflow. All changes remain within max-width:760px.
- check-performance.cjs and git diff --check passed. Screenshot: ../mobile-road-clear.png. Result: passed.

## 2026-10-05 — Mobile landing page redesign (branch mobile-redesign)
Scope: phones only (max-width:760px). `mobile-v2.css` (media-scoped) and `mobile-v2.js` replace `mobile.css`, `mobile-editorial.css` and `mobile-editorial.js`. Desktop and tablet markup changes are `hidden` phone-only elements, plus one inline `span#title-region` inside the h1.
- Hero: h1 reads "Join meets. Earn rewards." on phones (region name in its own span, hidden there). Region arrows replaced by a KL/Selangor · Johor · Penang chip row that drives the existing backgrounds, copy and cloud transition. Waitlist + "Become a partner" buttons, compact pause/play icon next to the menu, dark scrim.
- New "How it works" step cards (scroll-snap) reuse the TTPoints/QR check-in/rewards copy and keep the planned/at-launch/partner wording; the TTPoints chapter is hidden on phones.
- Features: 2×2 tap-to-expand cards (QR Check-In and TTPoints copy live in the steps). Duplicate "Same passion. More places." blocks hidden.
- Map: static preview card; `carplay.html?view=map` opens in a full-screen sheet only after a tap (no dock, dashboard or music). The dashboard iframe uses `data-src` and loads only above 760px.
- Side road, car, music checkpoint, round progress button and finish pop-up removed on phones; a slim top progress road reuses the car sprite. `continuous-highway.js` (and its inline copy) skips drawing and the asphalt fetch while the road is hidden.
- Partners logo grid first, then the partner pitch card; event swipe cards keep past-event labels; FAQ; TiTi closing call to action; sticky waitlist bar (hidden over the hero, the closing section, the footer and dialogs; safe-area padding).
- Browser evidence (headless Chrome via CDP): 390x844, 360x780, 430x932, 375x667, 1.2x text and reduced motion. No horizontal overflow; tap targets at least 44px. Before tapping, phones fetch no carplay.html, Google Maps, asphalt texture or racing artwork.
- Desktop/tablet regression at 1440, 1024, 768 and 761 wide: geometry and computed styles of every rendered element match the main baseline apart from the new inline h1 span. Reduced-motion pixel diffs are zero except live Google Maps tiles inside the CarPlay iframe.
- check-music.cjs failed on main: it reads the last plain `<script>`, which had become the invite-link snippet. That snippet is now tagged `data-role="invite-link"`.
- Checks: check-seo, check-events, check-music, check-performance, tests/signup.test.cjs, git diff --check passed.

## 2026-10-05 — Mobile redesign round 2 (owner feedback)
- Light-ink transparent TT logo on phones (header, partner card, footer, map sheet) via `<picture class="m-pic">` (display:contents; sources hidden) so desktop keeps its existing files and layout.
- How it works is a pinned section (position:sticky, ~3 viewport heights): native scroll position picks step 1, 2 or 3 (cross-fade), with three tappable progress segments and a drifting winding-road backdrop. No scroll hijacking; reduced motion and no-JS show the three steps stacked.
- More brand life: TiTi poses per section, a fanned stack of the seven TiTi cards ("At launch"), darkened photo backdrops, glass cards, 300 ms fade/slide reveals (off for reduced motion). 28 new phone-only WebPs in `dist/mobile-assets/` (480 KB, lazy below the fold).
- Far fewer words: one headline + at most one line per block, kickers hidden, one honesty footnote in the closing section, "At launch" tags on rewards.
- Partners: reversed transparent logos on identical tiles; no location lines; linked cards (12V website, Typeone directions) are whole-card links with a corner arrow; "Your brand here" has a real "Partner with us" button; one short listing note for Soundstream.
- Back to top: round button inside the sticky bar, plus a floating one when the bar is away (never over a button or link, hidden when the footer's own link is visible).
- Forms: `form-chips.js` builds tappable chips from each select's own options (region, role, business category); the hidden select still holds and submits the value. New test in tests/signup.test.cjs.
- Evidence: 390/360/430/375 widths, 1.2x text, reduced motion; no horizontal overflow, no tap target under 44 px. Phone image weight vs live main: 4.6 MB to 1.5 MB on load, 5.1 MB to 1.9 MB after a full scroll. Desktop/tablet (1440, 1024, 768, 761) geometry identical except the inline h1 span; pixel differences only in live map tiles and hero video frames.
- Checks: check-seo, check-events, check-music, check-performance, tests/signup.test.cjs (5/5), git diff --check passed.

## 2026-10-05 — Round 3a: TiTi card viewer
- Fan cards are buttons. Tapping one expands it (FLIP, ~360 ms) into `card-viewer.js`/`card-viewer.css`: swipe or arrows/keys through the 7, tap or "Flip card" to see the back, close with X, backdrop, swipe down or Esc; focus returns to the fan card. Card names, rarity, lines and colours follow the app's card_types data. Full-size WebPs in `dist/titi-cards/` (663 KB) load only when the viewer opens. The fan deals out of a stack once on scroll-in; reduced motion fades instead of flipping.
- Phones vs 475f5ad (390x844): reduced motion, only the "Tap a card" hint text differs; with motion, only the dealing/floating fan and the hero video. The hint sits before the fan in the DOM so it doesn't force later content into compositor layers.

## 2026-10-05 — Round 3b: desktop shows the phone content
- 761px and wider: `desktop-v3.css` (media-scoped) + `desktop-v3.js`. Every new section uses content | road lane | content so the centre road and car stay clear: pinned How it works (native scroll picks the step; TiTi left, text right, the car drives between), TiTi cards (text left, fan right, same viewer), the six winding-road features with TiTi poses and one line each, map/CarPlay unchanged apart from fewer words, partner grid with reversed logos + "Your brand here" card, events, glass FAQ with TiTi, closing call to action with TiTi and the single footnote.
- Hero headline is "Join meets. Earn rewards."; region chips and status support it; "Join the waitlist" + "Partner with us". Light transparent TT logo everywhere (the 294 KB tile logo is no longer loaded). Red TTPoints chapter, duplicate kickers and the end-of-page pop-up removed. Desktop back-to-top ring now glows.
- Road geometry: the features section's offsetTop is added in `updateRoad` and in `continuous-highway.js` (kept in sync with its inline copy), so the winding road, milestones, bridge and music checkpoint stay aligned with sections above them.
- Evidence: 1440x900, 1280x800, 1024x768, 820x1180 with no horizontal overflow; reduced motion stacks the steps; keyboard Tab order covers nav, chips, CTAs, step segments, fan cards, map options, partner links, events and FAQ with visible focus; the viewer works with ←/→, Esc and focus return. Phones vs 475f5ad are unchanged apart from the 3a hint (phone `sizes` are half each file's width so the 2x image keeps its exact aspect ratio).

## 2026-10-05 — Round 4 (owner feedback on round 3)
- 4.1 Desktop road: `centre()` returns the centre lane from the hero entry to the bridge (no S-curves, no milestones through How it works, the cards or the features). The bridge sweep runs through the open space beside the CarPlay dashboard; checkpoint and finish unchanged; inline copy in sync.
- 4.2 TiTi cards: `cards-sequence.js` pins the stage (desktop 560vh, phone 400vh) and maps native scroll progress to deck -> spread -> 01-07 focus -> settle. Transforms/opacity only; per-card colour glows; gold shine for 07; 01-07 jump buttons; details beside (desktop), below (tablet), name + rarity only (phone). The viewer opens from the card's live pose. Reduced motion: static fan + compact list.
- 4.3 Features: "Inside the app" (Live map, TT now, Clubs & chats, Your garage, Posts & moments, TiTi your pit crew). Desktop/tablet tiles carry a two-line description and bullets; phones show title + one line.
- 4.4 Desktop/tablet-only detail: check-in rules (rotating QR, 300 m), planned TTPoints examples with a "may change" note, voucher redemption by QR, partner voucher flow, blind-box note. Phones render none of it.
- Evidence: 1440/1280/1024/820 and 360/390/430, reduced motion and 1.2x text: no horizontal overflow, no tap target under 44 px outside the footer, keyboard order covers step segments, cards and 01-07 buttons with visible focus. All repo checks pass.
