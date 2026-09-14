# TTSpot winding feature journey QA

Source: D:/Downloads/36d6456efe60dc8e79f5eab5cf960abd_1_1789332421_1650.png
Implementation: http://127.0.0.1:4173/#experience
Screenshot evidence: inline browser captures in this task; no filesystem screenshot path returned. Reference and final desktop milestone 05/06 capture were displayed together. Focused captures also cover milestones 03/04, road join, and phone initial/reached states.

Typography: retained Barlow Condensed and Hanken Grotesk, white/red condensed headline, live bilingual text.
Layout: six alternating cards beside the winding road. Longer vertical section intentionally supports progressive discovery rather than the static reference's all-visible composition.
Colors: near-black surfaces, grey outlines, red icons and active markers. Unvisited markers are grey.
Assets: generated raster road with vegetation and transparent sports car; existing Bootstrap feature icons retained.
Copy: six existing features and prelaunch caveat preserved.

Fix history: narrowed mobile intro after it overlapped the road; post-fix screenshot shows clearance. Matched road width and lower highway lane markings. Replaced temporary car drawing with generated sprite.

Verified at approximately 1280x728 desktop and 390x844 phone, with viewport reset afterward. Before stop 01, zero feature cards exposed; at middle, three; after stop 06, six. Reached cards remain available on reverse scrolling. Car follows curves and continues with zero horizontal offset below. No page or card horizontal overflow. Browser console error query returned empty. Reduced-motion path exposes all cards. Local server retained.

Comparison is by corresponding feature regions, not pixel-perfect whole-image scaling, because content is revealed across scrolling states. P3: subtle asphalt texture change at the join; mobile uses narrower cards and a longer route for readable content. No outstanding P0/P1/P2 findings.

final result: passed

## Road accuracy follow-up
- Replaced the approximate bend coordinates with 273 measured centreline samples from winding-road.png; smoothed image noise and interpolated between measured samples.
- Anchored the sprite at its centre before applying tangent rotation. Browser screenshots at bend 02 and bend 06 show the car inside the asphalt edges.
- Replaced the lower CSS road with repeating straight sections of the same winding-road image at matching scale. Boundary screenshot shows continuous asphalt, shoulders and lane lines; previous P3 texture mismatch resolved.
- Centred cards vertically on their markers and placed the moving car near 48% of viewport height after entry. Added responsive route height so the first marker can also reveal near eye level.
- Desktop browser visual verification completed; local server retained.

final result: passed

## Natural aspect-ratio correction
- Source artwork remains at its natural 1:3 ratio (724x2172), rendered at 520x1560 on desktop; viewport height no longer stretches the winding image.
- Added straight entry road space to retain readable reveal positioning. Entry and exit asphalt use the same asset at the same scale.
- Car and milestones now use the image height and entry offset, rather than the total feature-section height. Tangent angles likewise use actual image geometry.
- Desktop screenshots verified car containment at bends 03 and 06 and the lower-road connection. Browser preview reloaded and retained.

final result: passed

## Interactive CarPlay-style map section
- Replaced the split map preview with a central framed interactive dashboard and a generated elevated highway, based on the supplied reference. Left-side headline, category controls, red accents and dark material palette preserved.
- Map, Music and Community tabs implemented. Verified tab selection, checkpoint/vendor category updates, original synthesised demo-loop play/pause, and empty browser error log. Community retains early-access CTA.
- Car follows the elevated artwork through the section and resumes the straight highway below. Corrected individual CSS scaling that displaced the car, then moved the console clear of the road's lower curve.
- Desktop screenshot shows the car inside the right-hand elevated lane and the playable dashboard. Current concept has a framed screen rather than a photographed dashboard/vent assembly; it is explicitly labelled as a concept, not Apple integration.
- Existing earlier mobile QA does not certify this new section; this iteration was browser-tested on desktop.

final result: passed

## Selected CarPlay dashboard prototype — 2026-09-14
Source: C:/Users/Steven/AppData/Local/Temp/codex-clipboard-a40090bd-beb7-4ed2-86b7-49c406b53e80.png (422 x 153; app crop approx 383 x 144).
Implementation: http://127.0.0.1:4173/#live-map; browser screenshot inline in task, 1277 x 728. Dashboard approx 550 x 206, same aspect ratio after scaling. Default dashboard state inspected after returning from each app.
Typography: Arial fallback, proportional UI sizes; same song and artist retained. Layout: left dock, map, right stacked destinations/player match selected composition. Colors: charcoal map, slate widgets and magenta surround. Assets: extracted from supplied reference, with expected softness from the small source image. Content: reference song label retained; playback uses original synthetic demo audio, explicitly labelled in Music screen.
Verified: Home route start/end, Music play/pause, Phone demo call/end, return to Dashboard. Reduced-motion rule present. Parent category buttons now forward to local map screen. No Figma viewer or source toolbar shown.
Console: captured log contained a MutationObserver error without source URL; no MutationObserver exists in served project files. Interaction checks passed; cannot attribute captured error to app.
P3: higher-resolution source artwork would sharpen map and icons. Phone and routes are local simulations, not integrations. Mobile-specific QA not performed.
final result: passed

## Sharp CarPlay assets and continuous highway — 2026-09-15
Replaced screenshot icon crops with Bootstrap vector icons embedded with SVG MIME type. TTSpot supplied 1254px logo replaces Maps icon and low-resolution demo artwork. Generated map-hd.png replaces tiny map screenshot. Icons scale without raster blur; map and logo are high-resolution raster, not claimed native 4K.
Browser verification: desktop 1277x728, dashboard and both road boundaries inspected in task screenshots. Work route start/end verified. Fixed initial SVG MIME loading issue and flex intrinsic sizing regression; recaptured working dashboard. Canvas road tapers to existing 2D road width, blends asphalt at both ends, and shares the same centreline transform with the car. Removed dark background wedges after initial road inspection. Reduced abrupt rewards background boundary with black-to-red fade.
Remaining: mobile-specific and actual 4K display QA not performed. Desktop screenshots show car within roadway at sampled bends; not an exhaustive trajectory test.
final result: passed

## Whole-highway redesign — 2026-09-15
Replaced separate road bitmaps and transition warps with a single canvas road through all lower sections. One sampled centreline controls both the rendered roadway and the car. Constant normal-based road width, continuous shoulder/edge lines and dashed markings. Quintic easing joins the central feature exit to the dashboard bypass and returns to the centre before Rewards. Guardrails and lights give the dashboard chapter depth without changing road texture or width.
Desktop browser screenshots (1277x728, inline task evidence) checked feature-to-dashboard join, lower turn, and dashboard-to-Rewards join. Car visibly centred at all three sampled positions. Initial asphalt sample duplicated lane marks; switched to an unmarked asphalt sample and recaptured. No visible width discontinuity at either section boundary. Remaining P3: subtle texture repetition. Mobile-specific verification not performed.
final result: passed
