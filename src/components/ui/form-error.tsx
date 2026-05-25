import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormErrorProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Form-level error banner (auth failures, server errors, etc.).
 * For inline per-field errors, use the `error` prop on <Field>.
 */
export function FormError({ children, className }: FormErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border border-danger-edge bg-danger-soft px-3 py-2 text-sm text-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}
