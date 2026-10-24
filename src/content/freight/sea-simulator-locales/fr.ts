import type { SeaSimulatorCopy } from "../sea-simulator";

export const fr: SeaSimulatorCopy = {
  eyebrow: "Estimer mon envoi",
  title: "Combien coûterait votre envoi par bateau ?",
  intro:
    "Indiquez vos cartons : nous calculons le poids facturable et appliquons, ligne par ligne, la grille maritime Europe de notre transporteur. Le prix détaillé vous est envoyé par e-mail.",
  regime: {
    label: "Dédouanement",
    ddp: "Taxes incluses",
    ddpHint: "Droits et TVA d’importation compris dans le prix.",
    vat: "Sous votre numéro de TVA",
    vatHint: "TVA autoliquidée : numéro de TVA et EORI valides requis.",
  },
  deliverTo: {
    label: "Livraison",
    amazon: "Entrepôt Amazon",
    other: "Autre adresse",
    thirdParty: "Entrepôt logistique",
  },
  warehouse: { label: "Entrepôt", byCountry: "Un autre entrepôt Amazon (par pays)" },
  country: "Pays de livraison",
  carrier: {
    label: "Transporteur",
    truck: "Camion jusqu’à l’entrepôt",
    upsDpd: "UPS ou DPD, choisi par nous",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Type de marchandise",
    ordinary: "Marchandise ordinaire",
    plus1: "Cuisine, luminaires, bois, outillage, high-tech…",
    plus3: "Textiles, sacs, cuir, cosmétiques…",
    plus4: "Vêtements, chaussures, sous-vêtements…",
    refused: "Liquides, poudres, batteries seules…",
    hint: "Le détail de chaque catégorie est plus bas, dans « Comment nous calculons votre tarif ».",
  },
  units: {
    label: "Produits comptés à l’unité",
    phones: "Téléphones",
    scooters: "Trottinettes, tapis de course",
    bikes: "Vélos",
  },
  cartons: {
    title: "Vos cartons",
    line: "Lot {n}",
    quantity: "Cartons",
    length: "Long. (cm)",
    width: "Larg. (cm)",
    height: "Haut. (cm)",
    weight: "Poids (kg)",
    add: "+ Ajouter un lot",
    remove: "Retirer",
  },
  designations: { label: "Références de produits", hint: "Nombre de produits différents déclarés." },
  options: {
    declaration: "Déclaration d’export séparée",
    declarationHint: "350 RMB, +50 RMB par page au-delà de la première.",
    signature: "Signature à la livraison",
    signatureHint: "Livraisons UPS : 30 RMB par colis.",
  },
  calc: {
    title: "Comment c’est calculé",
    real: "Poids réel",
    volumetric: "Poids volumétrique",
    formula: "L × l × h ÷ 6 000",
    chargeable: "Poids facturable",
    chargeableHint: "Carton par carton, le plus élevé des trois",
    bracket: "Tranche",
    billed: "facturé {kg} kg",
    volume: "Volume total : {m3}",
    cartons: "{n} cartons",
  },
  estimate: {
    title: "Votre estimation",
    mode: "Bateau · Chine → Europe",
    delayLabel: "Délai",
    delay: "40 à 45 jours de bout en bout",
    surcharges: "S’ajoutent à votre envoi",
    oversize: "Colis hors normes : {n}",
    singleCarton: "Expédition d’un seul colis",
    nonAmazon: "Adresse hors Amazon",
    vatClearance: "Dédouanement sous votre TVA",
  },
  warnings: {
    refusedGoods: "Cette marchandise n’est pas acceptée par voie maritime.",
    refusedCarton:
      "Un carton dépasse les limites (65 kg, 270 cm sur un côté, ou longueur + 2 × (largeur + hauteur) au-delà de 400 cm) : il doit être reconditionné.",
    tooManyDesignations: "En taxes incluses, une expédition compte au plus 5 références : au-delà, nous établissons un devis.",
    noCartons: "Indiquez au moins un carton, avec ses dimensions et son poids.",
  },
  gate: {
    locked: "Le prix s’affiche après inscription",
    points: [
      "Le prix détaillé, ligne par ligne, envoyé par e-mail",
      "Fret, suppléments et notre commission de 3 %",
      "Votre estimation, prête à devenir un devis",
    ],
    email: "Votre e-mail",
    emailPlaceholder: "vous@entreprise.com",
    cta: "Voir le prix",
    already: "J’ai déjà un compte",
    note: "Prix indicatifs, actualisation prochaine de la grille. Le prix ferme figure sur votre devis.",
    sending: "Envoi…",
    sent: "C’est envoyé à {email}. Créez maintenant votre compte pour retrouver vos devis.",
    errors: {
      invalid_email: "Cette adresse e-mail ne semble pas valide.",
      rate_limited: "Trop de demandes depuis cette connexion. Réessayez dans une heure.",
      failed: "L’envoi n’a pas pu se faire. Écrivez-nous sur WhatsApp ou à contact@sourcingpick.com.",
      invalid: "Vérifiez les champs : il manque une information pour calculer le prix.",
    },
  },
  rules: {
    title: "Comment nous calculons votre tarif",
    intro:
      "Le prix vient de la grille maritime Europe de notre transporteur (compagnies EMC et COSCO). Voici toutes ses règles, telles qu’elles s’appliquent à votre envoi.",
    sections: [
      {
        title: "Le poids facturable",
        text:
          "Chaque carton est facturé au plus élevé de trois poids : son poids réel, son poids volumétrique (longueur × largeur × hauteur en cm ÷ 6 000) et un minimum de 12 kg par carton (10 kg pour les entrepôts Amazon livrés par camion, en taxes incluses). On additionne ensuite les cartons.",
      },
      {
        title: "Les tranches de poids",
        text:
          "Le prix au kilo baisse avec le poids total : 21 à 70 kg, 71 à 299 kg, 300 kg et plus. Une expédition est facturée au moins 21 kg, et au moins 71 kg sur les lignes camion qui commencent à 71 kg.",
      },
      {
        title: "Taxes incluses ou sous votre TVA",
        text:
          "Taxes incluses : droits et TVA d’importation sont compris dans le prix, au plus 5 références de produits par expédition. Sous votre numéro de TVA : vous fournissez un numéro de TVA et un EORI valides, la TVA d’importation est autoliquidée ; 380 RMB de frais de dédouanement par expédition, droits et taxes refacturés au réel, 30 RMB par référence au-delà de 5. En cas de contrôle douanier : 900 € de manutention répartis entre les lots du conteneur, et 3 € par palette et par jour de stockage.",
      },
      {
        title: "La destination",
        text:
          "Entrepôts Amazon livrés par camion, livraison par UPS ou DPD (transporteur choisi par nous) en Allemagne, en France, en Italie et en Espagne, ou par UPS dans 23 pays. Une adresse qui n’est pas un entrepôt Amazon (particulier, entreprise) : +1 RMB par kilo, minimum 100 RMB pour une expédition d’un seul colis.",
      },
      {
        title: "Les suppléments selon la marchandise",
        text:
          "+1 RMB/kg : ustensiles de cuisine, luminaires, céramiques, accessoires auto et vélo, articles en bois ou en bambou, stylos, tentes, outillage, caméras, dashcams, appareils de beauté, lecteurs multimédias, robots aspirateurs, vidéoprojecteurs, disques durs, lampes solaires, parapluies, perruques, valises, drones, clés USB… +3 RMB/kg : articles pour adultes, cosmétiques, fournitures pour l’habillement, chaussettes, bonnets, gants, linge de lit, tissus, sacs, cuir. +4 RMB/kg : vêtements, chaussures, sous-vêtements, maillots de bain et tous les textiles portés. À l’unité : téléphones +3 RMB, trottinettes et tapis de course +7,5 €, vélos +75 €. Les suppléments se cumulent.",
      },
      {
        title: "Les colis hors normes",
        text:
          "Refusés : plus de 65 kg, un côté de plus de 270 cm, ou longueur + 2 × (largeur + hauteur) au-delà de 400 cm. Par carton, le supplément le plus élevé s’applique : 130 RMB entre 30 et 40 kg, ou si le plus grand côté dépasse 100 cm ou le deuxième 76 cm ; 600 RMB au-delà de 40 kg ; 120 RMB si longueur + 2 × (largeur + hauteur) est entre 266 et 320 cm, 900 RMB entre 321 et 400 cm. Une expédition d’un seul colis : +80 RMB.",
      },
      {
        title: "Les options",
        text:
          "Déclaration d’export séparée : 350 RMB, +50 RMB par page au-delà de la première (5 lignes par page). Signature à la livraison pour UPS : 30 RMB par colis. Transporteur imposé : +1 RMB par kilo (+0,5 RMB pour DHL sur la ligne QOT Express).",
      },
      {
        title: "Les délais",
        text:
          "Clôture le vendredi, départ le mercredi. Enlèvement environ 38 à 42 jours après le départ du navire ; 40 à 45 jours de bout en bout.",
      },
      {
        title: "Notre commission",
        text: "3 % sur le fret que nous vous refacturons, sur une ligne à part de votre devis.",
      },
      {
        title: "Ce que le prix ne comprend pas",
        text:
          "Zones éloignées (supplément refacturé sur la facture du transporteur), changement d’adresse, frais de contrôle douanier, TVA et droits sous votre numéro de TVA, assurance, et nos prestations d’entrepôt à Guangzhou (réception, vérification, renforcement, chargement), chiffrées sur votre devis.",
      },
      {
        title: "Les marchandises refusées",
        text:
          "Liquides, poudres, contrefaçons, batteries seules, batteries externes, gyroroues, tabac, denrées alimentaires, médicaments, produits corrosifs, inflammables ou explosifs, armes. Les produits avec batteries intégrées et les produits magnétiques sont acceptés. Une marchandise sensible découverte au contrôle avant l’export coûte 3 000 RMB d’amende, le retour et 8 RMB/kg de manutention.",
      },
      {
        title: "L’emballage",
        text:
          "Tous les produits portent la mention MADE IN CHINA ; les textiles, le cuir, les bagages et les chaussures, une étiquette de composition et d’entretien. Pour Amazon : deux étiquettes code-barres d’entrée en entrepôt sur chaque carton, étiquettes SKU et FBA protégées par du ruban transparent. Évitez le ruban adhésif jaune.",
      },
      {
        title: "En cas de perte",
        text:
          "Perte ou blocage en douane : indemnisation sur la valeur déclarée, dans la limite de 20 RMB par kilo, sans remboursement du fret. Les dommages ne sont pas indemnisés : pour une marchandise de valeur, prévoyez une assurance.",
      },
    ],
  },
  email: {
    sep: " : ",
    subject: "Votre estimation de fret maritime : {total}",
    heading: "Votre estimation Sourcing Pick",
    intro:
      "Voici le détail de votre envoi par bateau, calculé avec la grille maritime Europe de notre transporteur et toutes ses règles.",
    summary: {
      regime: "Dédouanement",
      delivery: "Livraison",
      cartons: "Cartons",
      real: "Poids réel",
      volumetric: "Poids volumétrique",
      chargeable: "Poids facturable",
      bracket: "Tranche et tarif",
      delay: "Délai",
    },
    items: {
      freight: "Fret maritime ({kg} kg × {rate} RMB/kg)",
      goods: "Supplément marchandise ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Adresse hors Amazon (+1 RMB/kg, minimum 100 RMB pour un seul colis)",
      singleCarton: "Expédition d’un seul colis",
      oversize: "Colis hors normes ({cartons} cartons)",
      phones: "Téléphones ({units} × 3 RMB)",
      vatClearance: "Dédouanement sous votre numéro de TVA",
      declaration: "Déclaration d’export séparée ({pages} page(s))",
      designations: "Références au-delà de 5 ({extra} × 30 RMB)",
      signature: "Signature à la livraison UPS ({cartons} × 30 RMB)",
      scooters: "Trottinettes et tapis de course ({units} × 7,5 €)",
      bikes: "Vélos ({units} × 75 €)",
    },
    subtotal: "Sous-total transport",
    commission: "Commission Sourcing Pick (3 % du fret)",
    total: "Total estimé",
    notIncludedTitle: "Non compris",
    notIncluded: [
      "Zones éloignées, changement d’adresse, frais de contrôle douanier",
      "TVA et droits d’importation sous votre numéro de TVA",
      "Assurance",
      "Nos prestations d’entrepôt à Guangzhou (réception, vérification, renforcement, chargement), chiffrées sur votre devis",
    ],
    disclaimer:
      "Prix indicatif, établi avec la grille actuelle de notre transporteur (actualisation prochaine). Le prix ferme figure sur votre devis.",
    signup: "Créez votre compte Sourcing Pick pour transformer cette estimation en devis :",
    signupCta: "Créer mon compte",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
