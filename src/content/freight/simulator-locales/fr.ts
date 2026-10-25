import type { FreightSimulatorCopy } from "../simulator";

export const fr: FreightSimulatorCopy = {
  eyebrow: "Simulateur de transport",
  title: "Combien coûterait votre envoi ?",
  intro:
    "Indiquez votre adresse et vos produits : nous calculons le poids volumétrique de chacun et appliquons la grille Europe de notre transporteur. Le prix détaillé vous est envoyé par e-mail.",
  mode: {
    label: "Mode de transport",
    names: { sea: "Bateau", air: "Avion", truck: "Camion", rail: "Train" },
    recommended: "Recommandé",
    discouraged: "Déconseillé",
    hints: {
      sea: "Le moins cher, et notre recommandation : 40 à 45 jours de bout en bout.",
      air: "Le plus rapide : 7 à 10 jours ouvrés. Pour un envoi petit ou urgent.",
      truck: "Plus risqué : nous le déconseillons. Environ 16 à 20 jours.",
      rail: "Nous le déconseillons aussi. 35 à 38 jours après le départ du train.",
    },
  },
  formula: {
    label: "Formule",
    names: { ddp: "Livré, taxes incluses", fob: "FOB", customs: "Jusqu’à la douane" },
    hints: {
      ddp: "Livré à votre adresse, droits et TVA d’importation compris (DDP).",
      fob: "Remis au port ou à l’aéroport de départ en Chine ; votre transitaire prend le relais. Prix sur devis.",
      customs: "Acheminé jusqu’à la douane d’arrivée ; vous dédouanez et récupérez la marchandise. Prix sur devis.",
    },
  },
  address: {
    title: "Adresse de livraison",
    street: "Adresse",
    postcode: "Code postal",
    city: "Ville",
    country: "Pays",
  },
  products: {
    title: "Vos produits",
    item: "Produit {n}",
    name: "Nom du produit",
    namePlaceholder: "Ex. : lampes de bureau",
    goods: "Type de marchandise",
    cartons: "Cartons",
    length: "Long. (cm)",
    width: "Larg. (cm)",
    height: "Haut. (cm)",
    weight: "Poids (kg)",
    cartonHint: "Dimensions et poids d’un carton.",
    units: "Nombre d’unités",
    battery: "Contient une batterie",
    reinforce: "Renforcer au bois",
    reinforceHint: "15 $ par m³, dans notre entrepôt de Guangzhou.",
    add: "+ Ajouter un produit",
    remove: "Retirer",
    summary: "{m3} · {volumetric} volumétriques",
    goodsReset: "La liste des marchandises dépend du mode : vérifiez le type de chaque produit.",
  },
  goods: {
    sea: {
      ordinary: "Marchandise ordinaire",
      kg1: "+1 RMB/kg : cuisine, luminaires, céramique, bois, outillage, caméras, drones…",
      kg3: "+3 RMB/kg : sacs, cuir, tissus, linge de lit, chaussettes, cosmétiques…",
      kg4: "+4 RMB/kg : vêtements, chaussures, sous-vêtements, maillots de bain…",
      phones: "Téléphones portables : +3 RMB par téléphone",
      scooters: "Trottinettes, tapis de course : +7,5 € l’unité",
      bikes: "Vélos : +75 € l’unité",
      refused: "Refusé : liquides, poudres, batteries seules, contrefaçons…",
    },
    air: {
      ordinary: "Marchandise ordinaire",
      kg1: "+1 RMB/kg : articles en bois, quincaillerie, métal, coques et câbles de téléphone…",
      kg2: "+2 RMB/kg : luminaires, céramique, cosmétiques, appareils de beauté, caméras, disques durs…",
      kg3: "+3 RMB/kg : jouets, cuir, textiles d’accompagnement",
      kg5: "+5 RMB/kg : montres, cigarettes électroniques sans liquide",
      kg7: "+7 RMB/kg : vêtements, chaussures, textiles, téléphones, ordinateurs, tablettes, drones",
      refused: "Refusé : liquides, poudres, batteries seules, contrefaçons…",
    },
    truck: {
      ordinary: "Marchandise ordinaire",
      kg1: "+1 RMB/kg : cuir, ustensiles de cuisine, luminaires LED, jouets, casques audio, produits Bluetooth…",
      kg2: "+2 RMB/kg : quincaillerie, appareils de beauté, dashcams, GPS, stylos, articles pour adultes…",
      kg3: "+3 RMB/kg : perruques, textiles (hors vêtements et chaussures)",
      kg4: "+4 RMB/kg : tablettes",
      kg5: "+5 RMB/kg : vêtements, chaussettes, pantalons, panneaux solaires, cigarettes électroniques jetables",
      kg8: "+8 RMB/kg : chaussures",
      pieces: "Montres, clés USB, consoles, cartes mémoire : +3 RMB la pièce",
      phones: "Téléphones portables : +8 RMB par téléphone",
      quote: "Lunettes, bagagerie, drones, robots aspirateurs, articles en bois… : sur devis",
      refused: "Refusé : liquides, poudres, batteries seules, contrefaçons…",
    },
    rail: {
      ordinary: "Marchandise ordinaire",
      kg1: "+1 RMB/kg : cuisine, luminaires, céramique, bois, outillage, caméras, drones…",
      kg2: "+2 RMB/kg : sacs, cuir, tissus, linge de lit, chaussettes, cosmétiques…",
      kg4: "+4 RMB/kg : vêtements, chaussures, sous-vêtements, maillots de bain…",
      phones: "Téléphones portables : +3 RMB par téléphone",
      scooters: "Trottinettes, tapis de course : +7,5 € l’unité",
      bikes: "Vélos : +75 € l’unité",
      refused: "Refusé : liquides, poudres, batteries seules, contrefaçons…",
    },
  },
  options: {
    declaration: "Déclaration d’export séparée",
    declarationHint: "350 RMB par expédition.",
    declarationHintSea: "350 RMB, +50 RMB par page au-delà de la première (5 produits par page).",
  },
  calc: {
    volumetric: "Poids volumétrique",
    formula: "L × l × h ÷ 6 000",
    bracket: "Tranche",
    billed: "facturé {kg} kg",
    volume: "Volume total : {m3}",
  },
  estimate: {
    title: "Votre estimation",
    delayLabel: "Délai",
    delays: {
      sea: "40 à 45 jours de bout en bout",
      air: "7 à 10 jours ouvrés",
      truck: "16 à 20 jours environ",
      rail: "35 à 38 jours après le départ",
    },
    surcharges: "S’ajoutent à votre envoi",
    oversize: "Colis hors normes : {n}",
    singleCarton: "Expédition d’un seul colis",
    battery: "Produits avec batterie",
    reinforcement: "Renforcement bois : {m3}",
    declaration: "Déclaration d’export séparée",
  },
  quote: {
    title: "Prix sur devis",
    reasons: {
      formula: "En FOB ou jusqu’à la douane, le prix se fait sur devis : nous vous répondons par e-mail.",
      country: "Ce mode ne livre pas ce pays en taxes incluses : le prix se fait sur devis.",
      air_battery:
        "Par avion, les produits avec batterie passent par une ligne réservée aux entrepôts Amazon et logistiques : le prix se fait sur devis.",
      too_many_products: "Au-delà de 5 produits différents, le prix se fait sur devis.",
      goods_quote: "Cette marchandise se chiffre sur devis.",
    },
  },
  warnings: {
    refusedGoods: "Une de vos marchandises n’est pas acceptée par ce mode de transport.",
    refusedCarton:
      "Un carton dépasse les limites (65 kg, 270 cm sur un côté, ou longueur + 2 × (largeur + hauteur) au-delà de 400 cm) : il doit être reconditionné.",
    noProducts: "Indiquez au moins un produit, avec ses cartons, leurs dimensions et leur poids.",
  },
  gate: {
    locked: "Le prix s’affiche après inscription",
    lockedQuote: "Prix sur devis : nous vous répondons par e-mail",
    points: [
      "Le prix détaillé, ligne par ligne, envoyé par e-mail",
      "Transport, suppléments, renforcement et notre commission de 3 %",
      "Votre estimation, prête à devenir un devis",
    ],
    name: "Nom et prénom",
    phone: "Téléphone (WhatsApp)",
    email: "Votre e-mail",
    emailPlaceholder: "vous@entreprise.com",
    cta: "Voir le prix",
    ctaQuote: "Recevoir mon devis",
    already: "J’ai déjà un compte",
    note: "Prix indicatifs, actualisation prochaine de la grille. Le prix ferme figure sur votre devis.",
    sending: "Envoi…",
    sent: "C’est envoyé à {email}. Créez maintenant votre compte pour retrouver vos devis.",
    sentQuote: "Demande reçue : nous vous répondons à {email}. Créez maintenant votre compte pour suivre vos devis.",
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
      "Le prix vient des grilles Europe de notre transporteur : bateau, avion, camion et train. Voici leurs règles, telles qu’elles s’appliquent à votre envoi.",
    sections: [
      {
        title: "Le poids facturable",
        text:
          "Chaque carton est facturé au plus élevé de trois poids : son poids réel, son poids volumétrique (longueur × largeur × hauteur en cm ÷ 6 000) et 12 kg. On additionne ensuite les cartons de tous vos produits.",
      },
      {
        title: "Les modes et leurs délais",
        text:
          "Bateau : 40 à 45 jours de bout en bout, le moins cher et notre recommandation. Avion : 7 à 10 jours ouvrés, pour un envoi petit ou urgent. Camion : 16 à 20 jours environ, plus risqué, nous le déconseillons. Train : 35 à 38 jours après le départ du train, nous le déconseillons aussi. C’est nous qui choisissons le transporteur de la dernière étape.",
      },
      {
        title: "Les tranches de poids",
        text:
          "Le prix au kilo baisse avec le poids total. Bateau : 21 à 70 kg, 71 à 299 kg, 300 kg et plus. Avion : 21 à 69 kg, 70 à 99 kg, 100 à 299 kg, 300 kg et plus. Camion : 30 à 70 kg, 71 à 100 kg, 101 à 499 kg, 500 kg et plus (300 kg et plus vers le Royaume-Uni). Train : 45 à 74 kg, 75 à 299 kg, 300 kg et plus. Une expédition est facturée au moins 21 kg en bateau et en avion, 30 kg en camion et 45 kg en train.",
      },
      {
        title: "Les formules",
        text:
          "Livré, taxes incluses (DDP) : livraison à votre adresse, droits et TVA d’importation compris ; au plus 5 produits différents par expédition en bateau, en avion et en train. FOB : la marchandise est remise au port ou à l’aéroport de départ en Chine, votre transitaire prend le relais. Jusqu’à la douane : nous l’acheminons jusqu’à la douane d’arrivée, vous la dédouanez et la récupérez. En FOB et jusqu’à la douane, le prix se fait sur devis.",
      },
      {
        title: "Les pays livrés",
        text:
          "Chaque mode livre sa propre liste de pays d’Europe ; le Royaume-Uni est livré en camion seulement. Si le mode choisi ne livre pas votre pays, le prix se fait sur devis.",
      },
      {
        title: "Les suppléments selon la marchandise",
        text:
          "Chaque mode a ses suppléments, au kilo facturable du produit concerné ou à l’unité ; la liste du formulaire change avec le mode et reprend les exemples de la grille. Bateau : +1, +3 ou +4 RMB/kg ; téléphones +3 RMB pièce, trottinettes et tapis de course +7,5 € l’unité, vélos +75 € l’unité. Train : +1, +2 ou +4 RMB/kg, et les mêmes suppléments à l’unité. Avion : +1, +2, +3, +5 ou +7 RMB/kg. Camion : de +1 à +8 RMB/kg ; montres, clés USB, consoles et cartes mémoire +3 RMB pièce, téléphones +8 RMB pièce ; lunettes, bagagerie, drones et articles en bois sur devis. Les suppléments se cumulent.",
      },
      {
        title: "Les produits avec batterie",
        text:
          "Acceptés en bateau et en train. En camion : +100 RMB par expédition. En avion, ils passent par une ligne au départ de Hong Kong réservée aux entrepôts Amazon et logistiques : le prix se fait sur devis.",
      },
      {
        title: "Les colis hors normes",
        text:
          "Refusés : plus de 65 kg, un côté de plus de 270 cm, ou longueur + 2 × (largeur + hauteur) au-delà de 400 cm. Par carton, le supplément le plus élevé s’applique : 130 RMB entre 30 et 40 kg, ou si le plus grand côté dépasse 100 cm ou le deuxième 76 cm ; 600 RMB au-delà de 40 kg ; 120 RMB si longueur + 2 × (largeur + hauteur) est entre 266 et 320 cm, 900 RMB entre 321 et 400 cm. Une expédition d’un seul colis : +80 RMB (+50 RMB en camion vers le Royaume-Uni).",
      },
      {
        title: "Le renforcement au bois",
        text:
          "Pour les marchandises fragiles, nous renforçons les cartons au bois dans notre entrepôt de Guangzhou : 15 $ par m³ du produit renforcé.",
      },
      {
        title: "La déclaration d’export séparée",
        text:
          "350 RMB par expédition ; en bateau, +50 RMB par page au-delà de la première (5 lignes par page). En camion, le dossier d’export est établi sans frais.",
      },
      {
        title: "Notre commission",
        text: "3 % sur l’ensemble de l’estimation : transport, suppléments et renforcement, sur une ligne à part de votre devis.",
      },
      {
        title: "Ce que le prix ne comprend pas",
        text:
          "Zones éloignées (supplément refacturé sur la facture du transporteur), changement d’adresse, frais de contrôle douanier, assurance, et nos autres prestations d’entrepôt à Guangzhou (réception, vérification, chargement), chiffrées sur votre devis.",
      },
      {
        title: "Les marchandises refusées",
        text:
          "Liquides, poudres, contrefaçons, batteries seules, batteries externes, gyroroues, tabac, denrées alimentaires, médicaments, produits corrosifs, inflammables ou explosifs, armes. Une marchandise sensible découverte au contrôle avant l’export coûte 3 000 RMB d’amende, le retour et 8 RMB/kg de manutention.",
      },
      {
        title: "L’emballage",
        text:
          "Tous les produits portent la mention MADE IN CHINA ; les textiles, le cuir, les bagages et les chaussures, une étiquette de composition et d’entretien. Évitez le ruban adhésif jaune.",
      },
      {
        title: "En cas de perte",
        text:
          "Bateau et train : perte ou blocage en douane indemnisé sur la valeur déclarée, dans la limite de 20 RMB par kilo, sans remboursement du transport ; les dommages ne sont pas indemnisés. Avion et camion : 40 RMB par kilo en cas de perte avant la prise en charge par UPS ou de saisie en douane, puis les règles d’UPS, dans la limite de 100 USD par expédition. Pour une marchandise de valeur, prévoyez une assurance.",
      },
    ],
  },
  email: {
    sep: " : ",
    subject: "Votre estimation de transport : {total}",
    subjectQuote: "Votre demande de devis de transport",
    heading: "Votre estimation SourcingPick",
    headingQuote: "Votre demande de devis SourcingPick",
    intro: "Voici le détail de votre envoi, calculé avec la grille Europe de notre transporteur et toutes ses règles.",
    introQuote: "Nous avons bien reçu votre demande. Voici ce que vous nous avez indiqué ; nous revenons vers vous avec un devis.",
    summary: {
      mode: "Mode",
      formula: "Formule",
      address: "Adresse de livraison",
      cartons: "Cartons",
      real: "Poids réel",
      volumetric: "Poids volumétrique",
      chargeable: "Poids facturable",
      bracket: "Tranche et tarif",
      delay: "Délai",
    },
    productsTitle: "Vos produits",
    product: "{name} : {cartons} cartons · {m3} · {chargeable} facturables",
    items: {
      freight: "Transport ({kg} kg × {rate} RMB/kg)",
      goods: "Supplément marchandise, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product} : {units} × {rate} RMB",
      units: "{product} : {units} × {rate} €",
      singleCarton: "Expédition d’un seul colis",
      oversize: "Colis hors normes ({cartons} cartons)",
      battery: "Produits avec batterie",
      declaration: "Déclaration d’export séparée ({pages} page(s))",
      reinforcement: "Renforcement bois ({m3} m³ × {rate} $)",
    },
    subtotal: "Sous-total",
    commission: "Commission SourcingPick (3 %)",
    total: "Total estimé",
    notIncludedTitle: "Non compris",
    notIncluded: [
      "Zones éloignées, changement d’adresse, frais de contrôle douanier",
      "Assurance",
      "Nos autres prestations d’entrepôt à Guangzhou (réception, vérification, chargement), chiffrées sur votre devis",
    ],
    disclaimer:
      "Prix indicatif, établi avec la grille actuelle de notre transporteur (actualisation prochaine). Le prix ferme figure sur votre devis.",
    quoteNext: "Nous revenons vers vous avec un devis détaillé.",
    signup: "Créez votre compte SourcingPick pour suivre vos devis :",
    signupCta: "Créer mon compte",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
