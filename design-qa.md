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
