import type { SeaSimulatorCopy } from "../sea-simulator";

export const it: SeaSimulatorCopy = {
  eyebrow: "Stima la spedizione",
  title: "Quanto costerebbe la vostra spedizione via nave?",
  intro:
    "Indicate i vostri cartoni: calcoliamo il peso fatturabile e applichiamo, voce per voce, il tariffario marittimo Europa del nostro vettore. Il prezzo dettagliato vi viene inviato via email.",
  regime: {
    label: "Sdoganamento",
    ddp: "Tasse incluse",
    ddpHint: "Dazi e IVA all’importazione compresi nel prezzo.",
    vat: "Con la vostra partita IVA",
    vatHint: "IVA autoliquidata: servono una partita IVA e un EORI validi.",
  },
  deliverTo: {
    label: "Consegna",
    amazon: "Magazzino Amazon",
    other: "Altro indirizzo",
    thirdParty: "Magazzino logistico",
  },
  warehouse: { label: "Magazzino", byCountry: "Un altro magazzino Amazon (per paese)" },
  country: "Paese di consegna",
  carrier: {
    label: "Vettore",
    truck: "Camion fino al magazzino",
    upsDpd: "UPS o DPD, scelto da noi",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Tipo di merce",
    ordinary: "Merce ordinaria",
    plus1: "Cucina, illuminazione, legno, attrezzi, high-tech…",
    plus3: "Tessili, borse, pelle, cosmetici…",
    plus4: "Abbigliamento, scarpe, intimo…",
    refused: "Liquidi, polveri, batterie sfuse…",
    hint: "Il dettaglio di ogni categoria è più in basso, in «Come calcoliamo la vostra tariffa».",
  },
  units: {
    label: "Prodotti conteggiati al pezzo",
    phones: "Telefoni",
    scooters: "Monopattini, tapis roulant",
    bikes: "Biciclette",
  },
  cartons: {
    title: "I vostri cartoni",
    line: "Lotto {n}",
    quantity: "Cartoni",
    length: "Lungh. (cm)",
    width: "Largh. (cm)",
    height: "Alt. (cm)",
    weight: "Peso (kg)",
    add: "+ Aggiungi un lotto",
    remove: "Rimuovi",
  },
  designations: { label: "Referenze prodotto", hint: "Numero di prodotti diversi dichiarati." },
  options: {
    declaration: "Dichiarazione di esportazione separata",
    declarationHint: "350 RMB, +50 RMB per ogni pagina oltre la prima.",
    signature: "Firma alla consegna",
    signatureHint: "Consegne UPS: 30 RMB per collo.",
  },
  calc: {
    title: "Come viene calcolato",
    real: "Peso reale",
    volumetric: "Peso volumetrico",
    formula: "L × l × h ÷ 6.000",
    chargeable: "Peso fatturabile",
    chargeableHint: "Cartone per cartone, il più alto dei tre",
    bracket: "Scaglione",
    billed: "fatturati {kg} kg",
    volume: "Volume totale: {m3}",
    cartons: "{n} cartoni",
  },
  estimate: {
    title: "La vostra stima",
    mode: "Nave · Cina → Europa",
    delayLabel: "Tempi",
    delay: "da 40 a 45 giorni in tutto",
    surcharges: "Si aggiungono alla vostra spedizione",
    oversize: "Colli fuori misura: {n}",
    singleCarton: "Spedizione di un solo collo",
    nonAmazon: "Indirizzo non Amazon",
    vatClearance: "Sdoganamento con la vostra partita IVA",
  },
  warnings: {
    refusedGoods: "Questa merce non è accettata via mare.",
    refusedCarton:
      "Un cartone supera i limiti (65 kg, 270 cm su un lato, oppure lunghezza + 2 × (larghezza + altezza) oltre 400 cm): va reimballato.",
    tooManyDesignations: "Con tasse incluse, una spedizione comprende al massimo 5 referenze: oltre, prepariamo un preventivo.",
    noCartons: "Indicate almeno un cartone, con le sue dimensioni e il suo peso.",
  },
  gate: {
    locked: "Il prezzo compare dopo la registrazione",
    points: [
      "Il prezzo dettagliato, voce per voce, inviato via email",
      "Nolo, sovrapprezzi e la nostra commissione del 3%",
      "La vostra stima, pronta a diventare un preventivo",
    ],
    email: "La vostra email",
    emailPlaceholder: "nome@azienda.com",
    cta: "Vedi il prezzo",
    already: "Ho già un account",
    note: "Prezzi indicativi, il tariffario sarà aggiornato a breve. Il prezzo definitivo è indicato nel vostro preventivo.",
    sending: "Invio…",
    sent: "Inviato a {email}. Ora create il vostro account per ritrovare i vostri preventivi.",
    errors: {
      invalid_email: "Questo indirizzo email non sembra valido.",
      rate_limited: "Troppe richieste da questa connessione. Riprovate tra un’ora.",
      failed: "L’invio non è riuscito. Scriveteci su WhatsApp o a contact@sourcingpick.com.",
      invalid: "Controllate i campi: manca un’informazione per calcolare il prezzo.",
    },
  },
  rules: {
    title: "Come calcoliamo la vostra tariffa",
    intro:
      "Il prezzo deriva dal tariffario marittimo Europa del nostro vettore (compagnie EMC e COSCO). Ecco tutte le sue regole, così come si applicano alla vostra spedizione.",
    sections: [
      {
        title: "Il peso fatturabile",
        text:
          "Ogni cartone è fatturato sul più alto di tre pesi: il suo peso reale, il suo peso volumetrico (lunghezza × larghezza × altezza in cm ÷ 6.000) e un minimo di 12 kg per cartone (10 kg per i magazzini Amazon serviti in camion, con tasse incluse). Poi si sommano i cartoni.",
      },
      {
        title: "Gli scaglioni di peso",
        text:
          "Il prezzo al chilo scende con il peso totale: da 21 a 70 kg, da 71 a 299 kg, da 300 kg in su. Una spedizione viene fatturata per almeno 21 kg, e per almeno 71 kg sulle linee in camion che partono da 71 kg.",
      },
      {
        title: "Tasse incluse o con la vostra partita IVA",
        text:
          "Tasse incluse: dazi e IVA all’importazione sono compresi nel prezzo, al massimo 5 referenze di prodotto per spedizione. Con la vostra partita IVA: fornite una partita IVA e un EORI validi, l’IVA all’importazione è autoliquidata; 380 RMB di spese di sdoganamento per spedizione, dazi e imposte riaddebitati al costo effettivo, 30 RMB per ogni referenza oltre le 5. In caso di controllo doganale: 900 € di movimentazione ripartiti tra i lotti del container, e 3 € per pallet e per giorno di stoccaggio.",
      },
      {
        title: "La destinazione",
        text:
          "Magazzini Amazon serviti in camion, consegna con UPS o DPD (vettore scelto da noi) in Germania, Francia, Italia e Spagna, oppure con UPS in 23 paesi. Un indirizzo che non è un magazzino Amazon (privato, azienda): +1 RMB al chilo, minimo 100 RMB per una spedizione di un solo collo.",
      },
      {
        title: "I sovrapprezzi in base alla merce",
        text:
          "+1 RMB/kg: utensili da cucina, apparecchi di illuminazione, ceramiche, accessori per auto e bici, articoli in legno o bambù, penne, tende da campeggio, attrezzi, videocamere, dashcam, apparecchi per la bellezza, lettori multimediali, robot aspirapolvere, videoproiettori, dischi rigidi, lampade solari, ombrelli, parrucche, valigie, droni, chiavette USB… +3 RMB/kg: articoli per adulti, cosmetici, forniture per l’abbigliamento, calzini, berretti, guanti, biancheria da letto, tessuti, borse, pelle. +4 RMB/kg: abbigliamento, scarpe, intimo, costumi da bagno e tutti i tessili che si indossano. Al pezzo: telefoni +3 RMB, monopattini e tapis roulant +7,50 €, biciclette +75 €. I sovrapprezzi si sommano.",
      },
      {
        title: "I colli fuori misura",
        text:
          "Rifiutati: oltre 65 kg, un lato di oltre 270 cm, oppure lunghezza + 2 × (larghezza + altezza) oltre 400 cm. Per ogni cartone si applica il sovrapprezzo più alto: 130 RMB tra 30 e 40 kg, o se il lato più lungo supera 100 cm o il secondo 76 cm; 600 RMB oltre 40 kg; 120 RMB se lunghezza + 2 × (larghezza + altezza) è tra 266 e 320 cm, 900 RMB tra 321 e 400 cm. Una spedizione di un solo collo: +80 RMB.",
      },
      {
        title: "Le opzioni",
        text:
          "Dichiarazione di esportazione separata: 350 RMB, +50 RMB per ogni pagina oltre la prima (5 righe per pagina). Firma alla consegna per UPS: 30 RMB per collo. Vettore scelto da voi: +1 RMB al chilo (+0,5 RMB per DHL sulla linea QOT Express).",
      },
      {
        title: "I tempi",
        text:
          "Chiusura il venerdì, partenza il mercoledì. Ritiro circa da 38 a 42 giorni dopo la partenza della nave; da 40 a 45 giorni in tutto.",
      },
      {
        title: "La nostra commissione",
        text: "3% sul nolo che vi riaddebitiamo, in una voce a parte del vostro preventivo.",
      },
      {
        title: "Cosa non comprende il prezzo",
        text:
          "Zone remote (sovrapprezzo riaddebitato in base alla fattura del vettore), cambio di indirizzo, spese di controllo doganale, IVA e dazi con la vostra partita IVA, assicurazione, e i nostri servizi di magazzino a Guangzhou (ricevimento, controllo, rinforzo, carico), quotati nel vostro preventivo.",
      },
      {
        title: "Le merci rifiutate",
        text:
          "Liquidi, polveri, prodotti contraffatti, batterie sfuse, batterie esterne, monocicli elettrici, tabacco, generi alimentari, medicinali, prodotti corrosivi, infiammabili o esplosivi, armi. I prodotti con batterie integrate e i prodotti magnetici sono accettati. Una merce sensibile scoperta al controllo prima dell’esportazione costa 3.000 RMB di multa, più il rientro della merce e 8 RMB/kg di movimentazione.",
      },
      {
        title: "L’imballaggio",
        text:
          "Tutti i prodotti devono riportare la dicitura MADE IN CHINA; i tessili, la pelle, i bagagli e le scarpe, anche un’etichetta di composizione e manutenzione. Per Amazon: due etichette con codice a barre per l’ingresso in magazzino su ogni cartone, etichette SKU e FBA protette da nastro trasparente. Evitate il nastro adesivo giallo.",
      },
      {
        title: "In caso di perdita",
        text:
          "Perdita o blocco in dogana: indennizzo sul valore dichiarato, entro il limite di 20 RMB al chilo, senza rimborso del nolo. I danni non sono indennizzati: per una merce di valore, prevedete un’assicurazione.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "La vostra stima di nolo marittimo: {total}",
    heading: "La vostra stima Sourcing Pick",
    intro:
      "Ecco il dettaglio della vostra spedizione via nave, calcolato con il tariffario marittimo Europa del nostro vettore e tutte le sue regole.",
    summary: {
      regime: "Sdoganamento",
      delivery: "Consegna",
      cartons: "Cartoni",
      real: "Peso reale",
      volumetric: "Peso volumetrico",
      chargeable: "Peso fatturabile",
      bracket: "Scaglione e tariffa",
      delay: "Tempi",
    },
    items: {
      freight: "Nolo marittimo ({kg} kg × {rate} RMB/kg)",
      goods: "Sovrapprezzo merce ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Indirizzo non Amazon (+1 RMB/kg, minimo 100 RMB per un solo collo)",
      singleCarton: "Spedizione di un solo collo",
      oversize: "Colli fuori misura ({cartons} cartoni)",
      phones: "Telefoni ({units} × 3 RMB)",
      vatClearance: "Sdoganamento con la vostra partita IVA",
      declaration: "Dichiarazione di esportazione separata ({pages} pag.)",
      designations: "Referenze oltre le 5 ({extra} × 30 RMB)",
      signature: "Firma alla consegna UPS ({cartons} × 30 RMB)",
      scooters: "Monopattini e tapis roulant ({units} × 7,50 €)",
      bikes: "Biciclette ({units} × 75 €)",
    },
    subtotal: "Subtotale trasporto",
    commission: "Commissione Sourcing Pick (3% del nolo)",
    total: "Totale stimato",
    notIncludedTitle: "Non compreso",
    notIncluded: [
      "Zone remote, cambio di indirizzo, spese di controllo doganale",
      "IVA e dazi all’importazione con la vostra partita IVA",
      "Assicurazione",
      "I nostri servizi di magazzino a Guangzhou (ricevimento, controllo, rinforzo, carico), quotati nel vostro preventivo",
    ],
    disclaimer:
      "Prezzo indicativo, calcolato con il tariffario attuale del nostro vettore (che sarà aggiornato a breve). Il prezzo definitivo è indicato nel vostro preventivo.",
    signup: "Create il vostro account Sourcing Pick per trasformare questa stima in un preventivo:",
    signupCta: "Crea il mio account",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
