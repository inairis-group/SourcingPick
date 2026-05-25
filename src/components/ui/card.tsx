import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "raised" | "outline";

const variantClasses: Record<Variant, string> = {
  default: "bg-surface border border-line",
  raised: "bg-surface border border-line shadow-sm",
  outline: "bg-transparent border border-line",
};

type Padding = "none" | "sm" | "md" | "lg";

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
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
        "rounded-lg",
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
    <h3 className={cn("text-lg font-semibold text-headline", className)} {...rest}>
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
