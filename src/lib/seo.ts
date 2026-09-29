const ORIGIN = "https://sourcingpick.com";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  index: boolean;
};

export const SEO_PAGES: SeoPage[] = [
  {
    path: "/",
    title: "SourcingPick — Sourcing et logistique de Guangzhou vers l’Europe",
    description: "Entrepôt à Guangzhou, agents en Chine, contrôle photo, consolidation et expédition maritime. SourcingPick accompagne les importateurs, de la demande jusqu’à la livraison.",
    index: true,
  },
  {
    path: "/services",
    title: "Services de sourcing et de logistique — SourcingPick",
    description: "Réception, vérification, consolidation, renforcement bois, chargement et expédition depuis Guangzhou. Sourcing usine en option, avec devis avant toute commande.",
    index: true,
  },
  {
    path: "/comment-ca-marche",
    title: "Comment ça marche — SourcingPick",
    description: "Six étapes : votre demande, le devis, l’acompte, la réception à Guangzhou, le contrôle, puis le départ maritime. Chaque étape est visible dans votre espace.",
    index: true,
  },
  {
    path: "/entrepot",
    title: "Entrepôt de Guangzhou — SourcingPick",
    description: "Entrepôt de 200 m² à Guangzhou, district de Baiyun, exploité par Hangzhou Qiyuan Ying Technology Information Co., Ltd. Réception, photos et chargement sur place.",
    index: true,
  },
  {
    path: "/tarifs",
    title: "Tarifs sourcing et fret — SourcingPick",
    description: "Commission de 2 % sur la marchandise sourcée et 3 % sur le fret. Pas de forfait de recherche. Les autres prestations sont chiffrées sur devis.",
    index: true,
  },
  {
    path: "/faq",
    title: "Questions fréquentes — SourcingPick",
    description: "Particuliers, délais, dédouanement, groupage, stockage, contrôle, paiement et langues. Les réponses de SourcingPick, sans promesse que nous ne tenons pas.",
    index: true,
  },
  {
    path: "/demande",
    title: "Demander un devis — SourcingPick",
    description: "Décrivez vos marchandises, vos fournisseurs et la destination. SourcingPick vous répond avec un devis avant toute commande.",
    index: true,
  },
  {
    path: "/contact",
    title: "Contact — SourcingPick",
    description: "Écrivez à contact@sourcingpick.com ou déposez une demande. L’entrepôt est à Guangzhou, la société est à Hangzhou.",
    index: true,
  },
  {
    path: "/a-propos",
    title: "À propos — SourcingPick",
    description: "SourcingPick est la marque de Hangzhou Qiyuan Ying Technology Information Co., Ltd. Quatre techniciens, un entrepôt à Guangzhou, des documents dans votre espace.",
    index: true,
  },
  {
    path: "/application",
    title: "Espace client — SourcingPick",
    description: "Suivez demandes, devis, photos de contrôle et documents depuis l’espace client SourcingPick, en français, en anglais et en chinois.",
    index: true,
  },
  {
    path: "/marketplace",
    title: "Marketplace — lots en stock à Guangzhou — SourcingPick",
    description: "Lots déjà stockés dans l’entrepôt de Guangzhou. La propriété ne se transfère qu’après encaissement, selon les conditions générales.",
    index: true,
  },
  {
    path: "/encheres",
    title: "Enchères — SourcingPick",
    description: "Enchères sur des lots à Guangzhou. L’offre la plus haute à la clôture emporte la vente, de façon ferme, selon les conditions générales.",
    index: true,
  },
  {
    path: "/inscription",
    title: "Créer un compte client — SourcingPick",
    description: "Ouvrez un espace SourcingPick pour déposer une demande, suivre un devis et recevoir les photos de contrôle de vos marchandises.",
    index: true,
  },
  {
    path: "/connexion",
    title: "Connexion — SourcingPick",
    description: "Accès à l’espace client, agent ou administration SourcingPick.",
    index: false,
  },
  {
    path: "/mentions",
    title: "Mentions légales — SourcingPick",
    description: "Éditeur : Hangzhou Qiyuan Ying Technology Information Co., Ltd., code 91330110MAK784B049. Marque SourcingPick, contact@sourcingpick.com.",
    index: true,
  },
  {
    path: "/confidentialite",
    title: "Confidentialité — SourcingPick",
    description: "Quelles données SourcingPick collecte, dans quel but, combien de temps, et comment écrire à contact@sourcingpick.com pour y accéder.",
    index: true,
  },
  {
    path: "/cookies",
    title: "Cookies — SourcingPick",
    description: "Cookies de sourcingpick.com : session de connexion, mesure interne des visites, et ce que vous pouvez refuser depuis votre navigateur.",
    index: true,
  },
  {
    path: "/cgv",
    title: "Conditions générales — SourcingPick",
    description: "Conditions des services de sourcing, de logistique, des ventes, des enchères et des prestations informatiques SourcingPick.",
    index: true,
  },
];

