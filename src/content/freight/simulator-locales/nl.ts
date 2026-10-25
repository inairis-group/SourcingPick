import type { FreightSimulatorCopy } from "../simulator";

export const nl: FreightSimulatorCopy = {
  eyebrow: "Vrachtcalculator",
  title: "Wat zou uw zending kosten?",
  intro:
    "Voer uw adres en uw producten in: wij berekenen van elk product het volumegewicht en passen de Europese tarieftabel van onze vervoerder toe. De gedetailleerde prijs ontvangt u per e-mail.",
  mode: {
    label: "Vervoerswijze",
    names: { sea: "Schip", air: "Vliegtuig", truck: "Vrachtwagen", rail: "Trein" },
    recommended: "Aanbevolen",
    discouraged: "Afgeraden",
    hints: {
      sea: "De goedkoopste, en die raden wij aan: 40 tot 45 dagen van begin tot eind.",
      air: "De snelste: 7 tot 10 werkdagen. Voor een kleine of dringende zending.",
      truck: "Riskanter: wij raden het niet aan. Ongeveer 16 tot 20 dagen.",
      rail: "Ook die raden wij niet aan. 35 tot 38 dagen na vertrek van de trein.",
    },
  },
  formula: {
    label: "Formule",
    names: { ddp: "Geleverd, incl. belastingen", fob: "FOB", customs: "Tot de douane" },
    hints: {
      ddp: "Geleverd op uw adres, invoerrechten en invoer-btw inbegrepen (DDP).",
      fob: "Overgedragen in de haven of op de luchthaven van vertrek in China; uw expediteur neemt het daar over. Prijs op offerte.",
      customs: "Vervoerd tot de douane bij aankomst; u klaart de goederen in en haalt ze op. Prijs op offerte.",
    },
  },
  address: {
    title: "Leveringsadres",
    street: "Adres",
    postcode: "Postcode",
    city: "Plaats",
    country: "Land",
  },
  products: {
    title: "Uw producten",
    item: "Product {n}",
    name: "Productnaam",
    namePlaceholder: "Bijv.: bureaulampen",
    goods: "Soort goederen",
    cartons: "Dozen",
    length: "L (cm)",
    width: "B (cm)",
    height: "H (cm)",
    weight: "Gew. (kg)",
    cartonHint: "Afmetingen en gewicht van één doos.",
    units: "Aantal stuks",
    battery: "Bevat een batterij",
    reinforce: "Verstevigen met hout",
    reinforceHint: "$ 15 per m³, in ons magazijn in Guangzhou.",
    add: "+ Product toevoegen",
    remove: "Verwijderen",
    summary: "{m3} · {volumetric} volumetrisch",
    goodsReset: "De lijst met soorten goederen verschilt per vervoerswijze: controleer de soort van elk product.",
  },
  goods: {
    sea: {
      ordinary: "Gewone goederen",
      kg1: "+1 RMB/kg: keukengerei, verlichting, keramiek, hout, gereedschap, camera’s, drones…",
      kg3: "+3 RMB/kg: tassen, leer, stoffen, beddengoed, sokken, cosmetica…",
      kg4: "+4 RMB/kg: kleding, schoenen, ondergoed, badkleding…",
      phones: "Mobiele telefoons: +3 RMB per telefoon",
      scooters: "Steps, loopbanden: +€ 7,50 per stuk",
      bikes: "Fietsen: +€ 75 per stuk",
      refused: "Geweigerd: vloeistoffen, poeders, losse batterijen, namaakproducten…",
    },
    air: {
      ordinary: "Gewone goederen",
      kg1: "+1 RMB/kg: houten artikelen, ijzerwaren, metaal, telefoonhoesjes en -kabels…",
      kg2: "+2 RMB/kg: verlichting, keramiek, cosmetica, beautyapparaten, camera’s, harde schijven…",
      kg3: "+3 RMB/kg: speelgoed, leer, textielaccessoires",
      kg5: "+5 RMB/kg: horloges, e-sigaretten zonder vloeistof",
      kg7: "+7 RMB/kg: kleding, schoenen, textiel, telefoons, computers, tablets, drones",
      refused: "Geweigerd: vloeistoffen, poeders, losse batterijen, namaakproducten…",
    },
    truck: {
      ordinary: "Gewone goederen",
      kg1: "+1 RMB/kg: leer, keukengerei, LED-verlichting, speelgoed, koptelefoons, Bluetooth-producten…",
      kg2: "+2 RMB/kg: ijzerwaren, beautyapparaten, dashcams, GPS, pennen, artikelen voor volwassenen…",
      kg3: "+3 RMB/kg: pruiken, textiel (behalve kleding en schoenen)",
      kg4: "+4 RMB/kg: tablets",
      kg5: "+5 RMB/kg: kleding, sokken, broeken, zonnepanelen, e-sigaretten voor eenmalig gebruik",
      kg8: "+8 RMB/kg: schoenen",
      pieces: "Horloges, USB-sticks, consoles, geheugenkaarten: +3 RMB per stuk",
      phones: "Mobiele telefoons: +8 RMB per telefoon",
      quote: "Brillen, bagage, drones, robotstofzuigers, houten artikelen…: op offerte",
      refused: "Geweigerd: vloeistoffen, poeders, losse batterijen, namaakproducten…",
    },
    rail: {
      ordinary: "Gewone goederen",
      kg1: "+1 RMB/kg: keukengerei, verlichting, keramiek, hout, gereedschap, camera’s, drones…",
      kg2: "+2 RMB/kg: tassen, leer, stoffen, beddengoed, sokken, cosmetica…",
      kg4: "+4 RMB/kg: kleding, schoenen, ondergoed, badkleding…",
      phones: "Mobiele telefoons: +3 RMB per telefoon",
      scooters: "Steps, loopbanden: +€ 7,50 per stuk",
      bikes: "Fietsen: +€ 75 per stuk",
      refused: "Geweigerd: vloeistoffen, poeders, losse batterijen, namaakproducten…",
    },
  },
  options: {
    declaration: "Aparte exportaangifte",
    declarationHint: "350 RMB per zending.",
    declarationHintSea: "350 RMB, +50 RMB per pagina na de eerste (5 producten per pagina).",
  },
  calc: {
    volumetric: "Volumegewicht",
    formula: "L × B × H ÷ 6.000",
    bracket: "Staffel",
    billed: "{kg} kg gefactureerd",
    volume: "Totaal volume: {m3}",
  },
  estimate: {
    title: "Uw schatting",
    delayLabel: "Levertijd",
    delays: {
      sea: "40 tot 45 dagen van begin tot eind",
      air: "7 tot 10 werkdagen",
      truck: "ongeveer 16 tot 20 dagen",
      rail: "35 tot 38 dagen na vertrek",
    },
    surcharges: "Toeslagen op uw zending",
    oversize: "Pakketten buiten de norm: {n}",
    singleCarton: "Zending van één pakket",
    battery: "Producten met batterij",
    reinforcement: "Houten versteviging: {m3}",
    declaration: "Aparte exportaangifte",
  },
  quote: {
    title: "Prijs op offerte",
    reasons: {
      formula: "Bij FOB of levering tot de douane stellen wij een offerte op: u ontvangt ons antwoord per e-mail.",
      country: "Met deze vervoerswijze is levering inclusief belastingen naar dit land niet mogelijk: wij stellen een offerte op.",
      air_battery:
        "Per vliegtuig gaan producten met een batterij via een lijn die voorbehouden is aan Amazon- en logistieke magazijnen: wij stellen een offerte op.",
      too_many_products: "Bij meer dan 5 verschillende producten stellen wij een offerte op.",
      goods_quote: "Voor deze goederen stellen wij een offerte op.",
    },
  },
  warnings: {
    refusedGoods: "Een van uw producten wordt met deze vervoerswijze niet geaccepteerd.",
    refusedCarton:
      "Een doos overschrijdt de limieten (65 kg, 270 cm aan één zijde, of lengte + 2 × (breedte + hoogte) boven 400 cm): die moet opnieuw worden verpakt.",
    noProducts: "Voer minstens één product in, met de dozen, hun afmetingen en hun gewicht.",
  },
  gate: {
    locked: "De prijs verschijnt na registratie",
    lockedQuote: "Prijs op offerte: wij antwoorden u per e-mail",
    points: [
      "De gedetailleerde prijs, regel voor regel, per e-mail",
      "Vracht, toeslagen, versteviging en onze commissie van 3%",
      "Uw schatting, klaar om een offerte te worden",
    ],
    name: "Voor- en achternaam",
    phone: "Telefoon (WhatsApp)",
    email: "Uw e-mailadres",
    emailPlaceholder: "naam@bedrijf.nl",
    cta: "Prijs bekijken",
    ctaQuote: "Mijn offerte ontvangen",
    already: "Ik heb al een account",
    note: "Richtprijzen; de tarieftabel wordt binnenkort bijgewerkt. De definitieve prijs staat in uw offerte.",
    sending: "Verzenden…",
    sent: "Verzonden naar {email}. Maak nu uw account aan om uw offertes terug te vinden.",
    sentQuote: "Aanvraag ontvangen: wij antwoorden u op {email}. Maak nu uw account aan om uw offertes te volgen.",
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
      "De prijs komt uit de Europese tarieftabellen van onze vervoerder: schip, vliegtuig, vrachtwagen en trein. Hier staan hun regels, zoals ze op uw zending van toepassing zijn.",
    sections: [
      {
        title: "Het belastbare gewicht",
        text:
          "Elke doos wordt gefactureerd op het hoogste van drie gewichten: het werkelijke gewicht, het volumegewicht (lengte × breedte × hoogte in cm ÷ 6.000) en 12 kg. Daarna worden de dozen van al uw producten bij elkaar opgeteld.",
      },
      {
        title: "De vervoerswijzen en hun levertijden",
        text:
          "Schip: 40 tot 45 dagen van begin tot eind, de goedkoopste en onze aanbeveling. Vliegtuig: 7 tot 10 werkdagen, voor een kleine of dringende zending. Vrachtwagen: ongeveer 16 tot 20 dagen, riskanter, wij raden het niet aan. Trein: 35 tot 38 dagen na vertrek van de trein, ook die raden wij niet aan. De vervoerder voor het laatste traject kiezen wij.",
      },
      {
        title: "De gewichtsstaffels",
        text:
          "De prijs per kilo daalt naarmate het totale gewicht stijgt. Schip: 21 tot 70 kg, 71 tot 299 kg, 300 kg en meer. Vliegtuig: 21 tot 69 kg, 70 tot 99 kg, 100 tot 299 kg, 300 kg en meer. Vrachtwagen: 30 tot 70 kg, 71 tot 100 kg, 101 tot 499 kg, 500 kg en meer (300 kg en meer naar het Verenigd Koninkrijk). Trein: 45 tot 74 kg, 75 tot 299 kg, 300 kg en meer. Een zending wordt gefactureerd voor minstens 21 kg per schip en per vliegtuig, 30 kg per vrachtwagen en 45 kg per trein.",
      },
      {
        title: "De formules",
        text:
          "Geleverd, inclusief belastingen (DDP): levering op uw adres, invoerrechten en invoer-btw inbegrepen; hoogstens 5 verschillende producten per zending per schip, vliegtuig en trein. FOB: de goederen worden overgedragen in de haven of op de luchthaven van vertrek in China, uw expediteur neemt het daar over. Tot de douane: wij vervoeren de goederen tot de douane bij aankomst, u klaart ze in en haalt ze op. Bij FOB en bij levering tot de douane stellen wij een offerte op.",
      },
      {
        title: "De landen van levering",
        text:
          "Elke vervoerswijze heeft een eigen lijst van Europese landen waarnaar ze levert; het Verenigd Koninkrijk wordt alleen per vrachtwagen beleverd. Levert de gekozen vervoerswijze niet in uw land, dan stellen wij een offerte op.",
      },
      {
        title: "Toeslagen per soort goederen",
        text:
          "Elke vervoerswijze heeft eigen toeslagen, per belastbare kilo van het betreffende product of per stuk; de lijst in het formulier verandert met de vervoerswijze en neemt de voorbeelden uit de tarieftabel over. Schip: +1, +3 of +4 RMB/kg; telefoons +3 RMB per stuk, steps en loopbanden +€ 7,50 per stuk, fietsen +€ 75 per stuk. Trein: +1, +2 of +4 RMB/kg, en dezelfde toeslagen per stuk. Vliegtuig: +1, +2, +3, +5 of +7 RMB/kg. Vrachtwagen: van +1 tot +8 RMB/kg; horloges, USB-sticks, consoles en geheugenkaarten +3 RMB per stuk, telefoons +8 RMB per stuk; brillen, bagage, drones en houten artikelen op offerte. De toeslagen worden bij elkaar opgeteld.",
      },
      {
        title: "Producten met batterij",
        text:
          "Geaccepteerd per schip en per trein. Per vrachtwagen: +100 RMB per zending. Per vliegtuig gaan ze via een lijn vanuit Hong Kong die voorbehouden is aan Amazon- en logistieke magazijnen: wij stellen een offerte op.",
      },
      {
        title: "Pakketten buiten de norm",
        text:
          "Geweigerd: meer dan 65 kg, een zijde van meer dan 270 cm, of lengte + 2 × (breedte + hoogte) boven 400 cm. Per doos geldt de hoogste toeslag: 130 RMB tussen 30 en 40 kg, of als de langste zijde meer dan 100 cm meet of de op één na langste meer dan 76 cm; 600 RMB boven 40 kg; 120 RMB als lengte + 2 × (breedte + hoogte) tussen 266 en 320 cm ligt, 900 RMB tussen 321 en 400 cm. Een zending van één pakket: +80 RMB (+50 RMB per vrachtwagen naar het Verenigd Koninkrijk).",
      },
      {
        title: "Houten versteviging",
        text:
          "Voor breekbare goederen verstevigen wij de dozen met hout in ons magazijn in Guangzhou: $ 15 per m³ van het verstevigde product.",
      },
      {
        title: "Aparte exportaangifte",
        text:
          "350 RMB per zending; per schip +50 RMB per pagina na de eerste (5 regels per pagina). Per vrachtwagen wordt het exportdossier kosteloos opgesteld.",
      },
      {
        title: "Onze commissie",
        text: "3% over de hele schatting: vracht, toeslagen en versteviging, op een aparte regel in uw offerte.",
      },
      {
        title: "Wat niet in de prijs is inbegrepen",
        text:
          "Afgelegen gebieden (toeslag doorberekend volgens de factuur van de vervoerder), adreswijziging, kosten van douanecontrole, verzekering, en onze andere magazijndiensten in Guangzhou (ontvangst, controle, belading), die in uw offerte worden geprijsd.",
      },
      {
        title: "Geweigerde goederen",
        text:
          "Vloeistoffen, poeders, namaakproducten, losse batterijen, powerbanks, elektrische eenwielers, tabak, levensmiddelen, geneesmiddelen, bijtende, ontvlambare of explosieve producten, wapens. Gevoelige goederen die bij de controle vóór export worden ontdekt, kosten 3.000 RMB boete, de terugzending en 8 RMB/kg handlingkosten.",
      },
      {
        title: "De verpakking",
        text:
          "Alle producten dragen de vermelding MADE IN CHINA; textiel, leer, bagage en schoenen ook een etiket met samenstelling en onderhoudsvoorschriften. Vermijd gele tape.",
      },
      {
        title: "Bij verlies",
        text:
          "Schip en trein: verlies of blokkering bij de douane wordt vergoed op basis van de aangegeven waarde, tot maximaal 20 RMB per kilo, zonder terugbetaling van de vracht; schade wordt niet vergoed. Vliegtuig en vrachtwagen: 40 RMB per kilo bij verlies voordat UPS de zending overneemt of bij inbeslagname door de douane, daarna gelden de regels van UPS, tot maximaal 100 USD per zending. Sluit voor waardevolle goederen een verzekering af.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Uw schatting voor transport: {total}",
    subjectQuote: "Uw aanvraag voor een transportofferte",
    heading: "Uw schatting van SourcingPick",
    headingQuote: "Uw offerteaanvraag bij SourcingPick",
    intro: "Hier is de uitsplitsing van uw zending, berekend met de Europese tarieftabel van onze vervoerder en al zijn regels.",
    introQuote: "Wij hebben uw aanvraag goed ontvangen. Hieronder staat wat u ons hebt doorgegeven; wij komen bij u terug met een offerte.",
    summary: {
      mode: "Vervoerswijze",
      formula: "Formule",
      address: "Leveringsadres",
      cartons: "Dozen",
      real: "Werkelijk gewicht",
      volumetric: "Volumegewicht",
      chargeable: "Belastbaar gewicht",
      bracket: "Staffel en tarief",
      delay: "Levertijd",
    },
    productsTitle: "Uw producten",
    product: "{name}: {cartons} dozen · {m3} · {chargeable} belastbaar",
    items: {
      freight: "Vracht ({kg} kg × {rate} RMB/kg)",
      goods: "Toeslag soort goederen, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × € {rate}",
      singleCarton: "Zending van één pakket",
      oversize: "Pakketten buiten de norm ({cartons} dozen)",
      battery: "Producten met batterij",
      declaration: "Aparte exportaangifte ({pages} pagina(’s))",
      reinforcement: "Houten versteviging ({m3} m³ × $ {rate})",
    },
    subtotal: "Subtotaal",
    commission: "Commissie SourcingPick (3%)",
    total: "Geschat totaal",
    notIncludedTitle: "Niet inbegrepen",
    notIncluded: [
      "Afgelegen gebieden, adreswijziging, kosten van douanecontrole",
      "Verzekering",
      "Onze andere magazijndiensten in Guangzhou (ontvangst, controle, belading), geprijsd in uw offerte",
    ],
    disclaimer:
      "Richtprijs, opgesteld met de huidige tarieftabel van onze vervoerder (wordt binnenkort bijgewerkt). De definitieve prijs staat in uw offerte.",
    quoteNext: "Wij komen bij u terug met een gedetailleerde offerte.",
    signup: "Maak uw SourcingPick-account aan om uw offertes te volgen:",
    signupCta: "Mijn account aanmaken",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
