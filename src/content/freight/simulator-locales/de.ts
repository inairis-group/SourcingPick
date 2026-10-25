import type { FreightSimulatorCopy } from "../simulator";

export const de: FreightSimulatorCopy = {
  eyebrow: "Frachtrechner",
  title: "Was würde Ihre Sendung kosten?",
  intro:
    "Geben Sie Ihre Adresse und Ihre Produkte an: Wir berechnen für jedes Produkt das Volumengewicht und wenden den Europa-Tarif unseres Spediteurs an. Den detaillierten Preis erhalten Sie per E-Mail.",
  mode: {
    label: "Transportart",
    names: { sea: "Schiff", air: "Flugzeug", truck: "Lkw", rail: "Zug" },
    recommended: "Empfohlen",
    discouraged: "Nicht empfohlen",
    hints: {
      sea: "Am günstigsten – und unsere Empfehlung: insgesamt 40 bis 45 Tage.",
      air: "Am schnellsten: 7 bis 10 Arbeitstage. Für eine kleine oder eilige Sendung.",
      truck: "Riskanter: Wir empfehlen ihn nicht. Etwa 16 bis 20 Tage.",
      rail: "Auch ihn empfehlen wir nicht. 35 bis 38 Tage nach Abfahrt des Zuges.",
    },
  },
  formula: {
    label: "Lieferbedingung",
    names: { ddp: "Geliefert, verzollt", fob: "FOB", customs: "Bis zum Zoll" },
    hints: {
      ddp: "An Ihre Adresse geliefert, Zölle und Einfuhrumsatzsteuer inklusive (DDP).",
      fob: "Übergabe im Abgangshafen oder am Abflughafen in China; Ihr eigener Spediteur übernimmt ab dort. Preis auf Anfrage.",
      customs: "Transport bis zum Zoll am Ankunftsort; Sie verzollen die Ware und holen sie ab. Preis auf Anfrage.",
    },
  },
  address: {
    title: "Lieferadresse",
    street: "Adresse",
    postcode: "PLZ",
    city: "Ort",
    country: "Land",
  },
  products: {
    title: "Ihre Produkte",
    item: "Produkt {n}",
    name: "Produktname",
    namePlaceholder: "z. B. Schreibtischlampen",
    goods: "Warenart",
    cartons: "Kartons",
    length: "Länge (cm)",
    width: "Breite (cm)",
    height: "Höhe (cm)",
    weight: "Gewicht (kg)",
    cartonHint: "Maße und Gewicht eines Kartons.",
    units: "Stückzahl",
    battery: "Enthält eine Batterie",
    reinforce: "Mit Holz verstärken",
    reinforceHint: "15 $ pro m³, in unserem Lager in Guangzhou.",
    add: "+ Produkt hinzufügen",
    remove: "Entfernen",
    summary: "{m3} · Volumengewicht {volumetric}",
    goodsReset: "Die Warenliste hängt von der Transportart ab: Prüfen Sie die Warenart jedes Produkts.",
  },
  goods: {
    sea: {
      ordinary: "Standardware",
      kg1: "+1 RMB/kg: Küche, Leuchten, Keramik, Holz, Werkzeug, Kameras, Drohnen…",
      kg3: "+3 RMB/kg: Taschen, Leder, Stoffe, Bettwäsche, Socken, Kosmetik…",
      kg4: "+4 RMB/kg: Kleidung, Schuhe, Unterwäsche, Badebekleidung…",
      phones: "Mobiltelefone: +3 RMB pro Telefon",
      scooters: "Roller, Laufbänder: +7,50 € pro Stück",
      bikes: "Fahrräder: +75 € pro Stück",
      refused: "Nicht angenommen: Flüssigkeiten, Pulver, lose Batterien, Fälschungen…",
    },
    air: {
      ordinary: "Standardware",
      kg1: "+1 RMB/kg: Holzartikel, Eisenwaren, Metall, Handyhüllen und -kabel…",
      kg2: "+2 RMB/kg: Leuchten, Keramik, Kosmetik, Kosmetikgeräte, Kameras, Festplatten…",
      kg3: "+3 RMB/kg: Spielzeug, Leder, Textilzubehör",
      kg5: "+5 RMB/kg: Uhren, E-Zigaretten ohne Liquid",
      kg7: "+7 RMB/kg: Kleidung, Schuhe, Textilien, Telefone, Computer, Tablets, Drohnen",
      refused: "Nicht angenommen: Flüssigkeiten, Pulver, lose Batterien, Fälschungen…",
    },
    truck: {
      ordinary: "Standardware",
      kg1: "+1 RMB/kg: Leder, Küchenutensilien, LED-Leuchten, Spielzeug, Kopfhörer, Bluetooth-Produkte…",
      kg2: "+2 RMB/kg: Eisenwaren, Kosmetikgeräte, Dashcams, GPS-Geräte, Stifte, Erotikartikel…",
      kg3: "+3 RMB/kg: Perücken, Textilien (außer Kleidung und Schuhen)",
      kg4: "+4 RMB/kg: Tablets",
      kg5: "+5 RMB/kg: Kleidung, Socken, Hosen, Solarmodule, Einweg-E-Zigaretten",
      kg8: "+8 RMB/kg: Schuhe",
      pieces: "Uhren, USB-Sticks, Konsolen, Speicherkarten: +3 RMB pro Stück",
      phones: "Mobiltelefone: +8 RMB pro Telefon",
      quote: "Brillen, Gepäck, Drohnen, Saugroboter, Holzartikel…: auf Anfrage",
      refused: "Nicht angenommen: Flüssigkeiten, Pulver, lose Batterien, Fälschungen…",
    },
    rail: {
      ordinary: "Standardware",
      kg1: "+1 RMB/kg: Küche, Leuchten, Keramik, Holz, Werkzeug, Kameras, Drohnen…",
      kg2: "+2 RMB/kg: Taschen, Leder, Stoffe, Bettwäsche, Socken, Kosmetik…",
      kg4: "+4 RMB/kg: Kleidung, Schuhe, Unterwäsche, Badebekleidung…",
      phones: "Mobiltelefone: +3 RMB pro Telefon",
      scooters: "Roller, Laufbänder: +7,50 € pro Stück",
      bikes: "Fahrräder: +75 € pro Stück",
      refused: "Nicht angenommen: Flüssigkeiten, Pulver, lose Batterien, Fälschungen…",
    },
  },
  options: {
    declaration: "Separate Ausfuhranmeldung",
    declarationHint: "350 RMB pro Sendung.",
    declarationHintSea: "350 RMB, +50 RMB pro Seite ab der zweiten (5 Produkte pro Seite).",
  },
  calc: {
    title: "Abgerechnetes Gewicht",
    rule: "Das höhere von tatsächlichem Gewicht und Volumengewicht (L × B × H ÷ 6.000), mindestens 12 kg pro Karton.",
    volumetric: "Volumengewicht",
    bracket: "Staffel",
    billed: "abgerechnet: {kg} kg",
    volume: "Gesamtvolumen: {m3}",
  },
  estimate: {
    title: "Ihre Schätzung",
    delayLabel: "Laufzeit",
    delays: {
      sea: "insgesamt 40 bis 45 Tage",
      air: "7 bis 10 Arbeitstage",
      truck: "etwa 16 bis 20 Tage",
      rail: "35 bis 38 Tage nach Abfahrt",
    },
    surcharges: "Zusätzlich für Ihre Sendung",
    oversize: "Sperrige oder schwere Packstücke: {n}",
    singleCarton: "Sendung mit nur einem Packstück",
    battery: "Produkte mit Batterie",
    reinforcement: "Holzverstärkung: {m3}",
    declaration: "Separate Ausfuhranmeldung",
  },
  quote: {
    title: "Preis auf Anfrage",
    reasons: {
      formula: "Bei FOB oder „Bis zum Zoll“ erstellen wir Ihnen ein Angebot: Wir antworten Ihnen per E-Mail.",
      country: "Mit dieser Transportart beliefern wir dieses Land nicht verzollt und versteuert: Wir erstellen Ihnen ein Angebot.",
      air_battery:
        "Per Flugzeug laufen Produkte mit Batterie über eine Linie, die nur an Amazon- und Logistiklager liefert: Wir erstellen Ihnen ein Angebot.",
      too_many_products: "Bei mehr als 5 verschiedenen Produkten erstellen wir Ihnen ein Angebot.",
      goods_quote: "Für diese Ware erstellen wir Ihnen ein Angebot.",
    },
  },
  warnings: {
    refusedGoods: "Eine Ihrer Waren wird mit dieser Transportart nicht angenommen.",
    refusedCarton:
      "Ein Karton überschreitet die Grenzwerte (65 kg, 270 cm auf einer Seite oder Länge + 2 × (Breite + Höhe) über 400 cm): Er muss neu verpackt werden.",
    noProducts: "Geben Sie mindestens ein Produkt mit seinen Kartons sowie deren Maßen und Gewicht an.",
  },
  gate: {
    locked: "Preis sichtbar nach Registrierung",
    lockedQuote: "Preis auf Anfrage: Wir antworten Ihnen per E-Mail",
    points: [
      "Der detaillierte Preis, Position für Position, per E-Mail",
      "Transport, Zuschläge, Verstärkung und unsere Provision von 3 %",
      "Ihre Schätzung – bereit, daraus ein Angebot zu machen",
    ],
    name: "Vor- und Nachname",
    phone: "Telefon (WhatsApp)",
    email: "Ihre E-Mail-Adresse",
    emailPlaceholder: "name@firma.de",
    cta: "Preis anzeigen",
    ctaQuote: "Angebot erhalten",
    already: "Ich habe schon ein Konto",
    note: "Richtpreise – der Tarif wird demnächst aktualisiert. Den verbindlichen Preis finden Sie in Ihrem Angebot.",
    sending: "Wird gesendet…",
    sent: "Gesendet an {email}. Erstellen Sie jetzt Ihr Konto, um Ihre Angebote jederzeit wiederzufinden.",
    sentQuote: "Anfrage erhalten: Wir antworten Ihnen per E-Mail an {email}. Erstellen Sie jetzt Ihr Konto, um Ihre Angebote im Blick zu behalten.",
    errors: {
      invalid_email: "Diese E-Mail-Adresse scheint nicht gültig zu sein.",
      rate_limited: "Zu viele Anfragen über diese Verbindung. Versuchen Sie es in einer Stunde erneut.",
      failed: "Das Senden hat nicht funktioniert. Schreiben Sie uns per WhatsApp oder an contact@sourcingpick.com.",
      invalid: "Bitte prüfen Sie die Felder: Für die Preisberechnung fehlt eine Angabe.",
    },
  },
  rules: {
    title: "So berechnen wir Ihren Preis",
    intro:
      "Der Preis stammt aus den Europa-Tarifen unseres Spediteurs für Schiff, Flugzeug, Lkw und Zug. Hier sind ihre Regeln, so wie sie für Ihre Sendung gelten.",
    sections: [
      {
        title: "Das Abrechnungsgewicht",
        text:
          "Jeder Karton wird nach dem höchsten von drei Gewichten berechnet: seinem tatsächlichen Gewicht, seinem Volumengewicht (Länge × Breite × Höhe in cm ÷ 6.000) und 12 kg. Anschließend werden die Kartons aller Ihrer Produkte addiert.",
      },
      {
        title: "Die Transportarten und ihre Laufzeiten",
        text:
          "Schiff: insgesamt 40 bis 45 Tage, am günstigsten und unsere Empfehlung. Flugzeug: 7 bis 10 Arbeitstage, für eine kleine oder eilige Sendung. Lkw: etwa 16 bis 20 Tage, riskanter, wir empfehlen ihn nicht. Zug: 35 bis 38 Tage nach Abfahrt des Zuges, auch ihn empfehlen wir nicht. Den Zusteller für die letzte Etappe wählen wir aus.",
      },
      {
        title: "Die Gewichtsstaffeln",
        text:
          "Der Kilopreis sinkt mit dem Gesamtgewicht. Schiff: 21 bis 70 kg, 71 bis 299 kg, ab 300 kg. Flugzeug: 21 bis 69 kg, 70 bis 99 kg, 100 bis 299 kg, ab 300 kg. Lkw: 30 bis 70 kg, 71 bis 100 kg, 101 bis 499 kg, ab 500 kg (ab 300 kg ins Vereinigte Königreich). Zug: 45 bis 74 kg, 75 bis 299 kg, ab 300 kg. Eine Sendung wird mit mindestens 21 kg per Schiff und Flugzeug, 30 kg per Lkw und 45 kg per Zug berechnet.",
      },
      {
        title: "Die Lieferbedingungen",
        text:
          "Geliefert, verzollt (DDP): Lieferung an Ihre Adresse, Zölle und Einfuhrumsatzsteuer inklusive; per Schiff, Flugzeug und Zug höchstens 5 verschiedene Produkte pro Sendung. FOB: Die Ware wird im Abgangshafen oder am Abflughafen in China übergeben, Ihr eigener Spediteur übernimmt ab dort. Bis zum Zoll: Wir bringen die Ware bis zum Zoll am Ankunftsort, Sie verzollen sie und holen sie ab. Bei FOB und „Bis zum Zoll“ erstellen wir Ihnen ein Angebot.",
      },
      {
        title: "Die Lieferländer",
        text:
          "Jede Transportart beliefert ihre eigene Liste europäischer Länder; das Vereinigte Königreich wird nur per Lkw beliefert. Beliefert die gewählte Transportart Ihr Land nicht, erstellen wir Ihnen ein Angebot.",
      },
      {
        title: "Zuschläge je nach Ware",
        text:
          "Jede Transportart hat ihre eigenen Zuschläge, pro abgerechnetem Kilo des betreffenden Produkts oder pro Stück; die Liste im Formular ändert sich mit der Transportart und übernimmt die Beispiele aus dem Tarif. Schiff: +1, +3 oder +4 RMB/kg; Telefone +3 RMB pro Stück, Roller und Laufbänder +7,50 € pro Stück, Fahrräder +75 € pro Stück. Zug: +1, +2 oder +4 RMB/kg und dieselben Zuschläge pro Stück. Flugzeug: +1, +2, +3, +5 oder +7 RMB/kg. Lkw: von +1 bis +8 RMB/kg; Uhren, USB-Sticks, Konsolen und Speicherkarten +3 RMB pro Stück, Telefone +8 RMB pro Stück; Brillen, Gepäck, Drohnen und Holzartikel auf Anfrage. Die Zuschläge addieren sich.",
      },
      {
        title: "Produkte mit Batterie",
        text:
          "Per Schiff und Zug werden sie angenommen. Per Lkw: +100 RMB pro Sendung. Per Flugzeug laufen sie über eine Linie ab Hong Kong, die nur an Amazon- und Logistiklager liefert: Wir erstellen Ihnen ein Angebot.",
      },
      {
        title: "Sperrige oder schwere Packstücke",
        text:
          "Nicht angenommen: mehr als 65 kg, eine Seite über 270 cm oder Länge + 2 × (Breite + Höhe) über 400 cm. Pro Karton gilt der höchste Zuschlag: 130 RMB zwischen 30 und 40 kg oder wenn die längste Seite 100 cm bzw. die zweitlängste 76 cm überschreitet; 600 RMB über 40 kg; 120 RMB, wenn Länge + 2 × (Breite + Höhe) zwischen 266 und 320 cm liegt, 900 RMB zwischen 321 und 400 cm. Sendung mit nur einem Packstück: +80 RMB (+50 RMB per Lkw ins Vereinigte Königreich).",
      },
      {
        title: "Die Holzverstärkung",
        text:
          "Für zerbrechliche Waren verstärken wir die Kartons in unserem Lager in Guangzhou mit Holz: 15 $ pro m³ des verstärkten Produkts.",
      },
      {
        title: "Die separate Ausfuhranmeldung",
        text:
          "350 RMB pro Sendung; per Schiff +50 RMB pro Seite ab der zweiten (5 Zeilen pro Seite). Per Lkw werden die Exportunterlagen kostenlos erstellt.",
      },
      {
        title: "Unsere Provision",
        text: "3 % auf die gesamte Schätzung (Transport, Zuschläge und Verstärkung), als eigene Position in Ihrem Angebot.",
      },
      {
        title: "Was nicht im Preis enthalten ist",
        text:
          "Abgelegene Gebiete (Zuschlag gemäß Rechnung des Spediteurs weiterberechnet), Adressänderung, Kosten einer Zollkontrolle, Versicherung sowie unsere weiteren Lagerleistungen in Guangzhou (Wareneingang, Prüfung, Beladung), die in Ihrem Angebot kalkuliert werden.",
      },
      {
        title: "Nicht angenommene Waren",
        text:
          "Flüssigkeiten, Pulver, Fälschungen, lose Batterien, Powerbanks, Elektro-Einräder, Tabak, Lebensmittel, Medikamente, ätzende, entzündliche oder explosive Produkte, Waffen. Wird bei der Kontrolle vor dem Export eine sensible Ware entdeckt, kostet das 3.000 RMB Strafe, die Rücksendung und 8 RMB/kg Handling.",
      },
      {
        title: "Die Verpackung",
        text:
          "Alle Produkte tragen den Hinweis MADE IN CHINA; Textilien, Leder, Gepäck und Schuhe ein Etikett mit Materialzusammensetzung und Pflegehinweisen. Vermeiden Sie gelbes Klebeband.",
      },
      {
        title: "Bei Verlust",
        text:
          "Schiff und Zug: Verlust oder Festhalten der Ware beim Zoll wird auf Basis des angegebenen Warenwerts entschädigt, höchstens 20 RMB pro Kilo, ohne Erstattung der Transportkosten; Schäden werden nicht entschädigt. Flugzeug und Lkw: 40 RMB pro Kilo bei Verlust vor der Übernahme durch UPS oder bei Beschlagnahme durch den Zoll, danach gelten die Regeln von UPS, höchstens 100 USD pro Sendung. Schließen Sie für wertvolle Ware eine Versicherung ab.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Ihre Frachtschätzung: {total}",
    subjectQuote: "Ihre Angebotsanfrage für den Transport",
    heading: "Ihre Schätzung von SourcingPick",
    headingQuote: "Ihre Angebotsanfrage bei SourcingPick",
    intro: "Hier ist die Aufschlüsselung Ihrer Sendung, berechnet mit dem Europa-Tarif unseres Spediteurs und allen seinen Regeln.",
    introQuote: "Wir haben Ihre Anfrage erhalten. Hier sind Ihre Angaben; wir melden uns mit einem Angebot bei Ihnen.",
    summary: {
      mode: "Transportart",
      formula: "Lieferbedingung",
      address: "Lieferadresse",
      cartons: "Kartons",
      real: "Ist-Gewicht",
      volumetric: "Volumengewicht",
      chargeable: "Abrechnungsgewicht",
      bracket: "Staffel und Tarif",
      delay: "Laufzeit",
    },
    productsTitle: "Ihre Produkte",
    product: "{name}: {cartons} Kartons · {m3} · Abrechnungsgewicht {chargeable}",
    items: {
      freight: "Fracht ({kg} kg × {rate} RMB/kg)",
      goods: "Produktzuschlag, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × {rate} €",
      singleCarton: "Sendung mit nur einem Packstück",
      oversize: "Sperrige oder schwere Packstücke ({cartons} Kartons)",
      battery: "Produkte mit Batterie",
      declaration: "Separate Ausfuhranmeldung ({pages} Seite(n))",
      reinforcement: "Holzverstärkung ({m3} m³ × {rate} $)",
    },
    subtotal: "Zwischensumme",
    commission: "Provision von SourcingPick (3 %)",
    total: "Geschätzter Gesamtbetrag",
    notIncludedTitle: "Nicht enthalten",
    notIncluded: [
      "Abgelegene Gebiete, Adressänderung, Kosten einer Zollkontrolle",
      "Versicherung",
      "Unsere weiteren Lagerleistungen in Guangzhou (Wareneingang, Prüfung, Beladung), in Ihrem Angebot kalkuliert",
    ],
    disclaimer:
      "Richtpreis, berechnet mit dem aktuellen Tarif unseres Spediteurs (wird demnächst aktualisiert). Den verbindlichen Preis finden Sie in Ihrem Angebot.",
    quoteNext: "Wir melden uns mit einem detaillierten Angebot bei Ihnen.",
    signup: "Erstellen Sie Ihr Konto bei SourcingPick, um Ihre Angebote im Blick zu behalten:",
    signupCta: "Konto erstellen",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
