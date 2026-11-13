import { describe, it, expect } from "vitest";
import { seoFor } from "./seo";
describe("seo", () => {
  it("private pages are noindex", () => {
    for (const p of ["/dashboard", "/admin-kb20", "/billing", "/auth", "/video/abc", "/library", "/nope"]) expect(seoFor(p).index).toBe(false);
  });
  it("public pages are indexed with self canonical", () => {
    expect(seoFor("/pricing")).toMatchObject({ index: true, canonical: "https://vydora.ai/pricing" });
    expect(seoFor("/article-to-video")).toMatchObject({ index: true, canonical: "https://vydora.ai/article-to-video" });
    expect(seoFor("/").canonical).toBe("https://vydora.ai/");
  });
});
