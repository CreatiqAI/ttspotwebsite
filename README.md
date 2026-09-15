# TTSpot prelaunch website

Static TTSpot website with regional video backgrounds, an animated highway, Google Maps event discovery, and a CarPlay-style music player.

## Local preview

Run `node serve.cjs`, then visit http://127.0.0.1:4173/.

The editable website is in `dist/`; there is no build step.

## Checks

```
node check-events.cjs
node check-music.cjs
```

These check interaction logic with mocks. Google Maps authorization, audio autoplay policy, and visual rendering require a browser check.

## Automatic GitHub pushes

This checkout uses `git config core.hooksPath .githooks`. After each commit the hook pushes that branch to `origin`, without force-pushing. Uncommitted file saves are not uploaded. Codex is instructed in `AGENTS.md` to commit and push completed edits.

After cloning onto another machine, run `git config core.hooksPath .githooks` to enable the same behavior. GitHub authentication must be configured on that machine. If a push fails, the local commit remains intact; resolve the reported issue and run `git push`.

## Live website

https://ttspot-prelaunch.kiyoliving.chatgpt.site/

GitHub stores source history. Public website deployment is managed separately through Sites using `.openai/hosting.json`.

The Google Maps key in `dist/google-maps-config.js` is a browser key, visible by design. Restrict it to approved website referrers and Maps JavaScript API in Google Cloud. Signup forms currently run as previews.
