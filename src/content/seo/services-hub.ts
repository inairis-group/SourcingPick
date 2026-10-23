/**
 * /services in French, as the 2026-10 SEO pack rewrites it
 * (03_Contenus_Pages_Services_SEO/01_Page_Hub_Services_Generale.md): the same
 * six operations and the sourcing option, each with richer wording and a link
 * to its own page. Inline Markdown (**bold**, *italic*, links).
 *
 * The step headings drop the pack's "Étape N —": the card already says
 * "Étape N/6" right above. Straight apostrophes are the site's typographic
 * ones.
 */

export type HubStep = {
  title: string;
  lead: string;
  weDo: string[];
  youGet: string[];
  more?: { href: string; label: string };
};

export const SERVICES_HUB = {
  h1: "Six opérations logistiques à Guangzhou (Baiyun), une trace photo et vidéo pour chacune",
  lead:
    "Entre l’usine chinoise et le navire, vos marchandises passent par notre **entrepôt de 200 m² situé dans le district de Baiyun, à Guangzhou**. Voici exactement ce que notre équipe de quatre techniciens y réalise, et les preuves visuelles que vous recevez dans votre espace client à chaque étape.",
  steps: [
    {
      title: "Réception et stockage de vos livraisons à Guangzhou (Baiyun)",
      lead:
        "Vos fournisseurs (usines en direct, commandes Alibaba ou 1688) livrent directement à notre quai de réception à Baiyun, du lundi au samedi de 9 h à 18 h (heure de Chine).",
      weDo: [
        "Attribution d’un **code client unique** à faire inscrire par vos fournisseurs sur chaque carton.",
        "Réception des livraisons de vos différents fournisseurs (par camion dédié ou transporteurs express domestiques tels que SF Express ou Deppon).",
        "Enregistrement immédiat de chaque lot : **nombre exact de colis, poids brut, dimensions (calcul du volume en m³ / CBM) et état extérieur des cartons**.",
        "Signalement immédiat en cas de colis manquant, humide ou abîmé pendant le transport interne en Chine.",
      ],
      youGet: [
        "**Photos horodatées de chaque livraison** dès son arrivée dans votre espace client.",
        "**Stockage tampon en attendant le chargement :** 1 jour ouvré inclus après réception, puis au tarif indiqué clairement sur votre devis.",
      ],
    },
    {
      title: "Vérification et contrôle qualité sur mesure avant expédition",
      lead:
        "Nous contrôlons exactement ce que vous nous demandez de contrôler dans notre entrepôt de Guangzhou, **avant que la marchandise ne quitte la Chine**.",
      weDo: [
        "Ouverture d’un échantillon représentatif ou de **100 % des cartons**, selon vos consignes d’inspection.",
        "Comptage précis des quantités livrées et contrôle visuel des produits (conformité au bon de commande, coloris, finitions, absence de casse).",
        "Vérification des étiquettes réglementaires (marquage CE, étiquetage d’origine, codes-barres) et du marquage des cartons.",
      ],
      youGet: [
        "**Photos haute définition et vidéo complète du contrôle** accessibles dans votre espace client.",
        "**Signalement immédiat des écarts avant le chargement :** si un produit est non conforme, il est encore à Guangzhou, ce qui vous permet d’exiger un remplacement ou un avoir auprès de votre fournisseur avant l’exportation.",
      ],
      more: {
        href: "/services/controle-qualite-chine",
        label: "En savoir plus sur notre service de contrôle qualité et vérification à Guangzhou",
      },
    },
    {
      title: "Consolidation multi-fournisseurs et préparation au groupage",
      lead:
        "Plusieurs fournisseurs en Chine, **un seul envoi maritime, un seul dossier d’exportation et un seul suivi**.",
      weDo: [
        "Regroupement physique dans notre entrepôt de Baiyun des livraisons provenant de tous vos fournisseurs chinois.",
        "Palettisation aux normes export et filmage étirable renforcé des colis.",
        "Calcul et préparation du plan de chargement pour **optimiser chaque m³ (CBM)** du conteneur ou de votre lot de groupage.",
      ],
      youGet: [
        "**Un seul conteneur (ou lot consolidé) à suivre** et un seul connaissement maritime (*Bill of Lading*) au lieu de payer des frais fixes pour chaque usine.",
        "**Liste de colisage consolidée (*Packing List*)** et documents d’exportation unifiés dans votre espace client.",
      ],
      more: {
        href: "/services/consolidation-entrepot-chine",
        label: "Découvrir comment fonctionne la consolidation en entrepôt à Guangzhou",
      },
    },
    {
      title: "Renforcement et caisses en bois sur mesure (norme NIMP 15)",
      lead:
        "Pour les marchandises lourdes, fragiles (mobilier, verrerie, équipements, machines) ou les expéditions en groupage, les cartons d’usine ne suffisent pas à supporter un mois de mer. Nous renforçons l’emballage dans notre atelier avant le départ.",
      weDo: [
        "Fabrication sur place de **caisses en bois sur mesure** adaptées aux dimensions exactes de vos palettes ou produits.",
        "Cerclage haute résistance, cornières de protection et calage interne des colis.",
        "Utilisation exclusive de **bois traité et tamponné selon la norme phytosanitaire internationale NIMP 15 (ISPM 15)**, obligatoire pour éviter tout blocage douanier en Europe et à l’international.",
      ],
      youGet: [
        "**Photos des caisses en bois fermées et marquées** avant le chargement.",
        "**Transparence tarifaire :** le coût de chaque caisse apparaît sur une ligne séparée de votre devis.",
      ],
      more: {
        href: "/services/caisses-bois-nimp15-chine",
        label: "En savoir plus sur nos caisses en bois NIMP 15 et le chargement conteneur",
      },
    },
    {
      title: "Chargement et empotage du conteneur par notre équipe",
      lead:
        "Votre conteneur (20 pieds, 40 pieds Dry ou 40 pieds High Cube) est **chargé directement par nos quatre techniciens à Baiyun**, jamais sous-traité à un intermédiaire inconnu.",
      weDo: [
        "Empotage méthodique du conteneur par nos techniciens (répartition des charges lourdes au sol, marchandises fragiles en hauteur, calage et sanglage).",
        "Prise de photos continues, **du premier carton posé jusqu’à la fermeture des portes et la pose du scellé (plomb)**.",
        "Relevé officiel du numéro de conteneur et du numéro de scellé maritime.",
      ],
      youGet: [
        "**La vidéo complète du chargement** et le reportage photo dans votre espace client.",
        "**Le numéro de conteneur** pour suivre votre expédition en temps réel.",
      ],
    },
    {
      title: "Expédition maritime depuis le port de Nansha (Guangzhou)",
      lead:
        "Départ direct depuis le **port en eau profonde de Nansha (Guangzhou)** vers la France, l’Europe, l’Afrique francophone et l’international.",
      weDo: [
        "Réservation de l’espace (booking) sur le navire au départ de Nansha, au prix réel du marché (notre commission est fixe : **3 % sur le fret**).",
        "Établissement et validation des documents d’exportation chinois et du *Bill of Lading* (B/L).",
        "Suivi du conteneur en mer jusqu’au port d’arrivée.",
        "**Dédouanement à l’arrivée (en option sur mesure) :** selon ce qui vous arrange, nous confions le dédouanement import à notre transitaire partenaire ou nous transmettons l’ensemble des documents au vôtre.",
      ],
      youGet: [
        "Les statuts **« Expédié »** puis **« En transit »** mis à jour dans votre espace client.",
        "Le lien de suivi maritime direct de la compagnie de navigation et tous vos documents téléchargeables au même endroit.",
      ],
      more: {
        href: "/services/transport-maritime-nansha",
        label: "En savoir plus sur le fret maritime depuis le port de Nansha",
      },
    },
  ] satisfies HubStep[],
  sourcing: {
    title: "Agent de sourcing : nous trouvons et négocions votre usine en Chine",
    lead:
      "Si vous n’avez pas encore de fournisseur en Chine, nos agents basés à Guangzhou s’en chargent. **Vous gardez la main et validez chaque étape avant toute commande.**",
    steps: [
      {
        title: "Recherche d’usines",
        text: "Nous identifions les fabricants réels (et non les simples sociétés commerciales) qui produisent votre cahier des charges en Chine.",
      },
      {
        title: "Comparaison détaillée",
        text: "Prix unitaire EXW, quantités minimales de commande (MOQ), délais de fabrication et échantillons : nous mettons plusieurs offres en concurrence.",
      },
      {
        title: "Négociation en mandarin",
        text: "Nous négocions directement avec les usines les tarifs et les conditions de qualité.",
      },
      {
        title: "Devis clair (commission unique de 2 %)",
        text: "Vous recevez un devis détaillé ligne par ligne. Aucun forfait de recherche, aucun frais de dossier : notre rémunération est de **2 % sur la marchandise que nous achetons pour vous**.",
      },
    ],
    more: {
      href: "/services/agent-sourcing-chine",
      label: "Découvrir notre service d’agent de sourcing à Guangzhou (commission 2 %)",
    },
  },
} as const;
