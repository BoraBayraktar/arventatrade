import Image from "next/image";

import { Label } from "@/components/label";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type GridTileImageProps = {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string | number;
    currencyCode: string;
    locale: Locale;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>;

export function GridTileImage({ isInteractive = true, active, label, className, alt, ...props }: GridTileImageProps) {
  return (
    <div
      className={cn(
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(18,18,22,0.12)]",
        active ? "border-2 border-[color:var(--primary)]" : "border-border",
        label ? "relative" : "",
      )}
    >
      {props.src ? (
        <Image
          alt={alt}
          className={cn(
            "relative h-full w-full object-contain",
            isInteractive ? "transition duration-300 ease-in-out group-hover:scale-[1.03]" : "",
            className,
          )}
          unoptimized
          {...props}
        />
      ) : null}
      {label ? <Label {...label} /> : null}
    </div>
  );
}