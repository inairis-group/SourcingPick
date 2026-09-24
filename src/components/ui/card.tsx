import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "raised" | "outline";

/**
 * The canvas's section card: a 22px corner, a single #DCE3F2 hairline and a
 * very soft navy lift. It draws that card identically on every board, so
 * `default` and `raised` are the same thing here — the shadow is part of the
 * card, not an emphasis on top of it. `outline` keeps its job of marking a
 * region without claiming to be a surface.
 */
const variantClasses: Record<Variant, string> = {
  default: "bg-surface border border-line shadow-card",
  raised: "bg-surface border border-line shadow-card",
  outline: "bg-transparent border border-line",
};

type Padding = "none" | "sm" | "md" | "lg";

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6", // 24px — the canvas's card padding
  lg: "p-8",
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  padding?: Padding;
  children: ReactNode;
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1 mb-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        // Unbounded 18px — the canvas's card heading, same face as the page
        // title one size down.
        "font-display text-lg leading-snug font-semibold tracking-tight text-headline",
        className,
      )}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted", className)} {...rest}>
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 mt-6", className)} {...rest}>
      {children}
    </div>
  );
}
