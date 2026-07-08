import Image from "next/image";

import { Label } from "@/components/label";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type GridTileImageProps = {
  isInteractive?: boolean;
  active?: boolean;
  secondarySrc?: React.ComponentProps<typeof Image>["src"];
  label?: {
    title: string;
    amount: string | number;
    currencyCode: string;
    locale: Locale;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>;

export function GridTileImage({ isInteractive = true, active, secondarySrc, label, className, alt, ...props }: GridTileImageProps) {
  const canRenderSecondaryWithFixedSize = typeof props.width === "number" && typeof props.height === "number";

  return (
    <div
      className={cn(
        "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(18,18,22,0.12)]",
        active ? "border-2 border-[color:var(--primary)]" : "border-border",
      )}
    >
      {props.src ? (
        <>
          {secondarySrc && (props.fill || canRenderSecondaryWithFixedSize) ? (
            props.fill ? (
              <Image
                alt={alt}
                src={secondarySrc}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 ease-in-out group-hover:opacity-100",
                  className,
                )}
                unoptimized
                fill
                sizes={props.sizes}
              />
            ) : (
              <Image
                alt={alt}
                src={secondarySrc}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 ease-in-out group-hover:opacity-100",
                  className,
                )}
                unoptimized
                width={props.width as number}
                height={props.height as number}
              />
            )
          ) : null}
          <Image
            alt={alt}
            className={cn(
              "relative h-full w-full object-contain transition duration-300 ease-in-out",
              secondarySrc ? "group-hover:opacity-0" : isInteractive ? "group-hover:scale-[1.03]" : "",
              className,
            )}
            unoptimized
            {...props}
          />
        </>
      ) : null}
      {label ? <Label {...label} /> : null}
    </div>
  );
}