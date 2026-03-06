import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { insforge } from "@/lib/insforge";
import { navigateTo } from "@/lib/router";

export default function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "verify">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "sign-in") {
        const { error } = await insforge.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigateTo("/me");
        return;
      }

      if (mode === "sign-up") {
        const { data, error } = await insforge.auth.signUp({ email, password, name });
        if (error) throw error;
        if (data?.requireEmailVerification) {
          setMode("verify");
          toast.success("Check your email for the verification code.");
          return;
        }
        toast.success("Account created.");
        navigateTo("/me");
        return;
      }

      const { error } = await insforge.auth.verifyEmail({ email, otp: code });
      if (error) throw error;
      toast.success("Email verified. You are now signed in.");
      navigateTo("/me");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const { error } = await insforge.auth.signInWithOAuth({ provider, redirectTo: `${window.location.origin}/me` });
    if (error) toast.error(error.message);
  };

  const resendVerification = async () => {
    const { error } = await insforge.auth.resendVerificationEmail({ email });
    if (error) return toast.error(error.message);
    toast.success("Verification code sent.");
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex gap-2 text-[11px] font-semibold uppercase tracking-[0.15em]">
        <Button type="button" variant={mode === "sign-in" ? "default" : "outline"} className="flex-1 rounded-sm" onClick={() => setMode("sign-in")}>Sign in</Button>
        <Button type="button" variant={mode === "sign-up" ? "default" : "outline"} className="flex-1 rounded-sm" onClick={() => setMode("sign-up")}>Create account</Button>
      </div>
      <form onSubmit={handlePasswordAuth} className="space-y-4">
        {mode === "sign-up" ? <Input value={name} onChange={event => setName(event.target.value)} placeholder="How your name should appear" required className="rounded-sm border-border bg-background" /> : null}
        <Input value={email} onChange={event => setEmail(event.target.value)} placeholder="email@example.com" type="email" required className="rounded-sm border-border bg-background font-mono" />
        {mode === "verify" ? <Input value={code} onChange={event => setCode(event.target.value)} placeholder="Enter the 6-digit code" inputMode="numeric" required className="rounded-sm border-border bg-background font-mono" /> : <Input value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" type="password" required className="rounded-sm border-border bg-background" />}
        {mode === "verify" ? <Button type="button" variant="ghost" className="px-0 text-xs uppercase tracking-[0.15em]" onClick={() => void resendVerification()}>Resend code</Button> : null}
        <Button type="submit" className="glow-heat w-full rounded-sm border border-[hsl(var(--heat))] bg-[hsl(var(--heat))] text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:brightness-110" disabled={submitting}>{submitting ? "Working..." : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : "Verify email"}</Button>
      </form>
      {mode !== "verify" ? <div className="mt-6 space-y-2"><Button type="button" variant="outline" className="w-full rounded-sm uppercase tracking-[0.15em]" onClick={() => void handleOAuth("google")}>Continue with Google</Button><Button type="button" variant="outline" className="w-full rounded-sm uppercase tracking-[0.15em]" onClick={() => void handleOAuth("github")}>Continue with GitHub</Button></div> : null}
    </div>
  );
}

