const imgs = import.meta.glob("@/assets/reel-*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const src = (n: string) => imgs[Object.keys(imgs).find((k) => k.endsWith(`reel-${n}.jpg`))!];

type Card = { n: string; t: string; v: string };
const rows: Card[][] = [
  [
    { n: "titanic", t: "Titanic's Secret", v: "264K views" },
    { n: "egypt", t: "Egypt's Lost Pyramid", v: "119K views" },
    { n: "ocean", t: "Deep Ocean Monsters", v: "342K views" },
    { n: "vikings", t: "Viking Raids", v: "131K views" },
    { n: "area51", t: "Area 51 Files", v: "407K views" },
    { n: "meals", t: "10 Minute Meals", v: "58K views" },
  ],
  [
    { n: "hustle", t: "Side Hustle £10K", v: "73K views" },
    { n: "haunted", t: "Haunted Asylum", v: "188K views" },
    { n: "mars", t: "Mars Colony 2050", v: "205K views" },
    { n: "ww2", t: "World War II in Colour", v: "296K views" },
    { n: "sleep", t: "Sleep in 5 Minutes", v: "91K views" },
    { n: "cars", t: "Supercar Showdown", v: "167K views" },
  ],
  [
    { n: "atlantis", t: "Atlantis Found?", v: "223K views" },
    { n: "dino", t: "Dinosaur Extinction", v: "315K views" },
    { n: "gym", t: "Gym Mistakes", v: "64K views" },
    { n: "crime", t: "Serial Killer Case", v: "251K views" },
    { n: "tokyo", t: "Tokyo at Night", v: "109K views" },
    { n: "stocks", t: "Stock Market Crash", v: "142K views" },
  ],
];

function Row({ items, dir }: { items: Card[]; dir: "left" | "right" }) {
  return (
    <div className={`marquee-track ${dir === "left" ? "animate-marquee-left" : "animate-marquee-right"}`} style={{ animationDuration: "70s" }}>
      {[0, 1].map((c) => (
        <div key={c} className="flex">
          {items.map((e) => (
            <div key={e.n} className="mr-5 w-[320px] shrink-0 overflow-hidden rounded-xl border border-border bg-card">
              <img src={src(e.n)} alt="" width={1088} height={608} className="aspect-video w-full object-cover" />
              <div className="px-3 py-2 text-sm">
                <p className="font-semibold">{e.t}</p>
                <p className="text-xs text-muted-foreground">{e.v}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Slowly drifting, angled reel of 18 unique creator thumbnails for the hero background. */
export default function HeroReel() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-1/2 w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-6 space-y-5">
        <Row items={rows[0]} dir="left" />
        <Row items={rows[1]} dir="right" />
        <Row items={rows[2]} dir="left" />
      </div>
      <div className="absolute inset-0 bg-hero-vignette" />
    </div>
  );
}
