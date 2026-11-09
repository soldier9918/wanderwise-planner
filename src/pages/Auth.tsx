import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/SiteHeader";

type Mode = "signin" | "signup" | "forgot";

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sentKind, setSentKind] = useState<"signup" | "reset">("signup");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setSentKind("signup");
        setSentTo(email);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSentKind("reset");
        setSentTo(email);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google") => {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Sign-in failed");
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="absolute inset-0 bg-glow" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        {sentTo ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-2xl">✉️</div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {sentKind === "reset" ? "We sent a password reset link to " : "We sent a confirmation link to "}<span className="font-medium text-foreground">{sentTo}</span>.{sentKind === "reset" ? " Open the link to set a new password." : " Click it to activate your account, then sign in."}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Can't see it? Check your spam or junk folder.</p>
          <Button className="mt-6 w-full" variant="outline" onClick={() => { setSentTo(null); setMode("signin"); setPassword(""); }}>
            Back to sign in
          </Button>
        </div>
        ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">
            {mode === "signup" ? "Create your account" : mode === "signin" ? "Welcome back" : "Reset password"}
          </h1>
          {mode !== "forgot" && (
            <div className="mt-6 grid gap-2">
              <Button variant="outline" onClick={() => oauth("google")}>Continue with Google</Button>
              <div className="my-2 text-center text-xs uppercase tracking-widest text-muted-foreground">or</div>
            </div>
          )}
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "forgot" && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Sign up" : mode === "signin" ? "Sign in" : "Send reset link"}
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                <button className="hover:text-foreground" onClick={() => setMode("signup")}>Create account</button>
                <button className="hover:text-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>
              </>
            ) : (
              <button className="hover:text-foreground" onClick={() => setMode("signin")}>Back to sign in</button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
