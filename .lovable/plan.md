# Separate "Scenes" and "Video length" choices

## What changes for you
- **Scenes menu** shows just the count: "4 scenes", "6 scenes" … "22 scenes". The "~48s" bit goes away.
- **New "Video length" menu** on the New video screen: 30 seconds, 1, 2, 3, 4, 5, 7 and 10 minutes.
- A small line under both menus shows the result, e.g. "4 scenes × about 30s each = 2 min".
- The AI writes each scene's narration long enough to fill that time, so the voiceover — and the finished video — comes out close to the length you picked.
- Your chosen length is saved with the video. On the video page, adding scenes later keeps each new scene about the same length as the others.

## Limits
- Very short scenes (under about 5 seconds) or very long ones (over about 90 seconds) don't read well, so impossible combinations (like 22 scenes in 30 seconds) are greyed out in the length menu.
- Length is approximate: the real time depends on how fast the narrator speaks, usually within 10–15%.
- Longer scenes mean longer voiceovers but still one picture each, so credit cost barely changes with length — it mostly depends on the number of scenes.

## Technical details
- Add `target_seconds integer` column to `videos` (nullable, old videos keep current behaviour).
- New helpers in `src/lib/durations.ts`: `VIDEO_LENGTHS`, `secondsPerScene(total, scenes)`, `wordsForSeconds(s)` (2.6 words/s), `isLengthAllowed(total, scenes)` (5–90s per scene). Tests for each in `durations.test.ts`.
- `Dashboard.tsx`: plain scene labels, new length select, summary line, pass `targetSeconds` to `generateScript`.
- `generate-script`: accept `targetSeconds`, tell the AI the exact words-per-scene target instead of the fixed "2-4 sentences", store `target_seconds`.
- `edit-scenes`: use the saved per-scene length for new scenes; Scenes menu on the video page shows counts only.
- Redeploy both edge functions.
