# Agent rules

- AI calls live in edge functions (`generate-script` for scripts, `scene-asset` for per-scene image/voiceover); the browser never holds the AI key. Why: keeps credentials server-side.
- Scenes are rows in `video_scenes` (not JSON on `videos`) so per-scene assets can be generated in parallel without overwrite races.
- Generated media is stored in the private `video-assets` bucket under `<user_id>/<video_id>/` and shown via signed URLs. Why: users only see their own files.
- Video export runs in the browser (canvas + MediaRecorder → WebM). Why: no server-side renderer is available.
- "Use real facts" scripts search the web via the Firecrawl connector inside `generate-script` and store cited URLs in `videos.sources`. Why: grounds real-event scripts in sources users can check.
