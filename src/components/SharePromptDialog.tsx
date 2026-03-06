import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { navigateTo } from "@/lib/router";

export default function SharePromptDialog() {
  const { userId } = useAuthSession();

  if (!userId) {
    return <Button type="button" className="glow-heat rounded-sm border-[hsl(var(--heat))] bg-[hsl(var(--heat))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:brightness-110" onClick={() => navigateTo("/auth")}>Sign in to share</Button>;
  }

  return (
    <Button type="button" className="glow-heat rounded-sm border-[hsl(var(--heat))] bg-[hsl(var(--heat))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:brightness-110" onClick={() => navigateTo("/share")}>
      <Plus className="h-3.5 w-3.5" />
      Share
    </Button>
  );
}