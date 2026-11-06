# Background music with optional auto-ducking

## What you'll get
On each video's page, a new **Music** box:
- **Mood** menu: None, Cinematic, Lo-fi, Mystery, Upbeat, Ambient, Epic, Calm piano.
- **Upload your own** button (MP3/WAV) for a track you own or licensed.
- **Music volume** slider (0–100%).
- **Auto-ducking** switch (on by default): when on, music dips quietly whenever the narrator speaks and rises between lines. When off, music stays at a steady volume.
- A small **Listen** button to hear the mood before choosing.

The New video screen also gets a Mood menu so you can choose it up front. Choices are saved with each video and used in both Preview and the downloaded video.

## Where the music comes from
Built-in moods are composed live in the browser (generated chords, pads and beats per mood), so there are no licensing or copyright-strike risks and no extra credits. Uploaded tracks are stored privately with your video files and looped to fit the video length.

## Technical details
- Migration: add to `videos` — `music_mood text default 'none'`, `music_volume int default 30`, `music_ducking boolean default true`, `music_path text null`.
- `src/lib/music.ts`: Web Audio synth per mood (`createMoodSource(ctx, mood)`), plus `duckingGain(ctx, gainNode, speechWindows, base, ducked)` scheduling ramps (fade ~0.25s) around each scene's narration window; skipped when ducking is off.
- `src/lib/music.test.ts`: ducking schedule rules (ducked level during speech, base level between, flat when disabled).
- `exportVideo.ts`: accept music options; mix music into the same `MediaStreamDestination` with a gain node; ducking windows from scene audio durations.
- `VideoEditor.tsx`: Music box UI, upload to `video-assets/<user>/<video>/music-*.ext`, preview playback via a shared AudioContext that follows play/pause/seek.
- `Dashboard.tsx` + `generate-script`: optional mood on creation.
