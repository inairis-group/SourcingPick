import type { FreightSimulatorCopy } from "../simulator";

export const en: FreightSimulatorCopy = {
  eyebrow: "Shipping calculator",
  title: "How much would your shipment cost?",
  intro:
    "Enter your address and your products: we calculate the volumetric weight of each one and apply our carrier’s Europe rate card. The detailed price is sent to you by email.",
  mode: {
    label: "Transport mode",
    names: { sea: "Sea", air: "Air", truck: "Road", rail: "Rail" },
    recommended: "Recommended",
    discouraged: "Not recommended",
    hints: {
      sea: "The cheapest, and the one we recommend: 40 to 45 days end to end.",
      air: "The fastest: 7 to 10 working days. For a small or urgent shipment.",
      truck: "Riskier: we don’t recommend it. About 16 to 20 days.",
      rail: "We don’t recommend it either. 35 to 38 days after the train departs.",
    },
  },
  formula: {
    label: "Delivery terms",
    names: { ddp: "Delivered, taxes included", fob: "FOB", customs: "Up to customs" },
    hints: {
      ddp: "Delivered to your address, duties and import VAT included (DDP).",
      fob: "Handed over at the port or airport of departure in China; your freight forwarder takes over from there. Price on quotation.",
      customs: "Carried as far as customs on arrival; you clear the goods through customs and collect them. Price on quotation.",
    },
  },
  address: {
    title: "Delivery address",
    street: "Address",
    postcode: "Postcode",
    city: "City",
    country: "Country",
  },
  products: {
    title: "Your products",
    item: "Product {n}",
    name: "Product name",
    namePlaceholder: "E.g. desk lamps",
    goods: "Type of goods",
    cartons: "Cartons",
    length: "Length (cm)",
    width: "Width (cm)",
    height: "Height (cm)",
    weight: "Weight (kg)",
    cartonHint: "Dimensions and weight of one carton.",
    units: "Number of units",
    battery: "Contains a battery",
    reinforce: "Reinforce with wood",
    reinforceHint: "$15 per m³, at our Guangzhou warehouse.",
    add: "+ Add a product",
    remove: "Remove",
    summary: "{m3} · {real} actual · {volumetric} volumetric · {chargeable} chargeable",
    goodsReset: "The list of goods depends on the transport mode: check the type of each product.",
  },
  goods: {
    sea: {
      ordinary: "General cargo",
      kg1: "+1 RMB/kg: kitchenware, lighting, ceramics, wood, tools, cameras, drones…",
      kg3: "+3 RMB/kg: bags, leather, fabrics, bed linen, socks, cosmetics…",
      kg4: "+4 RMB/kg: clothing, shoes, underwear, swimwear…",
      phones: "Mobile phones: +3 RMB per phone",
      scooters: "Scooters, treadmills: +€7.50 per unit",
      bikes: "Bikes: +€75 per unit",
      refused: "Refused: liquids, powders, standalone batteries, counterfeits…",
    },
    air: {
      ordinary: "General cargo",
      kg1: "+1 RMB/kg: wooden items, hardware, metal, phone cases and cables…",
      kg2: "+2 RMB/kg: lighting, ceramics, cosmetics, beauty devices, cameras, hard drives…",
      kg3: "+3 RMB/kg: toys, leather, accessory textiles",
      kg5: "+5 RMB/kg: watches, e-cigarettes without liquid",
      kg7: "+7 RMB/kg: clothing, shoes, textiles, phones, computers, tablets, drones",
      refused: "Refused: liquids, powders, standalone batteries, counterfeits…",
    },
    truck: {
      ordinary: "General cargo",
      kg1: "+1 RMB/kg: leather, kitchen utensils, LED lighting, toys, headphones, Bluetooth products…",
      kg2: "+2 RMB/kg: hardware, beauty devices, dashcams, GPS, pens, adult products…",
      kg3: "+3 RMB/kg: wigs, textiles (excluding clothing and shoes)",
      kg4: "+4 RMB/kg: tablets",
      kg5: "+5 RMB/kg: clothing, socks, trousers, solar panels, disposable e-cigarettes",
      kg8: "+8 RMB/kg: shoes",
      pieces: "Watches, USB sticks, consoles, memory cards: +3 RMB per piece",
      phones: "Mobile phones: +8 RMB per phone",
      quote: "Glasses, luggage, drones, robot vacuums, wooden items…: price on quotation",
      refused: "Refused: liquids, powders, standalone batteries, counterfeits…",
    },
    rail: {
      ordinary: "General cargo",
      kg1: "+1 RMB/kg: kitchenware, lighting, ceramics, wood, tools, cameras, drones…",
      kg2: "+2 RMB/kg: bags, leather, fabrics, bed linen, socks, cosmetics…",
      kg4: "+4 RMB/kg: clothing, shoes, underwear, swimwear…",
      phones: "Mobile phones: +3 RMB per phone",
      scooters: "Scooters, treadmills: +€7.50 per unit",
      bikes: "Bikes: +€75 per unit",
      refused: "Refused: liquids, powders, standalone batteries, counterfeits…",
    },
  },
  options: {
    declaration: "Separate export declaration",
    declarationHint: "350 RMB per shipment.",
    declarationHintSea: "350 RMB, +50 RMB per page after the first (5 products per page).",
  },
  calc: {
    title: "How it’s calculated",
    real: "Actual weight",
    volumetric: "Volumetric weight",
    formula: "L × W × H ÷ 6,000",
    chargeable: "Chargeable weight",
    chargeableHint: "Carton by carton, the highest of the three",
    bracket: "Weight bracket",
    billed: "billed {kg} kg",
    volume: "Total volume: {m3}",
    cartons: "{n} cartons",
  },
  estimate: {
    title: "Your estimate",
    delayLabel: "Transit time",
    delays: {
      sea: "40 to 45 days end to end",
      air: "7 to 10 working days",
      truck: "About 16 to 20 days",
      rail: "35 to 38 days after departure",
    },
    surcharges: "Added to your shipment",
    oversize: "Oversize packages: {n}",
    singleCarton: "Single-package shipment",
    battery: "Products with batteries",
    reinforcement: "Wood reinforcement: {m3}",
    declaration: "Separate export declaration",
  },
  quote: {
    title: "Price on quotation",
    reasons: {
      formula: "For FOB or up to customs, pricing is by quotation: we’ll reply by email.",
      country: "This mode doesn’t deliver to this country with taxes included: pricing is by quotation.",
      air_battery:
        "By air, products with batteries go on a line reserved for Amazon and logistics warehouses: pricing is by quotation.",
      too_many_products: "Beyond 5 different products, pricing is by quotation.",
      goods_quote: "These goods are priced by quotation.",
    },
  },
  warnings: {
    refusedGoods: "One of your products is not accepted for this transport mode.",
    refusedCarton:
      "A carton exceeds the limits (65 kg, 270 cm on one side, or length + 2 × (width + height) over 400 cm): it must be repacked.",
    noProducts: "Enter at least one product, with its cartons, their dimensions and their weight.",
  },
  gate: {
    locked: "The price appears after sign-up",
    lockedQuote: "Price on quotation: we’ll reply by email",
    points: [
      "The detailed price, line by line, sent by email",
      "Freight, surcharges, reinforcement and our 3% commission",
      "Your estimate, ready to become a quotation",
    ],
    name: "Full name",
    phone: "Phone (WhatsApp)",
    email: "Your email",
    emailPlaceholder: "you@company.com",
    cta: "See the price",
    ctaQuote: "Get my quotation",
    already: "I already have an account",
    note: "Indicative prices; the rate card will be updated soon. The firm price is shown on your quotation.",
    sending: "Sending…",
    sent: "Sent to {email}. Now create your account to access your quotations.",
    sentQuote: "Request received: we’ll reply to {email}. Now create your account to track your quotations.",
    errors: {
      invalid_email: "This email address doesn’t look valid.",
      rate_limited: "Too many requests from this connection. Please try again in an hour.",
      failed: "We couldn’t send it. Message us on WhatsApp or write to contact@sourcingpick.com.",
      invalid: "Please check the fields: some information needed to calculate the price is missing.",
    },
  },
  rules: {
    title: "How we calculate your price",
    intro:
      "The price comes from our carrier’s Europe rate cards: sea, air, road and rail. Here are their rules, as they apply to your shipment.",
    sections: [
      {
        title: "Chargeable weight",
        text:
          "Each carton is billed at the highest of three weights: its actual weight, its volumetric weight (length × width × height in cm ÷ 6,000) and 12 kg. The cartons of all your products are then added together.",
      },
      {
        title: "Modes and transit times",
        text:
          "Sea: 40 to 45 days end to end, the cheapest and the one we recommend. Air: 7 to 10 working days, for a small or urgent shipment. Road: about 16 to 20 days; it’s riskier and we don’t recommend it. Rail: 35 to 38 days after the train departs; we don’t recommend it either. We choose the carrier for the final leg.",
      },
      {
        title: "Weight brackets",
        text:
          "The price per kilo goes down as the total weight goes up. Sea: 21 to 70 kg, 71 to 299 kg, 300 kg and over. Air: 21 to 69 kg, 70 to 99 kg, 100 to 299 kg, 300 kg and over. Road: 30 to 70 kg, 71 to 100 kg, 101 to 499 kg, 500 kg and over (300 kg and over to the United Kingdom). Rail: 45 to 74 kg, 75 to 299 kg, 300 kg and over. A shipment is billed for at least 21 kg by sea and by air, 30 kg by road and 45 kg by rail.",
      },
      {
        title: "Delivery terms",
        text:
          "Delivered, taxes included (DDP): delivery to your address, duties and import VAT included; at most 5 different products per shipment by sea, air and rail. FOB: the goods are handed over at the port or airport of departure in China, and your freight forwarder takes over. Up to customs: we carry the goods as far as customs on arrival; you clear them through customs and collect them. For FOB and up to customs, pricing is by quotation.",
      },
      {
        title: "Countries served",
        text:
          "Each mode delivers to its own list of European countries; the United Kingdom is served by road only. If the mode you choose doesn’t deliver to your country, pricing is by quotation.",
      },
      {
        title: "Surcharges by type of goods",
        text:
          "Each mode has its own surcharges, per chargeable kilo of the product concerned or per unit; the list in the form changes with the mode and uses the examples from the rate card. Sea: +1, +3 or +4 RMB/kg; phones +3 RMB per piece, scooters and treadmills +€7.50 per unit, bikes +€75 per unit. Rail: +1, +2 or +4 RMB/kg, and the same per-unit surcharges. Air: +1, +2, +3, +5 or +7 RMB/kg. Road: from +1 to +8 RMB/kg; watches, USB sticks, consoles and memory cards +3 RMB per piece, phones +8 RMB per piece; glasses, luggage, drones and wooden items on quotation. Surcharges are cumulative.",
      },
      {
        title: "Products with batteries",
        text:
          "Accepted by sea and by rail. By road: +100 RMB per shipment. By air, they go on a line departing from Hong Kong that is reserved for Amazon and logistics warehouses: pricing is by quotation.",
      },
      {
        title: "Oversize packages",
        text:
          "Refused: over 65 kg, one side over 270 cm, or length + 2 × (width + height) over 400 cm. For each carton, the highest surcharge applies: 130 RMB between 30 and 40 kg, or if the longest side exceeds 100 cm or the second-longest exceeds 76 cm; 600 RMB over 40 kg; 120 RMB if length + 2 × (width + height) is between 266 and 320 cm, 900 RMB between 321 and 400 cm. A single-package shipment: +80 RMB (+50 RMB by road to the United Kingdom).",
      },
      {
        title: "Wood reinforcement",
        text:
          "For fragile goods, we reinforce the cartons with wood at our Guangzhou warehouse: $15 per m³ of the reinforced product.",
      },
      {
        title: "Separate export declaration",
        text:
          "350 RMB per shipment; by sea, +50 RMB per page after the first (5 lines per page). By road, the export paperwork is prepared free of charge.",
      },
      {
        title: "Our commission",
        text: "3% on the whole estimate: freight, surcharges and reinforcement, on a separate line of your quotation.",
      },
      {
        title: "What the price doesn’t include",
        text:
          "Remote areas (surcharge passed on as invoiced by the carrier), change of address, customs inspection fees, insurance, and our other warehouse services in Guangzhou (receiving, inspection, loading), priced on your quotation.",
      },
      {
        title: "Refused goods",
        text:
          "Liquids, powders, counterfeits, standalone batteries, power banks, electric unicycles, tobacco, foodstuffs, medicines, corrosive, flammable or explosive products, weapons. Sensitive goods found during the pre-export check cost a 3,000 RMB fine, plus the return and 8 RMB/kg in handling.",
      },
      {
        title: "Packaging",
        text:
          "All products must be marked MADE IN CHINA; textiles, leather, luggage and shoes must also carry a composition and care label. Avoid yellow adhesive tape.",
      },
      {
        title: "In case of loss",
        text:
          "Sea and rail: for loss or goods held at customs, compensation based on the declared value, up to 20 RMB per kilo, with no refund of the freight; damage is not compensated. Air and road: 40 RMB per kilo for loss before UPS takes charge of the goods or for seizure at customs, then UPS’s rules apply, up to 100 USD per shipment. For valuable goods, take out insurance.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Your shipping estimate: {total}",
    subjectQuote: "Your shipping quotation request",
    heading: "Your Sourcing Pick estimate",
    headingQuote: "Your Sourcing Pick quotation request",
    intro: "Here is the breakdown of your shipment, calculated with our carrier’s Europe rate card and all its rules.",
    introQuote: "We have received your request. Here is what you told us; we’ll get back to you with a quotation.",
    summary: {
      mode: "Transport mode",
      formula: "Delivery terms",
      address: "Delivery address",
      cartons: "Cartons",
      real: "Actual weight",
      volumetric: "Volumetric weight",
      chargeable: "Chargeable weight",
      bracket: "Weight bracket and rate",
      delay: "Transit time",
    },
    productsTitle: "Your products",
    product: "{name}: {cartons} cartons · {m3} · {chargeable} chargeable",
    items: {
      freight: "Freight ({kg} kg × {rate} RMB/kg)",
      goods: "Goods surcharge, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × €{rate}",
      singleCarton: "Single-package shipment",
      oversize: "Oversize packages ({cartons} cartons)",
      battery: "Products with batteries",
      declaration: "Separate export declaration ({pages} page(s))",
      reinforcement: "Wood reinforcement ({m3} m³ × ${rate})",
    },
    subtotal: "Subtotal",
    commission: "Sourcing Pick commission (3%)",
    total: "Estimated total",
    notIncludedTitle: "Not included",
    notIncluded: [
      "Remote areas, change of address, customs inspection fees",
      "Insurance",
      "Our other warehouse services in Guangzhou (receiving, inspection, loading), priced on your quotation",
    ],
    disclaimer:
      "Indicative price, based on our carrier’s current rate card (to be updated soon). The firm price is shown on your quotation.",
    quoteNext: "We’ll get back to you with a detailed quotation.",
    signup: "Create your Sourcing Pick account to track your quotations:",
    signupCta: "Create my account",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
