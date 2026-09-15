# TTSpot prelaunch website

Static TTSpot website with regional video backgrounds, an animated highway, Google Maps event discovery, and a CarPlay-style music player.

## Local preview

Run `node serve.cjs`, then visit http://127.0.0.1:4173/.

The editable website is in `dist/`; there is no build step.

## Checks

```
node check-events.cjs
node check-music.cjs
node check-performance.cjs
node check-seo.cjs
```

These check interaction logic with mocks. Google Maps authorization, audio autoplay policy, and visual rendering require a browser check.

## Automatic GitHub pushes

This checkout uses `git config core.hooksPath .githooks`. After each commit the hook pushes that branch to `origin`, without force-pushing. Uncommitted file saves are not uploaded. Codex is instructed in `AGENTS.md` to commit and push completed edits.

After cloning onto another machine, run `git config core.hooksPath .githooks` to enable the same behavior. GitHub authentication must be configured on that machine. If a push fails, the local commit remains intact; resolve the reported issue and run `git push`.

## Live website

https://ttspot-prelaunch.kiyoliving.chatgpt.site/

GitHub stores source history. Public website deployment is managed separately through Sites using `.openai/hosting.json`.

## Vercel deployment

Import `CreatiqAI/ttspotwebsite` and use the repository root (`./`) as the Root Directory. The GitHub repository already starts at the local `landing/` directory; do not enter `landing` in Vercel.

`vercel.json` selects the Other framework preset, skips installation/build steps, and serves the committed `dist/` folder. The homepage is `dist/index.html`; the tablet is `dist/carplay.html`. No SPA catch-all rewrite is needed because site sections use URL hashes.

Deploy the latest `main` commit after changing these settings. Existing deployment URLs remain snapshots of their original commits. Add the actual Vercel website domain to the Google Maps browser key's allowed referrers for maps to work on that domain.

The Google Maps key in `dist/google-maps-config.js` is a browser key, visible by design. Restrict it to approved website referrers and Maps JavaScript API in Google Cloud. Signup forms currently run as previews.

## Performance safeguards

SEO setup, OpenSEO reference analysis and free Search Console steps are documented in [SEO-SETUP.md](SEO-SETUP.md).

- Full-resolution `.lossless.webp` assets were verified pixel-identical to their PNG originals. Map pins use 256px thumbnails; opening details loads the full-resolution poster.
- `intro.stream.mp4` uses faststart metadata placement with copied streams, not re-encoding. Its audio/video packet hashes match the original.
- The highway canvas renders a viewport-sized window with overscan at the existing pixel ratio, preserving world-space road/car coordinates. Unchanged scroll frames reuse the drawing.
- Hidden legacy road assets are not fetched. Hero videos pause off-screen or in hidden tabs. Music does not preload before use; the map remains lazily initialized.
- Media responses use a one-day browser cache. Use a new filename when replacing a media asset to avoid stale cached versions. HTML and JavaScript continue to revalidate.
- Mock checks verify logic, not real browser performance. Do not claim measured LCP or frame-rate improvements without browser profiling.
