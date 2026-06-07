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
 * React 19 inline-script pattern: `dangerouslySetInnerHTML`. Children
 * triggers the "Encountered a script tag while rendering React
 * component. Scripts inside React components are never executed when
 * rendering on the client" warning, because React treats children as
 * serialised text data (no execution semantics) — exactly what you'd
 * want for embedding raw JSON. `dangerouslySetInnerHTML` is the
 * documented escape hatch that tells React "this is markup, render it
 * as a real `<script>`, the browser executes it on parse." The script
 * still runs once on initial document parse — there is no client-side
 * re-execution but we don't want one anyway (theme init runs once).
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
