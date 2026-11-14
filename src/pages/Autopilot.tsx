import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Clapperboard, Trash2, Youtube } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Create, { type PlanSettings } from "@/pages/Create";

const fmt = (d: string) => new Date(d).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const localMin = (ms = 0) => new Date(Date.now() + ms - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

export default function Autopilot() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOn, setCreateOn] = useState("");
  const [publishOn, setPublishOn] = useState("");

  const { data: plans = [] } = useQuery({
    queryKey: ["autopilot-plans"], enabled: !!user,
    queryFn: async () => (await supabase.from("autopilot_plans").select("*").order("create_on")).data ?? [],
  });
  const { data: uploads = [] } = useQuery({
    queryKey: ["autopilot-uploads"], enabled: !!user,
    queryFn: async () => (await supabase.from("youtube_uploads").select("id, video_id, title, publish_at, youtube_video_id, status").not("publish_at", "is", null).order("publish_at")).data ?? [],
  });
  const now = Date.now();
  const upcoming = uploads.filter((u) => u.status === "uploaded" && new Date(u.publish_at!).getTime() > now);
  const released = uploads.filter((u) => u.status === "uploaded" && new Date(u.publish_at!).getTime() <= now);
  const due = plans.filter((p) => p.status === "planned" && new Date(p.create_on).getTime() <= now);

  const addPlan = async (topic: string, settings: PlanSettings) => {
    if (!user || topic.trim().length < 3) { toast.error("Describe your video idea first."); return false; }
    if (!createOn) { toast.error("Choose when to make it."); return false; }
    const { error } = await supabase.from("autopilot_plans").insert({ user_id: user.id, topic: topic.trim(), settings, create_on: new Date(createOn).toISOString(), publish_on: publishOn ? new Date(publishOn).toISOString() : null });
    if (error) { toast.error(error.message); return false; }
    setCreateOn(""); setPublishOn("");
    toast.success("Added to your Autopilot plan.");
    qc.invalidateQueries({ queryKey: ["autopilot-plans"] });
    return true;
  };
  const remove = async (id: string) => {
    await supabase.from("autopilot_plans").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["autopilot-plans"] });
  };
  const markMade = (id: string) => supabase.from("autopilot_plans").update({ status: "made" }).eq("id", id).then(() => qc.invalidateQueries({ queryKey: ["autopilot-plans"] }));

  const stat = "rounded-xl border border-border bg-card p-4";
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-5xl py-12">
        <h1 className="text-4xl font-extrabold">Autopilot</h1>
        <p className="mt-2 text-muted-foreground">Plan when each video gets made and when it goes live on YouTube.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className={stat}><p className="text-xs text-muted-foreground">Planned videos</p><p className="text-2xl font-bold">{plans.filter((p) => p.status === "planned").length}</p></div>
          <div className={stat}><p className="text-xs text-muted-foreground">Scheduled on YouTube</p><p className="text-2xl font-bold">{upcoming.length}</p></div>
          <div className={stat}><p className="text-xs text-muted-foreground">Next release</p><p className="text-lg font-bold">{upcoming[0] ? fmt(upcoming[0].publish_at!) : "None yet"}</p></div>
        </div>

        {due.length > 0 && <div role="status" className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">{due.length} planned {due.length === 1 ? "video is" : "videos are"} ready to make today.</div>}

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Clapperboard className="h-5 w-5 text-primary" />Video plan</h2>
          <div className="mt-4">
            <Create onPlan={addPlan} planExtra={
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Make it on
                    <Input type="datetime-local" min={localMin()} value={createOn} onChange={(e) => setCreateOn(e.target.value)} />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Go live on YouTube (optional)
                    <Input type="datetime-local" min={createOn || localMin()} value={publishOn} onChange={(e) => setPublishOn(e.target.value)} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Planning is free. Credits are only used when you press “Make video” and create it.</p>
              </div>
            } />
          </div>
          <ul className="mt-4 grid gap-2">
            {plans.length === 0 && <li className="text-sm text-muted-foreground">No planned videos yet.</li>}
            {plans.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.topic}</p>
                  <p className="text-xs text-muted-foreground">Make: {fmt(p.create_on)}{p.publish_on && ` · Go live: ${fmt(p.publish_on)}`}</p>
                </div>
                {p.status === "made" ? <span className="text-xs font-semibold text-primary">Made</span> : (
                  <Button asChild size="sm" onClick={() => markMade(p.id)}><Link to={`/create?idea=${encodeURIComponent(p.topic)}&settings=${encodeURIComponent(JSON.stringify(p.settings ?? {}))}`}>Make video</Link></Button>
                )}
                <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold"><CalendarClock className="h-5 w-5 text-primary" />YouTube release schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">To schedule a release, open a video, press Publish to YouTube and choose “Schedule for later”.</p>
          <ul className="mt-4 grid gap-2">
            {upcoming.length + released.length === 0 && <li className="text-sm text-muted-foreground">Nothing scheduled yet.</li>}
            {[...upcoming, ...released].map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                <Youtube className="h-4 w-4 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.title || "Untitled video"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(u.publish_at!).getTime() > now ? "Goes live" : "Went live"} {fmt(u.publish_at!)}</p>
                </div>
                <Button asChild size="sm" variant="outline"><Link to={`/video/${u.video_id}`}>Open</Link></Button>
                {u.youtube_video_id && <Button asChild size="sm" variant="outline"><a href={`https://studio.youtube.com/video/${u.youtube_video_id}/edit`} target="_blank" rel="noreferrer">Studio</a></Button>}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
