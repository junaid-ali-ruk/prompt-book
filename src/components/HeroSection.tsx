import { Flame } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20 text-center">
      <div className="animate-pulse-heat absolute top-1/3 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(0_40%_46%/0.06)] blur-[100px]" />

      <div className="relative mx-auto max-w-3xl space-y-6">
        <h1 className="animate-fade-up text-4xl font-bold uppercase tracking-[0.15em] sm:text-5xl md:text-6xl">
          <span className="text-foreground">PROMPT-</span>
          <span className="text-heat-glow">GALLERY</span>
          <Flame className="relative -top-0.5 ml-1 inline-block h-8 w-8 text-heat-glow sm:h-10 sm:w-10" />
        </h1>

        <p className="animate-fade-up-delay-1 mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Discover and share production-ready AI prompts for <span className="text-heat">Lovable</span>,
          <span className="text-heat"> v0</span>, <span className="text-heat">Bolt</span>, <span className="text-heat">Cursor</span>, and more.
        </p>
      </div>
    </section>
  );
}