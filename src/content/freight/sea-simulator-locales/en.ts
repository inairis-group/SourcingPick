import type { SeaSimulatorCopy } from "../sea-simulator";

export const en: SeaSimulatorCopy = {
  eyebrow: "Estimate my shipment",
  title: "How much would your shipment cost by sea?",
  intro:
    "Enter your cartons: we calculate the chargeable weight and apply our carrier’s Europe sea freight rate card, line by line. The detailed price is sent to you by email.",
  regime: {
    label: "Customs clearance",
    ddp: "Taxes included",
    ddpHint: "Duties and import VAT included in the price.",
    vat: "Under your VAT number",
    vatHint: "Import VAT is reverse-charged: valid VAT and EORI numbers required.",
  },
  deliverTo: {
    label: "Delivery",
    amazon: "Amazon warehouse",
    other: "Other address",
    thirdParty: "Logistics warehouse",
  },
  warehouse: { label: "Warehouse", byCountry: "Another Amazon warehouse (by country)" },
  country: "Delivery country",
  carrier: {
    label: "Carrier",
    truck: "Truck to the warehouse",
    upsDpd: "UPS or DPD, chosen by us",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Type of goods",
    ordinary: "General cargo",
    plus1: "Kitchenware, lighting, wood, tools, tech…",
    plus3: "Textiles, bags, leather, cosmetics…",
    plus4: "Clothing, shoes, underwear…",
    refused: "Liquids, powders, standalone batteries…",
    hint: "Each category is detailed further down, under “How we calculate your price”.",
  },
  units: {
    label: "Products charged per unit",
    phones: "Phones",
    scooters: "Scooters, treadmills",
    bikes: "Bikes",
  },
  cartons: {
    title: "Your cartons",
    line: "Batch {n}",
    quantity: "Cartons",
    length: "Length (cm)",
    width: "Width (cm)",
    height: "Height (cm)",
    weight: "Weight (kg)",
    add: "+ Add a batch",
    remove: "Remove",
  },
  designations: { label: "Different products", hint: "Number of different products declared." },
  options: {
    declaration: "Separate export declaration",
    declarationHint: "350 RMB, +50 RMB per page after the first.",
    signature: "Signature on delivery",
    signatureHint: "UPS deliveries: 30 RMB per package.",
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
    mode: "Sea · China → Europe",
    delayLabel: "Transit time",
    delay: "40 to 45 days end to end",
    surcharges: "Added to your shipment",
    oversize: "Oversize packages: {n}",
    singleCarton: "Single-package shipment",
    nonAmazon: "Non-Amazon address",
    vatClearance: "Customs clearance under your VAT number",
  },
  warnings: {
    refusedGoods: "These goods are not accepted for sea freight.",
    refusedCarton:
      "A carton exceeds the limits (65 kg, 270 cm on one side, or length + 2 × (width + height) over 400 cm): it must be repacked.",
    tooManyDesignations:
      "With taxes included, a shipment can contain at most 5 different products: beyond that, we draw up a quotation.",
    noCartons: "Enter at least one carton, with its dimensions and weight.",
  },
  gate: {
    locked: "The price appears after sign-up",
    points: [
      "The detailed price, line by line, sent by email",
      "Freight, surcharges and our 3% commission",
      "Your estimate, ready to become a quotation",
    ],
    email: "Your email",
    emailPlaceholder: "you@company.com",
    cta: "See the price",
    already: "I already have an account",
    note: "Indicative prices; the rate card will be updated soon. The firm price is shown on your quotation.",
    sending: "Sending…",
    sent: "Sent to {email}. Now create your account to access your quotations.",
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
      "The price comes from our carrier’s Europe sea freight rate card (shipping lines EMC and COSCO). Here are all its rules, as they apply to your shipment.",
    sections: [
      {
        title: "Chargeable weight",
        text:
          "Each carton is billed at the highest of three weights: its actual weight, its volumetric weight (length × width × height in cm ÷ 6,000) and a minimum of 12 kg per carton (10 kg for Amazon warehouses delivered by truck, with taxes included). The cartons are then added together.",
      },
      {
        title: "Weight brackets",
        text:
          "The price per kilo goes down as the total weight goes up: 21 to 70 kg, 71 to 299 kg, 300 kg and over. A shipment is billed for at least 21 kg, and at least 71 kg on the truck lines that start at 71 kg.",
      },
      {
        title: "Taxes included or under your VAT number",
        text:
          "Taxes included: duties and import VAT are included in the price, with at most 5 different products per shipment. Under your VAT number: you provide a valid VAT number and EORI, and import VAT is reverse-charged; 380 RMB customs clearance fee per shipment, duties and taxes passed on at actual cost, 30 RMB for each product beyond 5. In the event of a customs inspection: €900 handling fee, shared among the consignments in the container, and €3 per pallet per day of storage.",
      },
      {
        title: "Destination",
        text:
          "Amazon warehouses delivered by truck, delivery by UPS or DPD (carrier chosen by us) in Germany, France, Italy and Spain, or by UPS in 23 countries. An address that is not an Amazon warehouse (private individual, business): +1 RMB per kilo, minimum 100 RMB for a single-package shipment.",
      },
      {
        title: "Surcharges by type of goods",
        text:
          "+1 RMB/kg: kitchen utensils, lighting, ceramics, car and bike accessories, wood or bamboo items, pens, tents, tools, cameras, dashcams, beauty devices, media players, robot vacuums, projectors, hard drives, solar lamps, umbrellas, wigs, suitcases, drones, USB sticks… +3 RMB/kg: adult products, cosmetics, garment accessories, socks, beanies, gloves, bed linen, fabrics, bags, leather. +4 RMB/kg: clothing, shoes, underwear, swimwear and all textiles that are worn. Per unit: phones +3 RMB, scooters and treadmills +€7.50, bikes +€75. Surcharges are cumulative.",
      },
      {
        title: "Oversize packages",
        text:
          "Refused: over 65 kg, one side over 270 cm, or length + 2 × (width + height) over 400 cm. For each carton, the highest surcharge applies: 130 RMB between 30 and 40 kg, or if the longest side exceeds 100 cm or the second-longest exceeds 76 cm; 600 RMB over 40 kg; 120 RMB if length + 2 × (width + height) is between 266 and 320 cm, 900 RMB between 321 and 400 cm. A single-package shipment: +80 RMB.",
      },
      {
        title: "Options",
        text:
          "Separate export declaration: 350 RMB, +50 RMB per page after the first (5 lines per page). Signature on delivery for UPS: 30 RMB per package. Carrier specified by you: +1 RMB per kilo (+0.5 RMB for DHL on the QOT Express line).",
      },
      {
        title: "Transit times",
        text:
          "Cut-off on Friday, departure on Wednesday. Collection about 38 to 42 days after the ship sails; 40 to 45 days end to end.",
      },
      {
        title: "Our commission",
        text: "3% on the freight we pass on to you, on a separate line of your quotation.",
      },
      {
        title: "What the price doesn’t include",
        text:
          "Remote areas (surcharge passed on as invoiced by the carrier), change of address, customs inspection fees, VAT and duties under your VAT number, insurance, and our warehouse services in Guangzhou (receiving, inspection, reinforcement, loading), priced on your quotation.",
      },
      {
        title: "Refused goods",
        text:
          "Liquids, powders, counterfeits, standalone batteries, power banks, electric unicycles, tobacco, foodstuffs, medicines, corrosive, flammable or explosive products, weapons. Products with built-in batteries and magnetic products are accepted. Sensitive goods found during the pre-export check cost a 3,000 RMB fine, plus the return and 8 RMB/kg in handling.",
      },
      {
        title: "Packaging",
        text:
          "All products must be marked MADE IN CHINA; textiles, leather, luggage and shoes must also carry a composition and care label. For Amazon: two warehouse check-in barcode labels on every carton, with SKU and FBA labels protected by clear tape. Avoid yellow adhesive tape.",
      },
      {
        title: "In case of loss",
        text:
          "Loss or goods held at customs: compensation based on the declared value, up to 20 RMB per kilo, with no refund of the freight. Damage is not compensated: for valuable goods, take out insurance.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Your ocean freight estimate: {total}",
    heading: "Your Sourcing Pick estimate",
    intro:
      "Here is the breakdown of your sea shipment, calculated with our carrier’s Europe sea freight rate card and all its rules.",
    summary: {
      regime: "Customs clearance",
      delivery: "Delivery",
      cartons: "Cartons",
      real: "Actual weight",
      volumetric: "Volumetric weight",
      chargeable: "Chargeable weight",
      bracket: "Weight bracket and rate",
      delay: "Transit time",
    },
    items: {
      freight: "Ocean freight ({kg} kg × {rate} RMB/kg)",
      goods: "Goods surcharge ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Non-Amazon address (+1 RMB/kg, minimum 100 RMB for a single package)",
      singleCarton: "Single-package shipment",
      oversize: "Oversize packages ({cartons} cartons)",
      phones: "Phones ({units} × 3 RMB)",
      vatClearance: "Customs clearance under your VAT number",
      declaration: "Separate export declaration ({pages} page(s))",
      designations: "Products beyond 5 ({extra} × 30 RMB)",
      signature: "UPS signature on delivery ({cartons} × 30 RMB)",
      scooters: "Scooters and treadmills ({units} × €7.50)",
      bikes: "Bikes ({units} × €75)",
    },
    subtotal: "Transport subtotal",
    commission: "Sourcing Pick commission (3% of freight)",
    total: "Estimated total",
    notIncludedTitle: "Not included",
    notIncluded: [
      "Remote areas, change of address, customs inspection fees",
      "VAT and import duties under your VAT number",
      "Insurance",
      "Our warehouse services in Guangzhou (receiving, inspection, reinforcement, loading), priced on your quotation",
    ],
    disclaimer:
      "Indicative price, based on our carrier’s current rate card (to be updated soon). The firm price is shown on your quotation.",
    signup: "Create your Sourcing Pick account to turn this estimate into a quotation:",
    signupCta: "Create my account",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
