import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Org logo with an initials-avatar fallback. Used everywhere an org's
 * brand surfaces — marketplace storefront cards, product detail pages,
 * order detail (factory branding), agent + admin request views.
 *
 * The image is served from `/api/org/{id}/logo`; the route returns 404
 * when no logo is set, which the `<Image>` element's `onError` would
 * normally hit — but server-side we can't catch that, so we trust the
 * caller's `hasLogo` boolean (read from `Organization.logoUrl != null`).
 */
export function OrgAvatar({
  orgId,
  name,
  hasLogo,
  size = "md",
  className,
}: {
  orgId: string;
  name: string;
  hasLogo: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 64,
  }[size];
  const text = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      style={{ width: dims, height: dims }}
      className={cn(
        "shrink-0 rounded-full overflow-hidden bg-brand-50 text-brand-700",
        "flex items-center justify-center font-semibold border border-line",
        text,
        className,
      )}
      aria-label={name}
    >
      {hasLogo ? (
        <Image
          src={`/api/org/${orgId}/logo`}
          alt={name}
          width={dims}
          height={dims}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}
