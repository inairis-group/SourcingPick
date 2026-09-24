import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "onNavy" | "onNavyGhost";
type Size = "sm" | "md" | "lg";

/**
 * Variants and sizes are the 2026-09 SaaS canvas's, counted off the boards
 * rather than chosen: three sizes appear across all 50 artboards and no
 * others. Every one of them carries `min-height: 44px` — the canvas sets a
 * touch-target floor even on a desktop-only board, so the small size stays
 * tappable when these screens reach a phone.
 *
 * The 1.5px border is not a rounding of 1px. The canvas draws chrome
 * hairlines at 1px and control edges at 1.5px, and a secondary button sitting
 * next to a 1.5px field looks wrong at 1px.
 */
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-action text-on-action border-[1.5px] border-action hover:bg-action-hover hover:border-action-hover hover:text-white active:bg-action-active disabled:bg-disabled disabled:border-disabled disabled:text-inverse",
  secondary:
    "bg-transparent text-fg border-[1.5px] border-line-strong hover:bg-subtle active:bg-sunken disabled:text-disabled disabled:bg-subtle",
  ghost:
    "bg-transparent text-fg border-[1.5px] border-transparent hover:bg-ghost-hover hover:text-link-hover active:bg-sunken disabled:text-disabled",
  danger:
    "bg-danger text-inverse border-[1.5px] border-danger hover:bg-danger active:bg-danger disabled:bg-disabled disabled:border-disabled",
  /**
   * The pair the canvas draws on a navy ground — the dashboard hero, and the
   * dark toolbar over a document. White fill for the action you are meant to
   * take, a 28%-white hairline for the one beside it. They exist as variants
   * rather than as overrides on `secondary` because `!important` on a colour
   * is a thing you end up unpicking later.
   */
  onNavy: "bg-white text-navy-900 border-[1.5px] border-white hover:bg-navy-50 hover:text-navy-900",
  onNavyGhost:
    "bg-transparent text-white border-[1.5px] border-white/28 hover:bg-white/10 hover:text-white",
};

const sizeClasses: Record<Size, string> = {
  /** Toolbars, table rows, filter bars. 47 uses on the canvas. */
  sm: "min-h-11 px-4 py-2.5 text-base gap-2",
  /** The default. Secondary actions and most card footers. 56 uses. */
  md: "min-h-11 px-[22px] py-3.5 text-md gap-2.5",
  /** The one action a screen is about — sign, pay, submit. 16 uses. */
  lg: "min-h-11 px-7 py-[18px] text-[17px] gap-2.5",
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
    "inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-300 ease-default",
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
