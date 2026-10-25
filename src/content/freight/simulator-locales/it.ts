import type { FreightSimulatorCopy } from "../simulator";

export const it: FreightSimulatorCopy = {
  eyebrow: "Simulatore di trasporto",
  title: "Quanto costerebbe la vostra spedizione?",
  intro:
    "Indicate il vostro indirizzo e i vostri prodotti: calcoliamo il peso volumetrico di ciascuno e applichiamo il tariffario Europa del nostro vettore. Il prezzo dettagliato vi viene inviato via email.",
  mode: {
    label: "Modalità di trasporto",
    names: { sea: "Nave", air: "Aereo", truck: "Camion", rail: "Treno" },
    recommended: "Consigliata",
    discouraged: "Sconsigliato",
    hints: {
      sea: "La più economica, ed è quella che consigliamo: da 40 a 45 giorni in tutto.",
      air: "Il più rapido: da 7 a 10 giorni lavorativi. Per una spedizione piccola o urgente.",
      truck: "Più rischioso: non lo consigliamo. Da 16 a 20 giorni circa.",
      rail: "Anche questo non lo consigliamo. Da 35 a 38 giorni dopo la partenza del treno.",
    },
  },
  formula: {
    label: "Formula",
    names: { ddp: "Consegnato, tasse incluse", fob: "FOB", customs: "Fino alla dogana" },
    hints: {
      ddp: "Consegnato al vostro indirizzo, dazi e IVA all’importazione compresi (DDP).",
      fob: "Consegnato al porto o all’aeroporto di partenza in Cina; poi subentra il vostro spedizioniere. Prezzo su preventivo.",
      customs: "Trasportato fino alla dogana di arrivo; voi sdoganate e ritirate la merce. Prezzo su preventivo.",
    },
  },
  address: {
    title: "Indirizzo di consegna",
    street: "Indirizzo",
    postcode: "CAP",
    city: "Città",
    country: "Paese",
  },
  products: {
    title: "I vostri prodotti",
    item: "Prodotto {n}",
    name: "Nome del prodotto",
    namePlaceholder: "Es.: lampade da scrivania",
    goods: "Tipo di merce",
    cartons: "Cartoni",
    length: "Lungh. (cm)",
    width: "Largh. (cm)",
    height: "Alt. (cm)",
    weight: "Peso (kg)",
    cartonHint: "Dimensioni e peso di un cartone.",
    units: "Numero di pezzi",
    battery: "Contiene una batteria",
    reinforce: "Rinforzo in legno",
    reinforceHint: "15 $ al m³, nel nostro magazzino di Guangzhou.",
    add: "+ Aggiungi un prodotto",
    remove: "Rimuovi",
    summary: "{m3} · {real} reali · {volumetric} volumetrici · {chargeable} fatturabili",
    goodsReset: "L’elenco delle merci dipende dalla modalità: controllate il tipo di ogni prodotto.",
  },
  goods: {
    sea: {
      ordinary: "Merce ordinaria",
      kg1: "+1 RMB/kg: cucina, illuminazione, ceramica, legno, attrezzi, videocamere, droni…",
      kg3: "+3 RMB/kg: borse, pelle, tessuti, biancheria da letto, calzini, cosmetici…",
      kg4: "+4 RMB/kg: abbigliamento, scarpe, intimo, costumi da bagno…",
      phones: "Telefoni cellulari: +3 RMB per telefono",
      scooters: "Monopattini, tapis roulant: +7,50 € al pezzo",
      bikes: "Biciclette: +75 € al pezzo",
      refused: "Rifiutati: liquidi, polveri, batterie sfuse, prodotti contraffatti…",
    },
    air: {
      ordinary: "Merce ordinaria",
      kg1: "+1 RMB/kg: articoli in legno, ferramenta, metallo, cover e cavi per telefono…",
      kg2: "+2 RMB/kg: illuminazione, ceramica, cosmetici, apparecchi per la bellezza, videocamere, dischi rigidi…",
      kg3: "+3 RMB/kg: giocattoli, pelle, accessori tessili",
      kg5: "+5 RMB/kg: orologi, sigarette elettroniche senza liquido",
      kg7: "+7 RMB/kg: abbigliamento, scarpe, tessili, telefoni, computer, tablet, droni",
      refused: "Rifiutati: liquidi, polveri, batterie sfuse, prodotti contraffatti…",
    },
    truck: {
      ordinary: "Merce ordinaria",
      kg1: "+1 RMB/kg: pelle, utensili da cucina, lampade LED, giocattoli, cuffie, prodotti Bluetooth…",
      kg2: "+2 RMB/kg: ferramenta, apparecchi per la bellezza, dashcam, GPS, penne, articoli per adulti…",
      kg3: "+3 RMB/kg: parrucche, tessili (esclusi abbigliamento e scarpe)",
      kg4: "+4 RMB/kg: tablet",
      kg5: "+5 RMB/kg: abbigliamento, calzini, pantaloni, pannelli solari, sigarette elettroniche usa e getta",
      kg8: "+8 RMB/kg: scarpe",
      pieces: "Orologi, chiavette USB, console, schede di memoria: +3 RMB al pezzo",
      phones: "Telefoni cellulari: +8 RMB per telefono",
      quote: "Occhiali, valigeria, droni, robot aspirapolvere, articoli in legno…: su preventivo",
      refused: "Rifiutati: liquidi, polveri, batterie sfuse, prodotti contraffatti…",
    },
    rail: {
      ordinary: "Merce ordinaria",
      kg1: "+1 RMB/kg: cucina, illuminazione, ceramica, legno, attrezzi, videocamere, droni…",
      kg2: "+2 RMB/kg: borse, pelle, tessuti, biancheria da letto, calzini, cosmetici…",
      kg4: "+4 RMB/kg: abbigliamento, scarpe, intimo, costumi da bagno…",
      phones: "Telefoni cellulari: +3 RMB per telefono",
      scooters: "Monopattini, tapis roulant: +7,50 € al pezzo",
      bikes: "Biciclette: +75 € al pezzo",
      refused: "Rifiutati: liquidi, polveri, batterie sfuse, prodotti contraffatti…",
    },
  },
  options: {
    declaration: "Dichiarazione di esportazione separata",
    declarationHint: "350 RMB per spedizione.",
    declarationHintSea: "350 RMB, +50 RMB per ogni pagina oltre la prima (5 prodotti per pagina).",
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
    delayLabel: "Tempi",
    delays: {
      sea: "da 40 a 45 giorni in tutto",
      air: "da 7 a 10 giorni lavorativi",
      truck: "da 16 a 20 giorni circa",
      rail: "da 35 a 38 giorni dopo la partenza",
    },
    surcharges: "Si aggiungono alla vostra spedizione",
    oversize: "Colli fuori misura: {n}",
    singleCarton: "Spedizione di un solo collo",
    battery: "Prodotti con batteria",
    reinforcement: "Rinforzo in legno: {m3}",
    declaration: "Dichiarazione di esportazione separata",
  },
  quote: {
    title: "Prezzo su preventivo",
    reasons: {
      formula: "In FOB o fino alla dogana, il prezzo è su preventivo: vi rispondiamo via email.",
      country: "Questa modalità non consegna in questo paese con tasse incluse: il prezzo è su preventivo.",
      air_battery:
        "In aereo, i prodotti con batteria viaggiano su una linea riservata ai magazzini Amazon e logistici: il prezzo è su preventivo.",
      too_many_products: "Oltre 5 prodotti diversi, il prezzo è su preventivo.",
      goods_quote: "Per questa merce il prezzo è su preventivo.",
    },
  },
  warnings: {
    refusedGoods: "Una delle vostre merci non è accettata con questa modalità di trasporto.",
    refusedCarton:
      "Un cartone supera i limiti (65 kg, 270 cm su un lato, oppure lunghezza + 2 × (larghezza + altezza) oltre 400 cm): va reimballato.",
    noProducts: "Indicate almeno un prodotto, con i suoi cartoni, le loro dimensioni e il loro peso.",
  },
  gate: {
    locked: "Il prezzo compare dopo la registrazione",
    lockedQuote: "Prezzo su preventivo: vi rispondiamo via email",
    points: [
      "Il prezzo dettagliato, voce per voce, inviato via email",
      "Trasporto, sovrapprezzi, rinforzo e la nostra commissione del 3%",
      "La vostra stima, pronta a diventare un preventivo",
    ],
    name: "Nome e cognome",
    phone: "Telefono (WhatsApp)",
    email: "La vostra email",
    emailPlaceholder: "nome@azienda.com",
    cta: "Vedi il prezzo",
    ctaQuote: "Ricevi il mio preventivo",
    already: "Ho già un account",
    note: "Prezzi indicativi, il tariffario sarà aggiornato a breve. Il prezzo definitivo è indicato nel vostro preventivo.",
    sending: "Invio…",
    sent: "Inviato a {email}. Ora create il vostro account per ritrovare i vostri preventivi.",
    sentQuote: "Richiesta ricevuta: vi rispondiamo a {email}. Ora create il vostro account per seguire i vostri preventivi.",
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
      "Il prezzo deriva dai tariffari Europa del nostro vettore: nave, aereo, camion e treno. Ecco le loro regole, così come si applicano alla vostra spedizione.",
    sections: [
      {
        title: "Il peso fatturabile",
        text:
          "Ogni cartone è fatturato sul più alto di tre pesi: il suo peso reale, il suo peso volumetrico (lunghezza × larghezza × altezza in cm ÷ 6.000) e 12 kg. Poi si sommano i cartoni di tutti i vostri prodotti.",
      },
      {
        title: "Le modalità e i loro tempi",
        text:
          "Nave: da 40 a 45 giorni in tutto, la più economica e quella che consigliamo. Aereo: da 7 a 10 giorni lavorativi, per una spedizione piccola o urgente. Camion: da 16 a 20 giorni circa, più rischioso, non lo consigliamo. Treno: da 35 a 38 giorni dopo la partenza del treno, anche questo non lo consigliamo. Il vettore dell’ultima tratta lo scegliamo noi.",
      },
      {
        title: "Gli scaglioni di peso",
        text:
          "Il prezzo al chilo scende con il peso totale. Nave: da 21 a 70 kg, da 71 a 299 kg, da 300 kg in su. Aereo: da 21 a 69 kg, da 70 a 99 kg, da 100 a 299 kg, da 300 kg in su. Camion: da 30 a 70 kg, da 71 a 100 kg, da 101 a 499 kg, da 500 kg in su (da 300 kg in su verso il Regno Unito). Treno: da 45 a 74 kg, da 75 a 299 kg, da 300 kg in su. Una spedizione viene fatturata per almeno 21 kg in nave e in aereo, 30 kg in camion e 45 kg in treno.",
      },
      {
        title: "Le formule",
        text:
          "Consegnato, tasse incluse (DDP): consegna al vostro indirizzo, dazi e IVA all’importazione compresi; al massimo 5 prodotti diversi per spedizione in nave, in aereo e in treno. FOB: la merce viene consegnata al porto o all’aeroporto di partenza in Cina, poi subentra il vostro spedizioniere. Fino alla dogana: la trasportiamo fino alla dogana di arrivo, voi la sdoganate e la ritirate. In FOB e fino alla dogana, il prezzo è su preventivo.",
      },
      {
        title: "I paesi serviti",
        text:
          "Ogni modalità consegna in un proprio elenco di paesi europei; il Regno Unito è servito solo in camion. Se la modalità scelta non consegna nel vostro paese, il prezzo è su preventivo.",
      },
      {
        title: "I sovrapprezzi in base alla merce",
        text:
          "Ogni modalità ha i suoi sovrapprezzi, al chilo fatturabile del prodotto interessato o al pezzo; l’elenco del modulo cambia con la modalità e riprende gli esempi del tariffario. Nave: +1, +3 o +4 RMB/kg; telefoni +3 RMB al pezzo, monopattini e tapis roulant +7,50 € al pezzo, biciclette +75 € al pezzo. Treno: +1, +2 o +4 RMB/kg, e gli stessi sovrapprezzi al pezzo. Aereo: +1, +2, +3, +5 o +7 RMB/kg. Camion: da +1 a +8 RMB/kg; orologi, chiavette USB, console e schede di memoria +3 RMB al pezzo, telefoni +8 RMB al pezzo; occhiali, valigeria, droni e articoli in legno su preventivo. I sovrapprezzi si sommano.",
      },
      {
        title: "I prodotti con batteria",
        text:
          "Accettati in nave e in treno. In camion: +100 RMB per spedizione. In aereo viaggiano su una linea in partenza da Hong Kong riservata ai magazzini Amazon e logistici: il prezzo è su preventivo.",
      },
      {
        title: "I colli fuori misura",
        text:
          "Rifiutati: oltre 65 kg, un lato di oltre 270 cm, oppure lunghezza + 2 × (larghezza + altezza) oltre 400 cm. Per ogni cartone si applica il sovrapprezzo più alto: 130 RMB tra 30 e 40 kg, o se il lato più lungo supera 100 cm o il secondo 76 cm; 600 RMB oltre 40 kg; 120 RMB se lunghezza + 2 × (larghezza + altezza) è tra 266 e 320 cm, 900 RMB tra 321 e 400 cm. Una spedizione di un solo collo: +80 RMB (+50 RMB in camion verso il Regno Unito).",
      },
      {
        title: "Il rinforzo in legno",
        text:
          "Per le merci fragili, rinforziamo i cartoni con il legno nel nostro magazzino di Guangzhou: 15 $ al m³ di prodotto rinforzato.",
      },
      {
        title: "La dichiarazione di esportazione separata",
        text:
          "350 RMB per spedizione; in nave, +50 RMB per ogni pagina oltre la prima (5 righe per pagina). In camion, la pratica di esportazione viene preparata gratuitamente.",
      },
      {
        title: "La nostra commissione",
        text: "3% sull’intera stima: trasporto, sovrapprezzi e rinforzo, in una voce a parte del vostro preventivo.",
      },
      {
        title: "Cosa non comprende il prezzo",
        text:
          "Zone remote (sovrapprezzo riaddebitato in base alla fattura del vettore), cambio di indirizzo, spese di controllo doganale, assicurazione, e gli altri nostri servizi di magazzino a Guangzhou (ricevimento, controllo, carico), quotati nel vostro preventivo.",
      },
      {
        title: "Le merci rifiutate",
        text:
          "Liquidi, polveri, prodotti contraffatti, batterie sfuse, batterie esterne, monocicli elettrici, tabacco, generi alimentari, medicinali, prodotti corrosivi, infiammabili o esplosivi, armi. Una merce sensibile scoperta al controllo prima dell’esportazione costa 3.000 RMB di multa, più il rientro della merce e 8 RMB/kg di movimentazione.",
      },
      {
        title: "L’imballaggio",
        text:
          "Tutti i prodotti devono riportare la dicitura MADE IN CHINA; i tessili, la pelle, i bagagli e le scarpe, anche un’etichetta di composizione e manutenzione. Evitate il nastro adesivo giallo.",
      },
      {
        title: "In caso di perdita",
        text:
          "Nave e treno: perdita o blocco in dogana indennizzati sul valore dichiarato, entro il limite di 20 RMB al chilo, senza rimborso del trasporto; i danni non sono indennizzati. Aereo e camion: 40 RMB al chilo in caso di perdita prima della presa in carico da parte di UPS o di sequestro in dogana, poi si applicano le regole di UPS, entro il limite di 100 USD per spedizione. Per una merce di valore, prevedete un’assicurazione.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "La vostra stima di trasporto: {total}",
    subjectQuote: "La vostra richiesta di preventivo di trasporto",
    heading: "La vostra stima Sourcing Pick",
    headingQuote: "La vostra richiesta di preventivo Sourcing Pick",
    intro: "Ecco il dettaglio della vostra spedizione, calcolato con il tariffario Europa del nostro vettore e tutte le sue regole.",
    introQuote: "Abbiamo ricevuto la vostra richiesta. Ecco cosa ci avete indicato; vi ricontatteremo con un preventivo.",
    summary: {
      mode: "Modalità",
      formula: "Formula",
      address: "Indirizzo di consegna",
      cartons: "Cartoni",
      real: "Peso reale",
      volumetric: "Peso volumetrico",
      chargeable: "Peso fatturabile",
      bracket: "Scaglione e tariffa",
      delay: "Tempi",
    },
    productsTitle: "I vostri prodotti",
    product: "{name}: {cartons} cartoni · {m3} · {chargeable} fatturabili",
    items: {
      freight: "Trasporto ({kg} kg × {rate} RMB/kg)",
      goods: "Sovrapprezzo merce, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × {rate} €",
      singleCarton: "Spedizione di un solo collo",
      oversize: "Colli fuori misura ({cartons} cartoni)",
      battery: "Prodotti con batteria",
      declaration: "Dichiarazione di esportazione separata ({pages} pag.)",
      reinforcement: "Rinforzo in legno ({m3} m³ × {rate} $)",
    },
    subtotal: "Subtotale",
    commission: "Commissione Sourcing Pick (3%)",
    total: "Totale stimato",
    notIncludedTitle: "Non compreso",
    notIncluded: [
      "Zone remote, cambio di indirizzo, spese di controllo doganale",
      "Assicurazione",
      "Gli altri nostri servizi di magazzino a Guangzhou (ricevimento, controllo, carico), quotati nel vostro preventivo",
    ],
    disclaimer:
      "Prezzo indicativo, calcolato con il tariffario attuale del nostro vettore (che sarà aggiornato a breve). Il prezzo definitivo è indicato nel vostro preventivo.",
    quoteNext: "Vi ricontatteremo con un preventivo dettagliato.",
    signup: "Create il vostro account Sourcing Pick per seguire i vostri preventivi:",
    signupCta: "Crea il mio account",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
