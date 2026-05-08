import { Crown, Gem, Star } from "lucide-react";
import clsx from "clsx";

export type Plan = "free" | "pro" | "studio";

const CFG = {
  free:   { label: "Plan Free",    Icon: Star,  cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  pro:    { label: "Plan Pro",     Icon: Crown, cls: "bg-gradient-to-r from-amber-400 to-amber-600 text-white ring-amber-500/30 shadow-sm" },
  studio: { label: "Plan Estudio", Icon: Gem,   cls: "bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white ring-violet-500/30 shadow-sm" },
} as const;

export default function PlanBadge({ plan, size = "md" }: { plan: Plan; size?: "sm" | "md" }) {
  const cfg = CFG[plan];
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-full font-bold ring-1",
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
      cfg.cls
    )}>
      <cfg.Icon className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} /> {cfg.label}
    </span>
  );
}
