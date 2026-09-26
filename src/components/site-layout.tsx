import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Mark } from "@/components/logo";
import { LANGS, LangProvider, useLang, type Lang } from "@/site/i18n";

const NAV = [
  { to: "/services", key: "services" },
  { to: "/comment-ca-marche", key: "how" },
  { to: "/entrepot", key: "warehouse" },
  { to: "/tarifs", key: "prices" },
  { to: "/faq", key: "faq" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <Frame>{children}</Frame>
    </LangProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [langs, setLangs] = useState(false);
  const [consent, setConsent] = useState<string | null>("pending");

  useEffect(() => {
    setConsent(localStorage.getItem("sp_consent"));
  }, []);

  function choose(value: "all" | "none" | "custom") {
    localStorage.setItem("sp_consent", value);
    setConsent(value);
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className="min-h-screen bg-canvas text-ink">
      <div className="bg-[#eef3ff] text-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <p className="text-muted">{t.banner}</p>
          <a href="/#vrai" className="font-semibold text-brand">
            {t.bannerLink}
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Mark className="h-8 w-8" />
            <span className="display text-base">SourcingPick</span>
          </Link>
          <nav className="ms-4 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-canvas hover:text-ink">
                {t[item.key]}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <div className="relative">
              <button className="btn btn-quiet hide-sm h-10 min-h-10 px-3" type="button" onClick={() => setLangs((v) => !v)}>
                {LANGS.find((l) => l.id === lang)?.label}
              </button>
              {langs ? (
                <ul className="absolute end-0 top-12 z-40 max-h-80 w-44 overflow-auto rounded-xl border border-line bg-paper p-1 shadow-card">
                  {LANGS.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-canvas"
                        onClick={() => {
                          setLang(l.id as Lang);
                          setLangs(false);
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Link to="/admin" className="btn btn-quiet hide-md h-10 min-h-10 px-3">
              {t.client}
            </Link>
            <Link to="/demande" className="btn btn-primary hide-sm h-10 min-h-10 px-3">
              {t.quote}
            </Link>
            <button className="btn btn-quiet btn-icon lg:hidden" type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-line bg-paper px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} className="rounded-xl px-3 py-3 text-sm font-semibold" onClick={() => setOpen(false)}>
                  {t[item.key]}
                </Link>
              ))}
              <Link to="/admin" className="rounded-xl px-3 py-3 text-sm font-semibold" onClick={() => setOpen(false)}>
                {t.client}
              </Link>
              <Link to="/demande" className="btn btn-primary mt-2" onClick={() => setOpen(false)}>
                {t.quote}
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <button key={l.id} type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => setLang(l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </header>
      {t.langNote ? <p className="bg-paper px-4 py-2 text-center text-xs text-muted">{t.langNote}</p> : null}
      <main>{children}</main>
      <footer className="mt-16 bg-sidebar text-[#d5def5]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold text-white">SourcingPick</p>
            <p className="mt-2 text-sm leading-relaxed text-[#b8c4e6]">
              Réception, contrôle, consolidation et expédition de vos marchandises, de Guangzhou vers l’Europe.
            </p>
            <a className="mt-3 inline-block text-sm text-white" href="mailto:contact@sourcingpick.com">
              contact@sourcingpick.com
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">Services</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Réception</li>
              <li>Vérification</li>
              <li>Consolidation</li>
              <li>Renforcement bois</li>
              <li>Chargement</li>
              <li>Expédition maritime</li>
              <li>Sourcing</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">Entreprise</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/a-propos" className="hover:text-white">À propos</Link></li>
              <li><Link to="/entrepot" className="hover:text-white">Notre entrepôt</Link></li>
              <li><a href="/#vrai" className="hover:text-white">Transparence</a></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/application" className="hover:text-white">Application</Link></li>
              <li><Link to="/stock" className="hover:text-white">Stock terrain</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gold uppercase">Légal</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/mentions" className="hover:text-white">Mentions légales</Link></li>
              <li><Link to="/confidentialite" className="hover:text-white">Confidentialité</Link></li>
              <li><button type="button" className="hover:text-white" onClick={() => setConsent(null)}>Cookies</button></li>
              <li><Link to="/cgv" className="hover:text-white">Conditions générales</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-[#9facd3]">
            <p>© 2026 SourcingPick · Hangzhou Qiyuan Ying Technology Information Co., Ltd. · Guangzhou</p>
            <p>12 langues</p>
          </div>
        </div>
      </footer>
      {consent == null ? (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-line bg-paper p-4 shadow-card">
          <p className="font-semibold">Nous déposons le strict nécessaire</p>
          <p className="mt-1 text-sm text-muted">
            Les cookies nécessaires font fonctionner le site. La mesure d’audience n’est pas encore active : aucun traceur publicitaire n’est chargé.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary h-10 min-h-10" type="button" onClick={() => choose("all")}>
              Tout accepter
            </button>
            <button className="btn btn-quiet h-10 min-h-10" type="button" onClick={() => choose("none")}>
              Tout refuser
            </button>
            <Link to="/cookies" className="btn btn-quiet h-10 min-h-10" onClick={() => choose("custom")}>
              Choisir
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SiteNotFound() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-24">
        <p className="mono text-sm text-brand">404</p>
        <h1 className="display mt-3 text-4xl">Ce colis s’est égaré.</h1>
        <p className="mt-3 text-muted">La page que vous cherchez n’existe pas ou a été déplacée.</p>
        <div className="mt-6 flex gap-2">
          <Link to="/" className="btn btn-primary">Retour à l’accueil</Link>
          <Link to="/demande" className="btn btn-quiet">Demander un devis</Link>
        </div>
      </section>
    </SiteLayout>
  );
}

export function PageIntro({ kicker, title, lead }: { kicker?: string; title: string; lead: string }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-12 pb-8">
      {kicker ? <p className="mono text-xs font-semibold tracking-wider text-brand uppercase">{kicker}</p> : null}
      <h1 className="display mt-2 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>
    </header>
  );
}
