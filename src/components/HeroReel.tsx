import titanic from "@/assets/reel-titanic.jpg";
import egypt from "@/assets/reel-egypt.jpg";
import ocean from "@/assets/reel-ocean.jpg";
import hustle from "@/assets/reel-hustle.jpg";
import haunted from "@/assets/reel-haunted.jpg";
import mars from "@/assets/reel-mars.jpg";

const a = [
  { img: titanic, t: "Titanic's Secret", v: "264K views" },
  { img: egypt, t: "Egypt's Lost Pyramid", v: "119K views" },
  { img: ocean, t: "Deep Ocean Monsters", v: "342K views" },
];
const b = [
  { img: hustle, t: "Side Hustle £10K", v: "73K views" },
  { img: haunted, t: "Haunted Asylum", v: "188K views" },
  { img: mars, t: "Mars Colony 2050", v: "205K views" },
];

function Row({ items, dir }: { items: typeof a; dir: "left" | "right" }) {
  const list = [...items, ...items, ...items];
  return (
    <div className={`marquee-track ${dir === "left" ? "animate-marquee-left" : "animate-marquee-right"}`} style={{ animationDuration: "50s" }}>
      {[0, 1].map((c) => (
        <div key={c} className="flex">
          {list.map((e, i) => (
            <div key={i} className="mr-5 w-[320px] shrink-0 overflow-hidden rounded-xl border border-border bg-card">
              <img src={e.img} alt="" className="aspect-video w-full object-cover" />
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

/** Slowly drifting, angled reel of creator thumbnails for the hero background. */
export default function HeroReel() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-1/2 w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-6 space-y-5">
        <Row items={a} dir="left" />
        <Row items={b} dir="right" />
        <Row items={[...a].reverse()} dir="left" />
      </div>
      <div className="absolute inset-0 bg-hero-vignette" />
    </div>
  );
}
