import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Youtube } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { planLabel } from "@/components/ProfileMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "@/lib/account";
import { youtubeStatus, connectYouTube, disconnectYouTube } from "@/components/YouTubePublish";

export default function Profile() {
  const { user } = useAuth();
  const acct = useAccount();
  const qc = useQueryClient();
  const { data: status, isLoading } = useQuery({ queryKey: ["youtube-status"], queryFn: youtubeStatus, retry: false });
  const conn = status?.connection;
  const connect = () => connectYouTube().catch((e) => toast.error((e as Error).message));
  const disconnect = async () => {
    try { await disconnectYouTube(); toast.success("YouTube channel disconnected"); }
    catch (e) { toast.error((e as Error).message); }
    qc.invalidateQueries({ queryKey: ["youtube-status"] });
  };
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-3xl py-12">
        <h1 className="text-4xl font-extrabold">My profile</h1>
        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="font-semibold">{user?.email}</p>
          <p className="mt-1 text-sm text-primary">{planLabel(acct.data)} plan</p>
          <Link to="/billing" className="mt-3 inline-block text-sm text-primary hover:underline">Manage plan &amp; billing →</Link>
        </section>
        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Youtube className="h-5 w-5 text-primary" />Connected YouTube channel</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vydora can only upload videos you choose to publish — it can't delete or change anything else on your channel.</p>
          <div className="mt-4">
            {isLoading ? <p className="text-sm text-muted-foreground">Checking…</p>
            : status && !status.configured ? <p className="text-sm text-muted-foreground">YouTube publishing is coming soon.</p>
            : conn ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  {conn.channel_thumbnail && <img src={conn.channel_thumbnail} alt="" className="h-10 w-10 rounded-full" />}
                  <div>
                    <p className="font-semibold">{conn.channel_title}</p>
                    <a href={`https://www.youtube.com/channel/${conn.channel_id}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View channel</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={connect}>Switch channel</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border p-3">
                <p className="text-sm text-muted-foreground">No channel connected yet.</p>
                <Button size="sm" onClick={connect}>Connect YouTube channel</Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
