import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

/**
 * The canvas draws two fields and no others: a 46px one for forms and a 40px
 * one for filter bars. `sm` and `md` are that compact field; `lg` is the form
 * field. All three use the same 14px side padding, which is what keeps a
 * filter row and a form column optically aligned when they share a screen.
 */
const sizeClasses: Record<Size, string> = {
  sm: "min-h-10 px-3.5 py-0 text-base",
  md: "min-h-10 px-3.5 py-0 text-base",
  lg: "min-h-[46px] px-3.5 py-0 text-md",
};

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  inputSize?: Size;
  invalid?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { inputSize = "md", invalid, leftSlot, rightSlot, className, disabled, ...rest },
  ref,
) {
  if (leftSlot || rightSlot) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border-[1.5px] bg-surface transition-colors duration-fast",
          "focus-within:border-focus focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2",
          invalid ? "border-danger" : "border-line-strong",
          disabled && "bg-subtle cursor-not-allowed",
          sizeClasses[inputSize],
          className,
        )}
      >
        {leftSlot && <span className="text-faint shrink-0">{leftSlot}</span>}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className="flex-1 bg-transparent text-fg placeholder:text-faint outline-none min-w-0"
          {...rest}
        />
        {rightSlot && <span className="text-faint shrink-0">{rightSlot}</span>}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-xl border-[1.5px] bg-surface text-fg placeholder:text-faint",
        "transition-colors duration-fast",
        "focus:outline-2 focus:outline-focus focus:outline-offset-2",
        invalid ? "border-danger focus:border-danger" : "border-line-strong focus:border-focus",
        disabled && "bg-subtle cursor-not-allowed",
        sizeClasses[inputSize],
        className,
      )}
      {...rest}
    />
  );
});
