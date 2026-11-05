import { describe, expect, it } from "vitest";
import { LEGAL_DOCS, findLegalDoc } from "./legal";

describe("legal documents", () => {
  it("has a unique slug, title and updated date for every document", () => {
    const slugs = LEGAL_DOCS.map((doc) => doc.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const doc of LEGAL_DOCS) {
      expect(doc.slug).toMatch(/^[a-z-]+$/);
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.updated.length).toBeGreaterThan(0);
      expect(doc.intro.length).toBeGreaterThan(0);
    }
  });

  it("gives every section a unique id and real body text", () => {
    for (const doc of LEGAL_DOCS) {
      const ids = doc.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const section of doc.sections) {
        expect(section.id).toMatch(/^[a-z-]+$/);
        expect(section.heading.length).toBeGreaterThan(0);
        expect(section.body.length).toBeGreaterThan(0);
        for (const paragraph of section.body) expect(paragraph.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("finds a document by slug and returns nothing for unknown slugs", () => {
    expect(findLegalDoc("privacy")?.title).toBe("Privacy Policy");
    expect(findLegalDoc("terms")?.title).toBe("Terms of Service");
    expect(findLegalDoc("cookies")?.title).toBe("Cookie Policy");
    expect(findLegalDoc("refund")?.title).toBe("Refund Policy");
    expect(findLegalDoc("disclaimer")?.title).toBe("Disclaimer");
    expect(findLegalDoc("acceptable-use")?.title).toBe("Acceptable Use Policy");
    expect(findLegalDoc("nonsense")).toBeUndefined();
    expect(findLegalDoc(undefined)).toBeUndefined();
  });
});
