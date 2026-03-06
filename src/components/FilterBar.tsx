import { AGENT_TOOLS, type AgentTool } from "@/data/prompts";

const filters: Array<{ label: string; value: AgentTool | "All" }> = [
  { label: "ALL", value: "All" },
  ...AGENT_TOOLS.map(tool => ({ label: tool.toUpperCase(), value: tool })),
];

interface FilterBarProps {
  active: AgentTool | "All";
  onChange: (value: AgentTool | "All") => void;
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="animate-fade-up-delay-3 flex flex-wrap justify-center gap-2">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`rounded-sm border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-200 ${
            active === filter.value
              ? "glow-heat border-[hsl(var(--heat))] bg-[hsl(var(--heat))] text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--heat)/0.3)] hover:text-foreground"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}