# Emily’s Parisian room — continuation notes

## User intent

Keep the existing cream, dusty rose, sage and brass palette and the immersive 3D room. Implement the agreed visitor-experience review: smaller navigation, better activity cameras, working gramophone, drinks and fireworks, destination postcards, richer lighting/materials, and a welcoming arrival. The user explicitly requested GitHub pushes and this continuation document. Do not create another Codex task unless asked.

## Existing project

- Workspace: `C:\Users\elo\Desktop\Personal`
- Preview: `http://localhost:3000/`
- GitHub: `https://github.com/yenxuan1381/elo-parisian-study`, branch `main`.
- Stack: React, Three.js, vinext/Vite, Base UI dialogs. Use `npm.cmd` on Windows.
- Sites project metadata exists in `.openai/hosting.json`. Read the Sites building/hosting skills when applying them. Existing-site editing alone does not authorize a production deployment under the Sites connector instructions. GitHub pushes are authorized.
- No AGENTS.md was found earlier. Check for new local instructions before continuing.

## Completed before this checkpoint

Commit `f134693` fixes the continuous typewriter paper, removes its occluding blank overlay, preserves text beyond the old fixed page limit, fits the carriage to the viewport, adds the exact heading “Write anything and send to Emily”, and adds a mobile/long-letter editor. Five numerical/geometry regression tests are in `tests/typewriter.test.mjs`.

## Important content constraints

- Actual owner email is already configured in `app/room-settings.ts`; preserve it.
- Payment URLs remain empty at the user’s request. Never simulate successful payment or point them at another creator’s account.
- Musical preferences: keshi, elijah woods, HYBS “Ride”, ZUHAIR/Josiah Saav “Nothing to You”, SUMI/DJ YEN “time will tell”, keshi “magnolia”, Austin Mahone “All I Ever Need”. Use verified provider IDs and embeds, not downloaded copyrighted audio or guessed IDs.
- No personal travel photographs or autobiographical stories have been supplied. Use clearly illustrative destination postcards and neutral descriptions; do not invent Emily’s travel history. Destinations: London, Malaysia, Norway, Greece, Spain, Italy.
- Existing assets: room-reference.png, paris-watercolor.png, paris-night.png, world-land.json. Earlier image generation exhausted available credits; do not repeatedly retry it.

## Current implementation checkpoint

Work is in progress; the next update to this document will record final completed changes, validation, and remaining work. Newly added `room-content.ts` contains verified Spotify selections. `music-player.tsx` provides an opt-in Spotify iframe controller with playback events for the gramophone. These must be integrated into the room before the checkpoint is described as working.

## Validation / environment notes

- `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `node tests/typewriter.test.mjs` (direct execution avoids sandbox child-process EPERM from `node --test`).
- `npm.cmd run build` needs elevated subprocess access in this Windows sandbox. Do not reinstall dependencies for misleading Vite errors caused by `spawn EPERM`.
- Broad lint has pre-existing warnings/errors in the old room code and UI library. Fix newly introduced issues, avoid unrelated rewrites.
- `tsconfig.tsbuildinfo` is tracked; avoid incidental changes by disabling incremental compilation.
- Git metadata mutations/push may require sandbox escalation. Stage explicit relevant paths; never force-push.
- User requested a visual/interaction review in this thread. Reuse the current browser tab for requested QA. CUA is available; do not launch a separate automation browser. The tab was 1 in browser 1, provider ID `42df3647-1594-4d82-844f-4cea7affb734`; verify inventory if stale.

## Design priorities from the review

1. Keep the room visible with a compact dock and an expandable Explore menu; fit activity views independently.
2. Expose explicit, accessible actions for drinks, music, travel, candles, the pet bowl, and fireworks.
3. Synchronize the gramophone animation with actual playback. Maintain playback while exploring and provide an obvious stop control. Embed failures must leave a working external listening link.
4. Use six distinct destination illustrations instead of repeated maps on the polaroids; show a readable postcard when selected.
5. Improve contact shadows, fabric/wood detail, plant silhouettes and movement without changing the palette.
6. Add a brief optional entrance moment and a smooth evening transition. Respect reduced motion. Avoid mandatory intros, excessive animation or surprise audio.

## Communication

Be candid about incomplete items, placeholders, provider playback limitations and what was actually checked. Do not claim personal photos, payments, live email delivery or full device testing when these have not happened. Update this document before the final push.
