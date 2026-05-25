import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "muted" | "inline";

const variantClasses: Record<Variant, string> = {
  default:
    "text-link hover:text-link-hover transition-colors duration-fast no-underline font-medium",
  muted:
    "text-muted hover:text-fg transition-colors duration-fast no-underline",
  inline:
    "text-link hover:text-link-hover underline underline-offset-2 decoration-1",
};

export type LinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & {
    variant?: Variant;
    children: ReactNode;
  };

export function Link({ variant = "default", className, children, ...rest }: LinkProps) {
  return (
    <NextLink className={cn(variantClasses[variant], className)} {...rest}>
      {children}
    </NextLink>
  );
}
