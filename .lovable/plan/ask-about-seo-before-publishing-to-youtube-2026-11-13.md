# Ask about SEO before publishing to YouTube

## What changes
When someone clicks "Publish to YouTube" and the video has no saved SEO description, a small pop-up appears first:

"Do you want to generate SEO description, tags and Title for your video before proceeding?"  [Yes] [No]

- **Yes**: the pop-up closes and the page smoothly scrolls to the "SEO — titles, description & tags" section on the same page (briefly highlighted so it's easy to spot). Nothing is generated or charged automatically; the user uses the existing SEO button there.
- **No**: the normal Publish to YouTube window opens as it does today, with empty fields the user can fill in.
- If an SEO description already exists, no pop-up; publishing opens straight away with the fields filled in.

The button stays greyed out when the video is over the plan's time limit (unchanged).

## Technical details
- `YouTubePublish.tsx`: new optional `onNeedsSeo` prop / `hasSeo` check (based on empty `description` default). Button click shows an AlertDialog when description is empty; Yes calls `onSeoRequested`, No opens the publish dialog.
- `VideoEditor.tsx`: add `id="seo-section"` (ref) to the SEO block around line 1162; pass a handler that calls `scrollIntoView({ behavior: "smooth", block: "start" })` and adds a short ring highlight.
- Uses existing SEO generation only; no new credits or backend changes.
