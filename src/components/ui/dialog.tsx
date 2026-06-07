"use client";

import {
  Dialog as HUIDialog,
  DialogPanel,
  DialogTitle as HUIDialogTitle,
  Description,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "full";

const sizeClasses: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  // True fullscreen — fills the dynamic viewport (100dvh) edge-to-edge
  // so the role-nav pill (z-sticky) doesn't peek through below the
  // panel. Caller controls inner padding (we strip the default p-6
  // via panelPadding).
  full: "max-w-none w-screen h-[100dvh]",
};

const panelPaddingClasses: Record<Size, string> = {
  sm: "p-6",
  md: "p-6",
  lg: "p-6",
  full: "p-0",
};

type DialogProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  size?: Size;
  children: ReactNode;
};

export function Dialog({ open, onClose, size = "md", children }: DialogProps) {
  return (
    <Transition show={open} as={Fragment}>
      <HUIDialog onClose={onClose} className="relative z-modal">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-base ease-default"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-fast ease-default"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-overlay" aria-hidden />
        </TransitionChild>

        <div
          className={cn(
            "fixed inset-0 z-modal flex justify-center",
            // For sized dialogs keep the breathing-room padding +
            // bottom-anchor on mobile / centered on sm+. Full takes
            // the whole viewport so we strip both.
            size === "full"
              ? "items-stretch"
              : "items-end sm:items-center p-4",
          )}
        >
          <TransitionChild
            as={Fragment}
            enter="transition duration-slow ease-emphasize"
            enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="transition duration-base ease-default"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className={cn(
                "w-full bg-surface text-fg shadow-lg",
                size === "full"
                  ? // Edge-to-edge: no rounded corners, no outer border,
                    // dialog panel IS the viewport.
                    "flex flex-col overflow-hidden"
                  : "rounded-xl border border-line",
                panelPaddingClasses[size],
                sizeClasses[size],
              )}
            >
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </HUIDialog>
    </Transition>
  );
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <HUIDialogTitle className="text-lg font-semibold text-headline mb-1">
      {children}
    </HUIDialogTitle>
  );
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <Description className="text-sm text-muted mb-4">{children}</Description>;
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2 mt-6">{children}</div>;
}
