/**
 * Sets `--sp-zoom`, the ratio the frame is scaled by between 821 and 1439px
 * (see "the artboard, scaled" in board.module.css): the window's width
 * without its scrollbar, over the artboard's 1440. Outside that range the
 * property is removed, and the stylesheet ignores it there anyway.
 *
 * It runs twice over. As an inline script (FRAME_FIT_SCRIPT, rendered by the
 * marketing layout), on the first page load, before the frame is parsed, so
 * the page is never drawn at the wrong size; and from <FrameFitEffect>, for a
 * visitor who reaches the site from a page outside this layout, where the
 * script was not part of the document. Whichever runs first installs the
 * listeners; the other only measures.
 *
 * The width is measured again once the document is parsed, because the
 * vertical scrollbar that narrows the window only appears then, and that
 * does not fire `resize`.
 *
 * Self-contained on purpose: the inline script is this function's own source.
 */
export function fitFrame() {
  const root = document.documentElement as HTMLElement & { __spFit?: () => void };
  if (root.__spFit) {
    root.__spFit();
    return;
  }
  const apply = () => {
    const width = root.clientWidth;
    if (width > 820 && width < 1440) root.style.setProperty("--sp-zoom", String(width / 1440));
    else root.style.removeProperty("--sp-zoom");
  };
  root.__spFit = apply;
  apply();
  window.addEventListener("resize", apply);
  document.addEventListener("DOMContentLoaded", apply);
  window.addEventListener("load", apply);
}

/** Built once, on the server, so the markup and the payload carry one string. */
export const FRAME_FIT_SCRIPT = `(${fitFrame.toString()})();`;
