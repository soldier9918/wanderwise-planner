import thumbMh370 from "@/assets/example-thumb-mh370.jpg";
import thumbRome from "@/assets/example-thumb-rome.jpg";
import thumbBitcoin from "@/assets/example-thumb-bitcoin.jpg";
import thumbSpace from "@/assets/example-thumb-space.jpg";
import thumbStoic from "@/assets/example-thumb-stoic.jpg";
import thumbAi from "@/assets/example-thumb-ai.jpg";

const a = [
  { img: thumbMh370, t: "The MH370 Mystery", v: "212K views" },
  { img: thumbRome, t: "The Rise of Rome", v: "98K views" },
  { img: thumbBitcoin, t: "Bitcoin Explained", v: "154K views" },
];
const b = [
  { img: thumbSpace, t: "Black Holes", v: "301K views" },
  { img: thumbStoic, t: "5 Stoic Habits", v: "87K views" },
  { img: thumbAi, t: "AI in 2030", v: "176K views" },
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
