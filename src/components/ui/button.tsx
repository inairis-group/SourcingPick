import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-action text-on-action hover:bg-action-hover hover:text-white active:bg-action-active disabled:bg-disabled disabled:text-inverse",
  secondary:
    "bg-surface text-fg border border-line-strong hover:bg-subtle active:bg-sunken disabled:text-disabled disabled:bg-subtle",
  ghost:
    "bg-transparent text-fg hover:bg-ghost-hover hover:text-link-hover active:bg-sunken disabled:text-disabled",
  danger:
    "bg-danger text-inverse hover:bg-danger active:bg-danger disabled:bg-disabled",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-base gap-2",
  lg: "h-12 px-5 text-md gap-2",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

/**
 * Get the button's class string in isolation — useful when styling a
 * Link/anchor to look like a button without the underlying <button> element.
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: { variant?: Variant; size?: Size; fullWidth?: boolean } = {}) {
  return cn(
    "inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-300 ease-default",
    "disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(buttonClass({ variant, size, fullWidth }), className)}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={size} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

function Spinner({ size }: { size: Size }) {
  const dim = size === "sm" ? 14 : size === "md" ? 16 : 18;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
