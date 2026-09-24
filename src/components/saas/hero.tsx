import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The navy banner across the top of a dashboard.
 *
 * The canvas draws it at a 26px corner — wider than the 22px it uses for
 * cards, which is what makes it read as a surface the cards sit near rather
 * than one of them — with 30px/34px of padding and a fixed 320px illustration
 * held to the end edge.
 *
 * The illustration drops below `lg` rather than shrinking. It is the same
 * traceability drawing the access screens use, and at 200px wide its detail
 * becomes noise; the greeting and the two actions are the part that does
 * work.
 */
export function Hero({
  badge,
  title,
  body,
  actions,
  illustration = "/design/app/auth-traceability.svg",
}: {
  badge: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  illustration?: string;
}) {
  return (
    <section className="bg-navy-950 relative grid items-center gap-6 overflow-hidden rounded-[26px] px-6 py-7 text-white sm:px-8.5 sm:py-7.5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-3">
        <span className="bg-amber-edge text-amber-ink inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold">
          {badge}
        </span>
        <h1 className="font-display m-0 text-3xl leading-[1.2] font-semibold tracking-[-0.02em] text-white">
          {title}
        </h1>
        {body && (
          <p className="text-navy-panel m-0 max-w-[620px] text-md leading-[1.55]">{body}</p>
        )}
        {actions && <div className="flex flex-wrap gap-2.5 pt-1">{actions}</div>}
      </div>
      <Image
        src={illustration}
        alt=""
        width={320}
        height={210}
        className="hidden h-[210px] w-80 justify-self-end object-contain lg:block"
      />
    </section>
  );
}
