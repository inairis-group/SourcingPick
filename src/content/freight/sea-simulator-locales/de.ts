import type { SeaSimulatorCopy } from "../sea-simulator";

export const de: SeaSimulatorCopy = {
  eyebrow: "Sendung abschätzen",
  title: "Was würde Ihre Sendung per Schiff kosten?",
  intro:
    "Geben Sie Ihre Kartons an: Wir berechnen das Abrechnungsgewicht und wenden Position für Position den Seefrachttarif Europa unseres Spediteurs an. Den detaillierten Preis erhalten Sie per E-Mail.",
  regime: {
    label: "Verzollung",
    ddp: "Verzollt & versteuert",
    ddpHint: "Zölle und Einfuhrumsatzsteuer sind im Preis enthalten.",
    vat: "Über Ihre USt-IdNr.",
    vatHint: "Einfuhrumsatzsteuer im Reverse-Charge-Verfahren: gültige USt-IdNr. und EORI-Nummer erforderlich.",
  },
  deliverTo: {
    label: "Lieferung an",
    amazon: "Amazon-Lager",
    other: "Andere Adresse",
    thirdParty: "Logistiklager",
  },
  warehouse: { label: "Lager", byCountry: "Anderes Amazon-Lager (nach Land)" },
  country: "Lieferland",
  carrier: {
    label: "Zusteller",
    truck: "Lkw bis zum Lager",
    upsDpd: "UPS/DPD nach unserer Wahl",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Warenart",
    ordinary: "Standardware",
    plus1: "Küche, Leuchten, Holz, Werkzeug, Elektronik…",
    plus3: "Textilien, Taschen, Leder, Kosmetik…",
    plus4: "Kleidung, Schuhe, Unterwäsche…",
    refused: "Flüssigkeiten, Pulver, lose Batterien…",
    hint: "Was genau zu jeder Kategorie gehört, steht weiter unten unter „So berechnen wir Ihren Preis“.",
  },
  units: {
    label: "Pro Stück berechnete Produkte",
    phones: "Telefone",
    scooters: "Roller, Laufbänder",
    bikes: "Fahrräder",
  },
  cartons: {
    title: "Ihre Kartons",
    line: "Posten {n}",
    quantity: "Kartons",
    length: "Länge (cm)",
    width: "Breite (cm)",
    height: "Höhe (cm)",
    weight: "Gewicht (kg)",
    add: "+ Posten hinzufügen",
    remove: "Entfernen",
  },
  designations: { label: "Verschiedene Produkte", hint: "Anzahl der verschiedenen angemeldeten Produkte." },
  options: {
    declaration: "Separate Ausfuhranmeldung",
    declarationHint: "350 RMB, +50 RMB pro Seite ab der zweiten.",
    signature: "Zustellung gegen Unterschrift",
    signatureHint: "UPS-Zustellungen: 30 RMB pro Packstück.",
  },
  calc: {
    title: "So wird gerechnet",
    real: "Ist-Gewicht",
    volumetric: "Volumengewicht",
    formula: "L × B × H ÷ 6.000",
    chargeable: "Abrechnungs­gewicht",
    chargeableHint: "Karton für Karton der höchste der drei Werte",
    bracket: "Staffel",
    billed: "abgerechnet: {kg} kg",
    volume: "Gesamtvolumen: {m3}",
    cartons: "{n} Kartons",
  },
  estimate: {
    title: "Ihre Schätzung",
    mode: "Schiff · China → Europa",
    delayLabel: "Laufzeit",
    delay: "insgesamt 40 bis 45 Tage",
    surcharges: "Zusätzlich für Ihre Sendung",
    oversize: "Sperrige oder schwere Packstücke: {n}",
    singleCarton: "Sendung mit nur einem Packstück",
    nonAmazon: "Nicht-Amazon-Adresse",
    vatClearance: "Verzollung über Ihre USt-IdNr.",
  },
  warnings: {
    refusedGoods: "Diese Ware wird per Seefracht nicht angenommen.",
    refusedCarton:
      "Ein Karton überschreitet die Grenzwerte (65 kg, 270 cm auf einer Seite oder Länge + 2 × (Breite + Höhe) über 400 cm): Er muss neu verpackt werden.",
    tooManyDesignations: "Verzollt und versteuert umfasst eine Sendung höchstens 5 verschiedene Produkte – bei mehr erstellen wir Ihnen ein Angebot.",
    noCartons: "Geben Sie mindestens einen Karton mit Maßen und Gewicht an.",
  },
  gate: {
    locked: "Preis sichtbar nach Registrierung",
    points: [
      "Der detaillierte Preis, Position für Position, per E-Mail",
      "Fracht, Zuschläge und unsere Provision von 3 %",
      "Ihre Schätzung – bereit, daraus ein Angebot zu machen",
    ],
    email: "Ihre E-Mail-Adresse",
    emailPlaceholder: "name@firma.de",
    cta: "Preis anzeigen",
    already: "Ich habe schon ein Konto",
    note: "Richtpreise – der Tarif wird demnächst aktualisiert. Den verbindlichen Preis finden Sie in Ihrem Angebot.",
    sending: "Wird gesendet…",
    sent: "Gesendet an {email}. Erstellen Sie jetzt Ihr Konto, um Ihre Angebote jederzeit wiederzufinden.",
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
      "Der Preis stammt aus dem Seefrachttarif Europa unseres Spediteurs (Reedereien EMC und COSCO). Hier sind alle seine Regeln, so wie sie für Ihre Sendung gelten.",
    sections: [
      {
        title: "Das Abrechnungsgewicht",
        text:
          "Jeder Karton wird nach dem höchsten von drei Gewichten berechnet: seinem tatsächlichen Gewicht, seinem Volumengewicht (Länge × Breite × Höhe in cm ÷ 6.000) und einem Mindestgewicht von 12 kg pro Karton (10 kg bei Lkw-Lieferung an Amazon-Lager, verzollt und versteuert). Anschließend werden die Kartons addiert.",
      },
      {
        title: "Die Gewichtsstaffeln",
        text:
          "Der Kilopreis sinkt mit dem Gesamtgewicht: 21 bis 70 kg, 71 bis 299 kg, ab 300 kg. Eine Sendung wird mit mindestens 21 kg berechnet, auf den Lkw-Linien, die bei 71 kg beginnen, mit mindestens 71 kg.",
      },
      {
        title: "Verzollt & versteuert oder über Ihre USt-IdNr.",
        text:
          "Verzollt & versteuert: Zölle und Einfuhrumsatzsteuer sind im Preis enthalten, höchstens 5 verschiedene Produkte pro Sendung. Über Ihre USt-IdNr.: Sie geben eine gültige USt-IdNr. und EORI-Nummer an, die Einfuhrumsatzsteuer wird im Reverse-Charge-Verfahren abgerechnet; 380 RMB Verzollungsgebühr pro Sendung, Zölle und Steuern werden zum tatsächlichen Betrag weiterberechnet, 30 RMB für jedes weitere Produkt über 5. Bei einer Zollkontrolle: 900 € Handling, aufgeteilt auf die Sendungen im Container, und 3 € pro Palette und Lagertag.",
      },
      {
        title: "Der Zielort",
        text:
          "Amazon-Lager per Lkw, Zustellung per UPS oder DPD (den Zusteller wählen wir) in Deutschland, Frankreich, Italien und Spanien oder per UPS in 23 Länder. Eine Adresse, die kein Amazon-Lager ist (Privatperson, Unternehmen): +1 RMB pro Kilo, mindestens 100 RMB bei einer Sendung mit nur einem Packstück.",
      },
      {
        title: "Zuschläge je nach Ware",
        text:
          "+1 RMB/kg: Küchenutensilien, Leuchten, Keramik, Auto- und Fahrradzubehör, Artikel aus Holz oder Bambus, Stifte, Zelte, Werkzeug, Kameras, Dashcams, Kosmetikgeräte, Mediaplayer, Saugroboter, Beamer, Festplatten, Solarlampen, Regenschirme, Perücken, Koffer, Drohnen, USB-Sticks… +3 RMB/kg: Erotikartikel, Kosmetik, Bekleidungszubehör, Socken, Mützen, Handschuhe, Bettwäsche, Stoffe, Taschen, Leder. +4 RMB/kg: Kleidung, Schuhe, Unterwäsche, Badebekleidung und alle am Körper getragenen Textilien. Pro Stück: Telefone +3 RMB, Roller und Laufbänder +7,50 €, Fahrräder +75 €. Die Zuschläge addieren sich.",
      },
      {
        title: "Sperrige oder schwere Packstücke",
        text:
          "Nicht angenommen: mehr als 65 kg, eine Seite über 270 cm oder Länge + 2 × (Breite + Höhe) über 400 cm. Pro Karton gilt der höchste Zuschlag: 130 RMB zwischen 30 und 40 kg oder wenn die längste Seite 100 cm bzw. die zweitlängste 76 cm überschreitet; 600 RMB über 40 kg; 120 RMB, wenn Länge + 2 × (Breite + Höhe) zwischen 266 und 320 cm liegt, 900 RMB zwischen 321 und 400 cm. Sendung mit nur einem Packstück: +80 RMB.",
      },
      {
        title: "Die Optionen",
        text:
          "Separate Ausfuhranmeldung: 350 RMB, +50 RMB pro Seite ab der zweiten (5 Zeilen pro Seite). Zustellung gegen Unterschrift bei UPS: 30 RMB pro Packstück. Zusteller nach Ihrer Vorgabe: +1 RMB pro Kilo (+0,5 RMB für DHL auf der Linie QOT Express).",
      },
      {
        title: "Die Laufzeiten",
        text:
          "Annahmeschluss freitags, Abfahrt mittwochs. Abholung etwa 38 bis 42 Tage nach Abfahrt des Schiffes; insgesamt 40 bis 45 Tage.",
      },
      {
        title: "Unsere Provision",
        text: "3 % auf die Fracht, die wir Ihnen weiterberechnen, als eigene Position in Ihrem Angebot.",
      },
      {
        title: "Was nicht im Preis enthalten ist",
        text:
          "Abgelegene Gebiete (Zuschlag gemäß Rechnung des Spediteurs weiterberechnet), Adressänderung, Kosten einer Zollkontrolle, Einfuhrumsatzsteuer und Zölle bei Verzollung über Ihre USt-IdNr., Versicherung sowie unsere Lagerleistungen in Guangzhou (Wareneingang, Prüfung, Verstärkung, Beladung), die in Ihrem Angebot kalkuliert werden.",
      },
      {
        title: "Nicht angenommene Waren",
        text:
          "Flüssigkeiten, Pulver, Fälschungen, lose Batterien, Powerbanks, Elektro-Einräder, Tabak, Lebensmittel, Medikamente, ätzende, entzündliche oder explosive Produkte, Waffen. Produkte mit eingebauten Batterien und magnetische Produkte werden angenommen. Wird bei der Kontrolle vor dem Export eine sensible Ware entdeckt, kostet das 3.000 RMB Strafe, die Rücksendung und 8 RMB/kg Handling.",
      },
      {
        title: "Die Verpackung",
        text:
          "Alle Produkte tragen den Hinweis MADE IN CHINA; Textilien, Leder, Gepäck und Schuhe ein Etikett mit Materialzusammensetzung und Pflegehinweisen. Für Amazon: zwei Barcode-Etiketten für den Wareneingang im Lager auf jedem Karton, SKU- und FBA-Etiketten mit transparentem Klebeband geschützt. Vermeiden Sie gelbes Klebeband.",
      },
      {
        title: "Bei Verlust",
        text:
          "Verlust oder Festhalten der Ware beim Zoll: Entschädigung auf Basis des angegebenen Warenwerts, höchstens 20 RMB pro Kilo, ohne Erstattung der Fracht. Schäden werden nicht entschädigt: Schließen Sie für wertvolle Ware eine Versicherung ab.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Ihre Seefracht-Schätzung: {total}",
    heading: "Ihre Schätzung von Sourcing Pick",
    intro:
      "Hier ist die Aufschlüsselung Ihrer Sendung per Schiff, berechnet mit dem Seefrachttarif Europa unseres Spediteurs und allen seinen Regeln.",
    summary: {
      regime: "Verzollung",
      delivery: "Lieferung",
      cartons: "Kartons",
      real: "Ist-Gewicht",
      volumetric: "Volumengewicht",
      chargeable: "Abrechnungsgewicht",
      bracket: "Staffel und Tarif",
      delay: "Laufzeit",
    },
    items: {
      freight: "Seefracht ({kg} kg × {rate} RMB/kg)",
      goods: "Produktzuschlag ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Nicht-Amazon-Adresse (+1 RMB/kg, mindestens 100 RMB bei nur einem Packstück)",
      singleCarton: "Sendung mit nur einem Packstück",
      oversize: "Sperrige oder schwere Packstücke ({cartons} Kartons)",
      phones: "Telefone ({units} × 3 RMB)",
      vatClearance: "Verzollung über Ihre USt-IdNr.",
      declaration: "Separate Ausfuhranmeldung ({pages} Seite(n))",
      designations: "Produkte über 5 hinaus ({extra} × 30 RMB)",
      signature: "UPS-Zustellung gegen Unterschrift ({cartons} × 30 RMB)",
      scooters: "Roller und Laufbänder ({units} × 7,50 €)",
      bikes: "Fahrräder ({units} × 75 €)",
    },
    subtotal: "Zwischensumme Transport",
    commission: "Provision von Sourcing Pick (3 % der Fracht)",
    total: "Geschätzter Gesamtbetrag",
    notIncludedTitle: "Nicht enthalten",
    notIncluded: [
      "Abgelegene Gebiete, Adressänderung, Kosten einer Zollkontrolle",
      "Einfuhrumsatzsteuer und Zölle bei Verzollung über Ihre USt-IdNr.",
      "Versicherung",
      "Unsere Lagerleistungen in Guangzhou (Wareneingang, Prüfung, Verstärkung, Beladung), in Ihrem Angebot kalkuliert",
    ],
    disclaimer:
      "Richtpreis, berechnet mit dem aktuellen Tarif unseres Spediteurs (wird demnächst aktualisiert). Den verbindlichen Preis finden Sie in Ihrem Angebot.",
    signup: "Erstellen Sie Ihr Konto bei Sourcing Pick, um aus dieser Schätzung ein Angebot zu machen:",
    signupCta: "Konto erstellen",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