export function pageSeo(path: string) {
  return SEO_PAGES.find((page) => page.path === path);
}

export function seoHead(path: string, extra?: { jsonLd?: unknown }) {
  const page = pageSeo(path);
  if (!page) throw new Error(`Page SEO inconnue : ${path}`);
  const url = page.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${page.path}`;
  const image = `${ORIGIN}/og.png`;
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "robots", content: page.index ? "index,follow,max-image-preview:large,max-snippet:-1" : "noindex,nofollow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SourcingPick" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: extra?.jsonLd
      ? [{ type: "application/ld+json", children: JSON.stringify(extra.jsonLd) }]
      : [],
  };
}

export const ORG_JSON = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${ORIGIN}/#org`,
      name: "SourcingPick",
      legalName: "Hangzhou Qiyuan Ying Technology Information Co., Ltd.",
      url: ORIGIN,
      email: "contact@sourcingpick.com",
      logo: `${ORIGIN}/apple-touch-icon.png`,
      identifier: "91330110MAK784B049",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Room 401, 4F, Building 3, No. 152 Haoyun Road, Liangzhu, Yuhang",
        addressLocality: "Hangzhou",
        addressRegion: "Zhejiang",
        addressCountry: "CN",
      },
      areaServed: ["FR", "EU", "AF"],
    },
    {
      "@type": "WebSite",
      "@id": `${ORIGIN}/#site`,
      url: ORIGIN,
      name: "SourcingPick",
      inLanguage: "fr",
      publisher: { "@id": `${ORIGIN}/#org` },
    },
  ],
};

export const FAQ_JSON = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    ["Vous êtes une nouvelle entreprise. Pourquoi vous faire confiance ?", "L’adresse de l’entrepôt est publique, chaque étape est photographiée et chaque document reste dans l’espace client."],
    ["Acceptez-vous les particuliers ?", "Oui. Les services visent d’abord les PME qui importent par conteneur, et aussi les particuliers pour un projet ponctuel."],
    ["Vers quels pays expédiez-vous ?", "Vers les pays desservis par les lignes maritimes au départ de Nansha, avec le plus d’expérience vers la France, l’Europe et l’Afrique francophone."],
    ["Quels sont les délais ?", "Comptez 2 à 3 mois entre la commande et la livraison. L’estimation précise figure dans le devis."],
    ["Gérez-vous le dédouanement à l’arrivée en Europe ?", "Sur mesure, avec notre transitaire ou le vôtre. Les droits de douane et la TVA à l’import restent à la charge du client."],
    ["Combien coûte le sourcing ?", "2 % sur la marchandise achetée pour vous, plus 3 % sur le fret. Pas de forfait de recherche."],
    ["Comment se passe le paiement ?", "Acompte de 40 % à la commande, solde avant le chargement du conteneur."],
  ].map(([name, text]) => ({
    "@type": "Question",
    name,
    acceptedAnswer: { "@type": "Answer", text },
  })),
};

export const SERVICE_JSON = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    "Réception à Guangzhou",
    "Vérification et photos",
    "Consolidation",
    "Renforcement bois",
    "Chargement conteneur",
    "Expédition maritime",
    "Sourcing usine",
  ].map((name, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name,
      provider: { "@id": `${ORIGIN}/#org` },
      areaServed: "Guangzhou",
      url: `${ORIGIN}/services`,
    },
  })),
};
