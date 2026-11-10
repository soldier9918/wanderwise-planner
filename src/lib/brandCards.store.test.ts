import { describe, it, expect, beforeEach, vi } from "vitest";
import { DEFAULT_CARDS, storeCard, type BrandCard, type BrandCards } from "./brandCards";

const { rows, supabaseMock } = vi.hoisted(() => {
  const rows: Record<string, BrandCards> = {};
  return {
    rows,
    supabaseMock: {
      from: () => ({
        select: () => {
          let uid = "";
          return {
            eq: (_col: string, val: string) => {
              uid = val;
              return {
                maybeSingle: async () => ({
                  data: rows[uid] ? { cards: rows[uid] } : null,
                  error: null,
                }),
              };
            },
          };
        },
        upsert: async (payload: { user_id: string; cards: BrandCards }) => {
          rows[payload.user_id] = payload.cards;
          return { error: null };
        },
      }),
    },
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const USER = "11111111-1111-4111-8111-111111111111";
const outro: BrandCard = { ...DEFAULT_CARDS.outro, title: "Stored outro", subtitle: "Stored CTA", seconds: 6 };

describe("saving one card leaves the other alone", () => {
  beforeEach(() => {
    delete rows[USER];
    localStorage.clear();
    rows[USER] = { intro: { ...DEFAULT_CARDS.intro, title: "Stored intro" }, outro };
  });

  it("saving the intro keeps the stored outro untouched", async () => {
    await storeCard(USER, "intro", { ...DEFAULT_CARDS.intro, title: "New intro", subtitle: "New CTA", seconds: 3 });
    expect(rows[USER].intro.title).toBe("New intro");
    expect(rows[USER].intro.subtitle).toBe("New CTA");
    expect(rows[USER].outro).toEqual(outro);
  });

  it("saving the outro keeps the stored intro untouched", async () => {
    await storeCard(USER, "outro", { ...DEFAULT_CARDS.outro, title: "New outro", seconds: 5 });
    expect(rows[USER].outro.title).toBe("New outro");
    expect(rows[USER].outro.seconds).toBe(5);
    expect(rows[USER].intro.title).toBe("Stored intro");
  });

  it("clamps the saved card's length to the 2–8 second range", async () => {
    await storeCard(USER, "intro", { ...DEFAULT_CARDS.intro, seconds: 99 });
    expect(rows[USER].intro.seconds).toBe(8);
  });
});
