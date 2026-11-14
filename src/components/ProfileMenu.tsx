import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Film, Gift, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "@/lib/account";
import { scrollToSection } from "@/components/ScrollToTop";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function planLabel(acct: ReturnType<typeof useAccount>["data"]) {
  if (acct?.isAdmin) return "Admin";
  const t = acct?.tier;
  if (acct?.pro && t) return t.charAt(0).toUpperCase() + t.slice(1);
  return "Free";
}

export function useRecentVideos(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recent-videos", user?.id],
    enabled: enabled && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("videos").select("id, title").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });
}

export default function ProfileMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const { data: acct } = useAccount();
  const { data: recent } = useRecentVideos(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const email = user?.email ?? "";
  const goInvite = () => {
    if (pathname === "/billing") scrollToSection("invite", "smooth");
    else navigate("/billing#invite");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account: ${email}`}
        title={email}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-primary/60 bg-card font-display text-sm font-bold uppercase text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {email.charAt(0) || "?"}
        {acct && (
          <span className={`pointer-events-none absolute -bottom-1.5 -right-2 rounded-full px-1 py-px text-[8px] font-extrabold leading-none tracking-wide ring-2 ring-background ${planLabel(acct) === "Free" ? "bg-muted text-muted-foreground" : planLabel(acct) === "Creator" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
            {planLabel(acct).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate text-sm font-semibold" title={email}>{email}</p>
          <span className="mt-1.5 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">{planLabel(acct)} plan</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Recent videos</DropdownMenuLabel>
        {recent?.length ? recent.map((v) => (
          <DropdownMenuItem key={v.id} asChild>
            <Link to={`/video/${v.id}`} className="cursor-pointer"><Film className="mr-2 h-4 w-4 shrink-0" /><span className="truncate">{v.title || "Untitled video"}</span></Link>
          </DropdownMenuItem>
        )) : <p className="px-2 pb-1 text-xs text-muted-foreground">No videos yet</p>}
        <DropdownMenuItem asChild><Link to="/dashboard" className="cursor-pointer text-xs text-primary">See all my videos →</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={goInvite} className="cursor-pointer">
          <Gift className="mr-2 h-4 w-4" />Invite friends
          {acct?.code && <span className="ml-auto font-mono text-xs text-primary">{acct.code}</span>}
        </DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/billing" className="cursor-pointer"><CreditCard className="mr-2 h-4 w-4" />Plans &amp; Billing</Link></DropdownMenuItem>
        {acct?.adminAccess && <DropdownMenuItem asChild><Link to="/admin-kb20" className="cursor-pointer"><Shield className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
