# Agent rules

- AI calls live in edge functions (`generate-script` for scripts, `scene-asset` for per-scene image/voiceover); the browser never holds the AI key. Why: keeps credentials server-side.
- Scenes are rows in `video_scenes` (not JSON on `videos`) so per-scene assets can be generated in parallel without overwrite races.
- Generated media is stored in the private `video-assets` bucket under `<user_id>/<video_id>/` and shown via signed URLs. Why: users only see their own files.
- Video export runs in the browser (canvas + MediaRecorder → WebM). Why: no server-side renderer is available.
- "Use real facts" scripts search the web via the Firecrawl connector inside `generate-script` and store cited URLs in `videos.sources`. Why: grounds real-event scripts in sources users can check.
- Background music is composed in the browser (Web Audio) per mood, with uploads stored in `video-assets`; ducking is a per-video toggle. Why: no licensing risk and no AI credits.
- Per-scene "Animate scene" uses image-to-video via the `animate-scene` edge function (start job, client polls status, MP4 saved to `video-assets`, path in `video_scenes.clip_path`). Why: video jobs take minutes and gateway URLs expire.
- Until payments are connected, top-up controls on Billing are explicitly inactive and auto top-up preferences are device-local, user-scoped drafts only; never treat these drafts as billing authorization. Why: prevents implying charges or credit delivery without payment infrastructure.
- Billing history must use real user-owned payment records and provider-issued invoices once connected; before then show an empty state and inactive invoice actions, never fabricated purchases. Why: billing records must accurately reflect money collected.
- Current billing and rolling 30-day usage must come from the app's per-user credit ledger, not workspace Lovable credits or video estimates; show unavailable values until tracking exists. Why: estimated generation costs are not actual balance or recorded deductions.
- "Article to video" (`/from-url`) reuses the Dashboard form; `generate-script` scrapes the link via Firecrawl and stores it in `videos.source_url`/`sources`. Why: one script pipeline for ideas and links.
- Stock B-roll comes from Pixabay (search results cached 15 min to respect rate limits) via the `stock-broll` edge function, saved as the scene's `clip_path` with `clip_credit` set; credit estimates count only clips without `clip_credit` as AI animations. Why: stock footage is free, AI animation is not.
- Narration speed is applied at playback (preview + export, pitch preserved); accent is a TTS instruction in `scene-asset`. Why: speed changes need no re-recording.
- "Remix for Shorts" copies a video and its scene rows into a new 9:16 video that reuses the same media paths (no regeneration). Why: original stays intact and remixing costs no credits; never delete shared media when a video row is deleted.
- My Library (/library) stores user files privately in video-assets under <user_id>/library/, listed via storage (no table). Why: reuses owner-scoped storage policies.
