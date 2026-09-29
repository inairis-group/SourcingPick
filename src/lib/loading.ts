let timer = 0;

export function armLoadingBar() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    document.documentElement.dataset.spLoad = "1";
  }, 120);
}

export function clearLoadingBar() {
  window.clearTimeout(timer);
  delete document.documentElement.dataset.spLoad;
}
