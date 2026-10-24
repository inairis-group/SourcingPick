import type { SeaSimulatorCopy } from "../sea-simulator";

export const nl: SeaSimulatorCopy = {
  eyebrow: "Mijn zending schatten",
  title: "Wat zou uw zending per schip kosten?",
  intro:
    "Voer uw dozen in: wij berekenen het belastbare gewicht en passen regel voor regel de Europese zeevrachttabel van onze vervoerder toe. De gedetailleerde prijs ontvangt u per e-mail.",
  regime: {
    label: "Inklaring",
    ddp: "Inclusief belastingen",
    ddpHint: "Invoerrechten en invoer-btw zijn bij de prijs inbegrepen.",
    vat: "Op uw btw-nummer",
    vatHint: "Btw verlegd: een geldig btw-nummer en EORI-nummer zijn vereist.",
  },
  deliverTo: {
    label: "Levering",
    amazon: "Amazon-magazijn",
    other: "Ander adres",
    thirdParty: "Logistiek magazijn",
  },
  warehouse: { label: "Magazijn", byCountry: "Een ander Amazon-magazijn (per land)" },
  country: "Land van levering",
  carrier: {
    label: "Vervoerder",
    truck: "Vrachtwagen tot magazijn",
    upsDpd: "UPS of DPD (onze keuze)",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Soort goederen",
    ordinary: "Gewone goederen",
    plus1: "Keukengerei, verlichting, hout, gereedschap, hightech…",
    plus3: "Textiel, tassen, leer, cosmetica…",
    plus4: "Kleding, schoenen, ondergoed…",
    refused: "Vloeistoffen, poeders, losse batterijen…",
    hint: "Wat onder elke categorie valt, leest u hieronder bij ‘Hoe wij uw tarief berekenen’.",
  },
  units: {
    label: "Per stuk getelde producten",
    phones: "Telefoons",
    scooters: "Steps, loopbanden",
    bikes: "Fietsen",
  },
  cartons: {
    title: "Uw dozen",
    line: "Partij {n}",
    quantity: "Dozen",
    length: "L (cm)",
    width: "B (cm)",
    height: "H (cm)",
    weight: "Gew. (kg)",
    add: "+ Partij toevoegen",
    remove: "Verwijderen",
  },
  designations: { label: "Aantal referenties", hint: "Verschillende producten in de aangifte." },
  options: {
    declaration: "Aparte exportaangifte",
    declarationHint: "350 RMB, +50 RMB per pagina na de eerste.",
    signature: "Handtekening bij levering",
    signatureHint: "UPS-leveringen: 30 RMB per pakket.",
  },
  calc: {
    title: "Zo wordt het berekend",
    real: "Werkelijk gewicht",
    volumetric: "Volumegewicht",
    formula: "L × B × H ÷ 6.000",
    chargeable: "Belastbaar gewicht",
    chargeableHint: "Per doos, het hoogste van de drie",
    bracket: "Staffel",
    billed: "{kg} kg gefactureerd",
    volume: "Totaal volume: {m3}",
    cartons: "{n} dozen",
  },
  estimate: {
    title: "Uw schatting",
    mode: "Schip · China → Europa",
    delayLabel: "Levertijd",
    delay: "40 tot 45 dagen van begin tot eind",
    surcharges: "Toeslagen op uw zending",
    oversize: "Pakketten buiten de norm: {n}",
    singleCarton: "Zending van één pakket",
    nonAmazon: "Niet-Amazon-adres",
    vatClearance: "Inklaring op uw btw-nummer",
  },
  warnings: {
    refusedGoods: "Deze goederen worden niet geaccepteerd voor zeevracht.",
    refusedCarton:
      "Een doos overschrijdt de limieten (65 kg, 270 cm aan één zijde, of lengte + 2 × (breedte + hoogte) boven 400 cm): die moet opnieuw worden verpakt.",
    tooManyDesignations: "Bij een zending inclusief belastingen zijn hoogstens 5 referenties mogelijk: bij meer stellen we een offerte op.",
    noCartons: "Voer minstens één doos in, met de afmetingen en het gewicht.",
  },
  gate: {
    locked: "De prijs verschijnt na registratie",
    points: [
      "De gedetailleerde prijs, regel voor regel, per e-mail",
      "Vracht, toeslagen en onze commissie van 3%",
      "Uw schatting, klaar om een offerte te worden",
    ],
    email: "Uw e-mailadres",
    emailPlaceholder: "naam@bedrijf.nl",
    cta: "Prijs bekijken",
    already: "Ik heb al een account",
    note: "Richtprijzen; de tarieftabel wordt binnenkort bijgewerkt. De definitieve prijs staat in uw offerte.",
    sending: "Verzenden…",
    sent: "Verzonden naar {email}. Maak nu uw account aan om uw offertes terug te vinden.",
    errors: {
      invalid_email: "Dit e-mailadres lijkt niet geldig.",
      rate_limited: "Te veel aanvragen vanaf deze verbinding. Probeer het over een uur opnieuw.",
      failed: "Het verzenden is mislukt. Stuur ons een bericht via WhatsApp of mail naar contact@sourcingpick.com.",
      invalid: "Controleer de velden: er ontbreekt informatie om de prijs te berekenen.",
    },
  },
  rules: {
    title: "Hoe wij uw tarief berekenen",
    intro:
      "De prijs komt uit de Europese zeevrachttabel van onze vervoerder (rederijen EMC en COSCO). Hier staan al zijn regels, zoals ze op uw zending van toepassing zijn.",
    sections: [
      {
        title: "Het belastbare gewicht",
        text:
          "Elke doos wordt gefactureerd op het hoogste van drie gewichten: het werkelijke gewicht, het volumegewicht (lengte × breedte × hoogte in cm ÷ 6.000) en een minimum van 12 kg per doos (10 kg voor Amazon-magazijnen die per vrachtwagen worden beleverd, bij een zending inclusief belastingen). Daarna worden de dozen bij elkaar opgeteld.",
      },
      {
        title: "De gewichtsstaffels",
        text:
          "De prijs per kilo daalt naarmate het totale gewicht stijgt: 21 tot 70 kg, 71 tot 299 kg, 300 kg en meer. Een zending wordt gefactureerd voor minstens 21 kg, en voor minstens 71 kg op de vrachtwagenlijnen die bij 71 kg beginnen.",
      },
      {
        title: "Inclusief belastingen of op uw btw-nummer",
        text:
          "Inclusief belastingen: invoerrechten en invoer-btw zijn bij de prijs inbegrepen, met hoogstens 5 productreferenties per zending. Op uw btw-nummer: u levert een geldig btw-nummer en EORI-nummer, de invoer-btw wordt verlegd; 380 RMB inklaringskosten per zending, rechten en belastingen tegen werkelijke kosten doorberekend, 30 RMB per referentie boven 5. Bij een douanecontrole: € 900 handlingkosten, verdeeld over de partijen in de container, en € 3 per pallet per dag opslag.",
      },
      {
        title: "De bestemming",
        text:
          "Amazon-magazijnen, beleverd per vrachtwagen; levering door UPS of DPD (vervoerder door ons gekozen) in Duitsland, Frankrijk, Italië en Spanje, of door UPS in 23 landen. Een adres dat geen Amazon-magazijn is (particulier, bedrijf): +1 RMB per kilo, minimaal 100 RMB voor een zending van één pakket.",
      },
      {
        title: "Toeslagen per soort goederen",
        text:
          "+1 RMB/kg: keukengerei, verlichting, keramiek, auto- en fietsaccessoires, artikelen van hout of bamboe, pennen, tenten, gereedschap, camera’s, dashcams, beautyapparaten, mediaspelers, robotstofzuigers, beamers, harde schijven, solarlampen, paraplu’s, pruiken, koffers, drones, USB-sticks… +3 RMB/kg: artikelen voor volwassenen, cosmetica, kledingfournituren, sokken, mutsen, handschoenen, beddengoed, stoffen, tassen, leer. +4 RMB/kg: kleding, schoenen, ondergoed, badkleding en al het textiel dat op het lichaam wordt gedragen. Per stuk: telefoons +3 RMB, steps en loopbanden +€ 7,50, fietsen +€ 75. De toeslagen worden bij elkaar opgeteld.",
      },
      {
        title: "Pakketten buiten de norm",
        text:
          "Geweigerd: meer dan 65 kg, een zijde van meer dan 270 cm, of lengte + 2 × (breedte + hoogte) boven 400 cm. Per doos geldt de hoogste toeslag: 130 RMB tussen 30 en 40 kg, of als de langste zijde meer dan 100 cm meet of de op één na langste meer dan 76 cm; 600 RMB boven 40 kg; 120 RMB als lengte + 2 × (breedte + hoogte) tussen 266 en 320 cm ligt, 900 RMB tussen 321 en 400 cm. Een zending van één pakket: +80 RMB.",
      },
      {
        title: "De opties",
        text:
          "Aparte exportaangifte: 350 RMB, +50 RMB per pagina na de eerste (5 regels per pagina). Handtekening bij levering voor UPS: 30 RMB per pakket. Door u opgelegde vervoerder: +1 RMB per kilo (+0,5 RMB voor DHL op de QOT Express-lijn).",
      },
      {
        title: "De levertijden",
        text:
          "Sluiting op vrijdag, vertrek op woensdag. Afhalen ongeveer 38 tot 42 dagen na vertrek van het schip; 40 tot 45 dagen van begin tot eind.",
      },
      {
        title: "Onze commissie",
        text: "3% op de vracht die wij aan u doorberekenen, op een aparte regel in uw offerte.",
      },
      {
        title: "Wat niet in de prijs is inbegrepen",
        text:
          "Afgelegen gebieden (toeslag doorberekend volgens de factuur van de vervoerder), adreswijziging, kosten van douanecontrole, btw en rechten op uw btw-nummer, verzekering, en onze magazijndiensten in Guangzhou (ontvangst, controle, versteviging, belading), die in uw offerte worden geprijsd.",
      },
      {
        title: "Geweigerde goederen",
        text:
          "Vloeistoffen, poeders, namaakproducten, losse batterijen, powerbanks, elektrische eenwielers, tabak, levensmiddelen, geneesmiddelen, bijtende, ontvlambare of explosieve producten, wapens. Producten met ingebouwde batterijen en magnetische producten worden geaccepteerd. Gevoelige goederen die bij de controle vóór export worden ontdekt, kosten 3.000 RMB boete, de terugzending en 8 RMB/kg handlingkosten.",
      },
      {
        title: "De verpakking",
        text:
          "Alle producten dragen de vermelding MADE IN CHINA; textiel, leer, bagage en schoenen ook een etiket met samenstelling en onderhoudsvoorschriften. Voor Amazon: op elke doos twee barcodelabels voor de inslag in het magazijn, SKU- en FBA-labels beschermd met transparante tape. Vermijd gele tape.",
      },
      {
        title: "Bij verlies",
        text:
          "Verlies of blokkering bij de douane: vergoeding op basis van de aangegeven waarde, tot maximaal 20 RMB per kilo, zonder terugbetaling van de vracht. Schade wordt niet vergoed: sluit voor waardevolle goederen een verzekering af.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Uw schatting voor zeevracht: {total}",
    heading: "Uw schatting van Sourcing Pick",
    intro:
      "Hier is de uitsplitsing van uw zending per schip, berekend met de Europese zeevrachttabel van onze vervoerder en al zijn regels.",
    summary: {
      regime: "Inklaring",
      delivery: "Levering",
      cartons: "Dozen",
      real: "Werkelijk gewicht",
      volumetric: "Volumegewicht",
      chargeable: "Belastbaar gewicht",
      bracket: "Staffel en tarief",
      delay: "Levertijd",
    },
    items: {
      freight: "Zeevracht ({kg} kg × {rate} RMB/kg)",
      goods: "Toeslag soort goederen ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Niet-Amazon-adres (+1 RMB/kg, minimaal 100 RMB voor één pakket)",
      singleCarton: "Zending van één pakket",
      oversize: "Pakketten buiten de norm ({cartons} dozen)",
      phones: "Telefoons ({units} × 3 RMB)",
      vatClearance: "Inklaring op uw btw-nummer",
      declaration: "Aparte exportaangifte ({pages} pagina(’s))",
      designations: "Referenties boven 5 ({extra} × 30 RMB)",
      signature: "Handtekening bij UPS-levering ({cartons} × 30 RMB)",
      scooters: "Steps en loopbanden ({units} × € 7,50)",
      bikes: "Fietsen ({units} × € 75)",
    },
    subtotal: "Subtotaal transport",
    commission: "Commissie Sourcing Pick (3% van de vracht)",
    total: "Geschat totaal",
    notIncludedTitle: "Niet inbegrepen",
    notIncluded: [
      "Afgelegen gebieden, adreswijziging, kosten van douanecontrole",
      "Btw en invoerrechten op uw btw-nummer",
      "Verzekering",
      "Onze magazijndiensten in Guangzhou (ontvangst, controle, versteviging, belading), geprijsd in uw offerte",
    ],
    disclaimer:
      "Richtprijs, opgesteld met de huidige tarieftabel van onze vervoerder (wordt binnenkort bijgewerkt). De definitieve prijs staat in uw offerte.",
    signup: "Maak uw Sourcing Pick-account aan om deze schatting om te zetten in een offerte:",
    signupCta: "Mijn account aanmaken",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
