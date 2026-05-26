/**
 * Inlined into the document <head>. Two jobs:
 *
 *   1. Reconcile the cookie + localStorage. If a legacy client has
 *      localStorage but no cookie (or the cookie was cleared), seed the
 *      cookie so the next server render gets the right className.
 *   2. Apply the theme class to <html> as a belt-and-braces defence
 *      against the rare race where the cookie is unread (e.g. private
 *      windows that don't replay cookies on the same request).
 *
 * Uses a plain <script dangerouslySetInnerHTML> tag in <head>. React 19
 * supports inline scripts in <head> — that's the canonical pattern for
 * pre-hydration theme code (next-themes, etc.). next/script with
 * `beforeInteractive` triggered the "scripts inside React components are
 * never executed" warning under Next 16 + React 19 even though it works.
 */
const SCRIPT = `(function(){
  try {
    var k='sp_theme';
    var t=localStorage.getItem(k);
    var ck=(document.cookie.match(/(?:^|; )sp_theme=([^;]+)/)||[])[1];
    var cls=document.documentElement.classList;
    // Default is 'light' — first-time visitors should NOT inherit OS dark
    // mode. Dark is opt-in via the toggle. Only an explicit pick (cookie
    // or legacy localStorage) overrides this default.
    var pick=ck||t||'light';
    if(pick==='dark'){ if(!cls.contains('dark')) cls.add('dark'); cls.remove('light'); }
    else { if(!cls.contains('light')) cls.add('light'); cls.remove('dark'); }
    if(t && !ck){ document.cookie=k+'='+t+'; path=/; max-age=31536000; samesite=lax'; }
  } catch(e) {}
})();`;

export function ThemeScript() {
  return (
    <script
      id="sp-theme-init"
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
