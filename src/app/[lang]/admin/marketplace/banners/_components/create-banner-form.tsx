"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BannerTone } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  BannerCard,
  type BannerCardData,
} from "@/components/marketplace/banner-card";
import {
  createBannerAction,
  type BannerActionState,
} from "@/lib/marketplace/banner-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: BannerActionState = {};
const TONES = Object.values(BannerTone);
type Background = "PRESET" | "GRADIENT" | "IMAGE" | "VIDEO";
const BACKGROUNDS: Background[] = ["PRESET", "GRADIENT", "IMAGE", "VIDEO"];

const DEFAULT_FROM = "#1d4ed8";
const DEFAULT_TO = "#1e3a8a";
const DEFAULT_VIA = "#3b82f6";

export function CreateBannerForm() {
  const dict = useDictionary();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createBannerAction,
    INITIAL,
  );

  // Controlled fields drive the live preview; they still submit natively
  // (value-bound inputs post their value), so no duplicate hidden inputs.
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [tone, setTone] = useState<BannerTone>(BannerTone.BRAND);
  const [background, setBackground] = useState<Background>("PRESET");
  const [gradientFrom, setGradientFrom] = useState(DEFAULT_FROM);
  const [gradientVia, setGradientVia] = useState(DEFAULT_VIA);
  const [viaEnabled, setViaEnabled] = useState(false);
  const [gradientTo, setGradientTo] = useState(DEFAULT_TO);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  useEffect(() => {
    if (state.created) {
      formRef.current?.reset();
      setTitle("");
      setSubtitle("");
      setCtaLabel("");
      setCtaHref("");
      setTone(BannerTone.BRAND);
      setBackground("PRESET");
      setGradientFrom(DEFAULT_FROM);
      setGradientVia(DEFAULT_VIA);
      setViaEnabled(false);
      setGradientTo(DEFAULT_TO);
      setGradientAngle(135);
      setOverlayOpacity(40);
      setMediaFile(null);
      router.refresh();
    }
  }, [state.created, router]);

  const t = dict.admin.banners;
  const isGradient = background === "GRADIENT";
  const isImage = background === "IMAGE";
  const isVideo = background === "VIDEO";
  const isMedia = isImage || isVideo;

  const preview: BannerCardData = {
    title: title || t.previewTitleFallback,
    subtitle: subtitle || null,
    ctaLabel: ctaLabel || null,
    ctaHref: ctaHref || null,
    tone,
    background,
    gradientFrom: isGradient ? gradientFrom : null,
    gradientVia: isGradient && viaEnabled ? gradientVia : null,
    gradientTo: isGradient ? gradientTo : null,
    gradientAngle: isGradient ? gradientAngle : null,
    mediaUrl: isMedia ? mediaPreviewUrl : null,
    overlayOpacity,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,22rem)] gap-6">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4 min-w-0"
      >
        {state.error && <FormError>{state.error}</FormError>}
        {state.created && (
          <div className="rounded-md border border-success-edge bg-success-soft/30 px-3 py-2 text-xs text-success">
            {t.created}
          </div>
        )}

        <Field label={t.titleLabel} required>
          <Input
            name="title"
            required
            maxLength={120}
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label={t.subtitleLabel}>
          <Input
            name="subtitle"
            maxLength={200}
            placeholder={t.subtitlePlaceholder}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.ctaLabelLabel} hint={t.ctaHint}>
            <Input
              name="ctaLabel"
              maxLength={40}
              placeholder={t.ctaLabelPlaceholder}
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
            />
          </Field>
          <Field label={t.ctaHrefLabel} hint={t.ctaHrefHint}>
            <Input
              name="ctaHref"
              maxLength={300}
              placeholder="/marketplace?deals=1"
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
            />
          </Field>
        </div>

        {/* Background type */}
        <Field label={t.backgroundLabel}>
          <Select
            name="background"
            value={background}
            onChange={(v) => setBackground(v as Background)}
            options={BACKGROUNDS.map((b) => ({
              value: b,
              label: t.backgrounds[b],
            }))}
          />
        </Field>

        {/* PRESET: tone picker */}
        {background === "PRESET" && (
          <Field label={t.toneLabel}>
            <Select
              name="tone"
              value={tone}
              onChange={(v) => setTone(v as BannerTone)}
              options={TONES.map((tn) => ({ value: tn, label: t.tones[tn] }))}
            />
          </Field>
        )}

        {/* GRADIENT: colour builder */}
        {isGradient && (
          <div className="flex flex-col gap-4 rounded-md border border-line p-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t.gradientFromLabel}>
                <ColorInput
                  name="gradientFrom"
                  value={gradientFrom}
                  onChange={setGradientFrom}
                />
              </Field>
              <Field label={t.gradientToLabel}>
                <ColorInput
                  name="gradientTo"
                  value={gradientTo}
                  onChange={setGradientTo}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={viaEnabled}
                onChange={(e) => setViaEnabled(e.target.checked)}
                className="size-4 rounded border-line accent-action"
              />
              {t.gradientViaToggle}
            </label>
            {viaEnabled && (
              <Field label={t.gradientViaLabel}>
                <ColorInput
                  name="gradientVia"
                  value={gradientVia}
                  onChange={setGradientVia}
                />
              </Field>
            )}

            <Field
              label={`${t.gradientAngleLabel} — ${gradientAngle}°`}
            >
              <input
                name="gradientAngle"
                type="range"
                min={0}
                max={360}
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                className="w-full accent-action"
              />
            </Field>
          </div>
        )}

        {/* IMAGE / VIDEO: media upload + overlay */}
        {isMedia && (
          <div className="flex flex-col gap-4 rounded-md border border-line p-4">
            <Field
              label={isVideo ? t.mediaVideoLabel : t.mediaImageLabel}
              hint={isVideo ? t.mediaVideoHint : t.mediaImageHint}
            >
              <input
                key={background}
                name="media"
                type="file"
                accept={isVideo ? "video/*" : "image/*"}
                onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted file:me-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-fg hover:file:bg-line/40"
              />
            </Field>
            <Field label={`${t.overlayLabel} — ${overlayOpacity}%`} hint={t.overlayHint}>
              <input
                name="overlayOpacity"
                type="range"
                min={0}
                max={100}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full accent-action"
              />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.orderLabel} hint={t.orderHint}>
            <Input name="sortOrder" type="number" min="0" defaultValue="0" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.startsLabel} hint={t.scheduleHint}>
            <Input name="startsAt" type="datetime-local" />
          </Field>
          <Field label={t.endsLabel}>
            <Input name="endsAt" type="datetime-local" />
          </Field>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" size="sm" loading={pending}>
            {t.createCta}
          </Button>
        </div>
      </form>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6 self-start">
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-2">
          {t.previewLabel}
        </p>
        <BannerCard banner={preview} />
        <p className="text-xs text-muted mt-2">{t.previewHint}</p>
      </div>
    </div>
  );
}

/**
 * Native colour swatch paired with its hex value, so the admin can either
 * pick visually or paste an exact hex. The text field shows/normalises the
 * value; both share the same `name` only on the swatch so the form posts a
 * single value.
 */
function ColorInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (next: string) => void;
}) {
  // `name` lives on the text field, not the swatch: native colour inputs
  // coerce to 6-digit lowercase, which would diverge from our state value.
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={name}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-sm border border-line bg-surface p-1"
      />
      <Input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={9}
        className="font-mono text-sm"
      />
    </div>
  );
}
