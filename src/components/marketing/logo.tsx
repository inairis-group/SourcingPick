import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "auto" follows the theme (default), "default" forces dark wordmark,
   *  "white" forces the white logo. */
  variant?: "auto" | "default" | "white";
  /** Height in pixels. Width scales to maintain the 950:250 aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
};

const ASPECT_RATIO = 950 / 250;

export function Logo({
  variant = "auto",
  height = 32,
  className,
  priority,
}: LogoProps) {
  const width = Math.round(height * ASPECT_RATIO);
  const dim = { height, width: "auto" as const };

  if (variant === "default") {
    return (
      <Image
        src="/logo.svg"
        alt="SourcingPick"
        width={width}
        height={height}
        priority={priority}
        className={cn("h-auto select-none", className)}
        style={dim}
      />
    );
  }
  if (variant === "white") {
    return (
      <Image
        src="/logo-white.png"
        alt="SourcingPick"
        width={width}
        height={height}
        priority={priority}
        className={cn("h-auto select-none", className)}
        style={dim}
      />
    );
  }

  // Auto: render both, hide the inappropriate one via the dark variant.
  // The dark class is applied to <html> by ThemeScript / ThemeToggle.
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={dim}
    >
      <Image
        src="/logo.svg"
        alt="SourcingPick"
        width={width}
        height={height}
        priority={priority}
        className="h-auto select-none block dark:hidden"
        style={dim}
      />
      <Image
        src="/logo-white.png"
        alt=""
        aria-hidden
        width={width}
        height={height}
        priority={priority}
        className="h-auto select-none hidden dark:block"
        style={dim}
      />
    </span>
  );
}
