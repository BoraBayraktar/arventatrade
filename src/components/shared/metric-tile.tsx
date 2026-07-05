import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTileProps = {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  className?: string;
};

export function MetricTile({ label, value, accent = false, className }: MetricTileProps) {
  return (
    <Card
      className={cn(
        accent
          ? "border-transparent bg-[linear-gradient(135deg,#0e7b71_0%,#14998b_100%)] text-white"
          : "bg-white/85",
        className,
      )}
    >
      <CardContent className="p-5">
        <span className={cn("block text-xs font-medium", accent ? "text-white/80" : "text-[color:var(--color-text-muted)]")}>{label}</span>
        <strong className="mt-2 block text-lg font-semibold leading-6">{value}</strong>
      </CardContent>
    </Card>
  );
}
