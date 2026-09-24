import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  children: ReactNode;
};

export function Label({ required, className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        // 13.5px semibold ink — the canvas's field label, drawn the same way
        // on every form it has.
        "block text-[13.5px] leading-tight font-semibold text-fg select-none",
        className,
      )}
      {...rest}
    >
      {children}
      {required && (
        <span aria-hidden className="text-danger ms-0.5">
          *
        </span>
      )}
    </label>
  );
}
