import { describe, it, expect } from "vitest";
import { exportDecision, exportCost, effectiveQuality, versionHash, maxExportBytes, MB } from "../../supabase/functions/_shared/exports";
import { CREDIT_COSTS } from "./credits";

const base = { hasCompleted: false, rendering: false, isAdmin: false, balance: 0, cost: 2 };
const video = { caption_style: "typewriter", aspect_ratio: "16:9", music_mood: "calm", logo_path: null };
const scenes = [{ id: "a", position: 0, narration: "Hi", image_path: "u/v/a.png", audio_path: "u/v/a.mp3", clip_path: null }, { id: "b", position: 1, narration: "Bye", image_path: "u/v/b.png", audio_path: null, clip_path: null }];
const opts = { quality: "720p" as const, format: "mp4", watermark: true };

describe("video export rules", () => {
  it("new 720p export is free", () => expect(exportCost("720p")).toBe(0));
  it("new 1080p export is free", () => expect(exportCost("1080p")).toBe(0));
  it("no export price exists in the client credit menu", () => { expect("export720" in CREDIT_COSTS).toBe(false); expect("export1080" in CREDIT_COSTS).toBe(false); });
  it("a 0-credit user can render a first export", () => expect(exportDecision({ hasCompleted: false, rendering: false, isAdmin: false, balance: 0, cost: exportCost("720p") })).toBe("render"));
  it("a second render of the same video is blocked while one runs", () => expect(exportDecision({ hasCompleted: false, rendering: true, isAdmin: false, balance: 0, cost: 0 })).toBe("busy"));
  it("blocks a new export at 0 credits", () => expect(exportDecision(base)).toBe("insufficient"));
  it("blocks a new 1080p export with 4 credits", () => expect(exportDecision({ ...base, balance: 4, cost: 5 })).toBe("insufficient"));
  it("allows a new export with enough credits", () => expect(exportDecision({ ...base, balance: 2 })).toBe("render"));
  it("identical stored export downloads free at 0 credits", () => expect(exportDecision({ ...base, hasCompleted: true })).toBe("download"));
  it("refuses a second concurrent export", () => expect(exportDecision({ ...base, balance: 50, rendering: true })).toBe("busy"));
  it("Free accounts can't export 1080p even if the video asks", () => expect(effectiveQuality("1080p", false)).toBe("720p"));
  it("paid accounts get 1080p", () => expect(effectiveQuality("1080p", true)).toBe("1080p"));
  it("Free files are capped at 300 MB, paid at 2 GB", () => { expect(maxExportBytes(false)).toBe(300 * MB); expect(maxExportBytes(true)).toBe(2048 * MB); });
});

describe("export version hash", () => {
  it("is identical for unchanged projects", async () => expect(await versionHash(video, scenes, null, opts)).toBe(await versionHash({ ...video }, [...scenes].reverse(), null, opts)));
  it("changes when narration changes", async () => expect(await versionHash(video, [{ ...scenes[0], narration: "Hello" }, scenes[1]], null, opts)).not.toBe(await versionHash(video, scenes, null, opts)));
  it("changes when scenes are reordered", async () => expect(await versionHash(video, [{ ...scenes[0], position: 1 }, { ...scenes[1], position: 0 }], null, opts)).not.toBe(await versionHash(video, scenes, null, opts)));
  it("changes when media changes", async () => expect(await versionHash(video, [{ ...scenes[0], image_path: "u/v/new.png" }, scenes[1]], null, opts)).not.toBe(await versionHash(video, scenes, null, opts)));
  it("changes with branding, quality, format and watermark", async () => {
    const h = await versionHash(video, scenes, null, opts);
    expect(await versionHash({ ...video, logo_path: "u/v/logo.png" }, scenes, null, opts)).not.toBe(h);
    expect(await versionHash(video, scenes, { intro: { title: "Hi" } }, opts)).not.toBe(h);
    expect(await versionHash(video, scenes, null, { ...opts, quality: "1080p" })).not.toBe(h);
    expect(await versionHash(video, scenes, null, { ...opts, format: "webm" })).not.toBe(h);
    expect(await versionHash(video, scenes, null, { ...opts, watermark: false })).not.toBe(h);
  });
  it("ignores fields that don't affect the file (title)", async () => expect(await versionHash({ ...video, title: "New" }, scenes, null, opts)).toBe(await versionHash(video, scenes, null, opts)));
});
