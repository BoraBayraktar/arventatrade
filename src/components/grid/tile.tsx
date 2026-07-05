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
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600",
        active ? "border-2 border-blue-600" : "border-neutral-200",
        label ? "relative" : "",
      )}
    >
      {props.src ? (
        <Image
          alt={alt}
          className={cn(
            "relative h-full w-full object-contain",
            isInteractive ? "transition duration-300 ease-in-out group-hover:scale-105" : "",
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