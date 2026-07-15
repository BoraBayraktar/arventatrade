import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[color:var(--color-brand)] text-white",
        secondary: "border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-text-muted)]",
        outline: "border-[color:var(--color-border)] text-[color:var(--color-text)]",
        accent: "border-[color:var(--color-brand)] bg-[color:var(--color-brand)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
