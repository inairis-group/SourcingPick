import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The React Compiler correctness rules (bundled by eslint-config-next at
    // error severity) guard against bugs that only manifest once the React
    // Compiler's memoization is enabled — and it is NOT enabled in this
    // project (no `reactCompiler` in next.config, no babel plugin). Until we
    // turn the compiler on, these are advisory: keep them visible as
    // warnings rather than failing CI on patterns that are safe today
    // (server-component `Date.now()`, mount-hydration `setState` in effects,
    // `document.cookie` writes in event handlers, etc.). Revisit + fix +
    // re-escalate to "error" when/if we adopt the React Compiler.
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
  {
    // PDF templates render through @react-pdf/renderer, NOT the DOM. Its
    // <Text> primitive writes raw string content into a PDF buffer and does
    // not HTML-decode entities — so `react/no-unescaped-entities` is actively
    // harmful here: "&apos;" would print literally instead of an apostrophe.
    // The French copy in these templates is full of apostrophes (l'usine,
    // jusqu'au), so disable the DOM-only rule for the PDF files.
    files: ["src/lib/**/pdf.tsx"],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Every image on the ported marketing site is an SVG illustration drawn
    // in the canvas. `next/image` does not optimise SVG — it would add a
    // wrapper, a layout pass and a loader round-trip for no smaller byte —
    // and these files are generated, so a suppression comment would be
    // rewritten on the next re-port anyway.
    //
    // The same goes for the links to the client area (`/connexion`,
    // `/inscription`): that area is another application on the same host, so
    // they are plain anchors on purpose. The rule reads them as pages of this
    // app — `/[lang]` accepts any single word — and asks for `<Link />`, which
    // would try to resolve them in this router.
    files: ["**/_design/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tests run under node:test via tsx; not part of the app lint surface.
    "tests/**",
    // Static assets — incl. the service worker (worker globals, not the app
    // lint surface).
    "public/**",
  ]),
]);

export default eslintConfig;
