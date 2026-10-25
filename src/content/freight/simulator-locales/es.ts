import type { FreightSimulatorCopy } from "../simulator";

export const es: FreightSimulatorCopy = {
  eyebrow: "Simulador de transporte",
  title: "¿Cuánto costaría su envío?",
  intro:
    "Indique su dirección y sus productos: calculamos el peso volumétrico de cada uno y aplicamos la tabla de tarifas para Europa de nuestro transportista. Le enviamos el precio detallado por correo electrónico.",
  mode: {
    label: "Modo de transporte",
    names: { sea: "Barco", air: "Avión", truck: "Camión", rail: "Tren" },
    recommended: "Recomendado",
    discouraged: "Desaconsejado",
    hints: {
      sea: "El más económico, y el que recomendamos: de 40 a 45 días de principio a fin.",
      air: "El más rápido: de 7 a 10 días hábiles. Para un envío pequeño o urgente.",
      truck: "Más arriesgado: no lo recomendamos. Unos 16 a 20 días.",
      rail: "Tampoco lo recomendamos. De 35 a 38 días después de la salida del tren.",
    },
  },
  formula: {
    label: "Modalidad",
    names: { ddp: "Entregado, impuestos incluidos", fob: "FOB", customs: "Hasta la aduana" },
    hints: {
      ddp: "Entregado en su dirección, con derechos e IVA de importación incluidos (DDP).",
      fob: "Entregado en el puerto o el aeropuerto de salida en China; su transitario se encarga del resto. Precio bajo presupuesto.",
      customs: "Transportado hasta la aduana de llegada; usted realiza el despacho de aduanas y recoge la mercancía. Precio bajo presupuesto.",
    },
  },
  address: {
    title: "Dirección de entrega",
    street: "Dirección",
    postcode: "Código postal",
    city: "Ciudad",
    country: "País",
  },
  products: {
    title: "Sus productos",
    item: "Producto {n}",
    name: "Nombre del producto",
    namePlaceholder: "Ej.: lámparas de escritorio",
    goods: "Tipo de mercancía",
    cartons: "Cajas",
    length: "Largo (cm)",
    width: "Ancho (cm)",
    height: "Alto (cm)",
    weight: "Peso (kg)",
    cartonHint: "Dimensiones y peso de una caja.",
    units: "Número de unidades",
    battery: "Contiene batería",
    reinforce: "Reforzar con madera",
    reinforceHint: "15 $ por m³, en nuestro almacén de Guangzhou.",
    add: "+ Añadir un producto",
    remove: "Eliminar",
    summary: "{m3} · {volumetric} volumétricos",
    goodsReset: "La lista de mercancías depende del modo: compruebe el tipo de cada producto.",
  },
  goods: {
    sea: {
      ordinary: "Mercancía general",
      kg1: "+1 RMB/kg: cocina, luminarias, cerámica, madera, herramientas, cámaras, drones…",
      kg3: "+3 RMB/kg: bolsos, cuero, tejidos, ropa de cama, calcetines, cosméticos…",
      kg4: "+4 RMB/kg: ropa, calzado, ropa interior, bañadores…",
      phones: "Teléfonos móviles: +3 RMB por teléfono",
      scooters: "Patinetes, cintas de correr: +7,50 € por unidad",
      bikes: "Bicicletas: +75 € por unidad",
      refused: "Rechazado: líquidos, polvos, baterías sueltas, falsificaciones…",
    },
    air: {
      ordinary: "Mercancía general",
      kg1: "+1 RMB/kg: artículos de madera, ferretería, metal, fundas y cables de teléfono…",
      kg2: "+2 RMB/kg: luminarias, cerámica, cosméticos, aparatos de belleza, cámaras, discos duros…",
      kg3: "+3 RMB/kg: juguetes, cuero, complementos textiles",
      kg5: "+5 RMB/kg: relojes, cigarrillos electrónicos sin líquido",
      kg7: "+7 RMB/kg: ropa, calzado, textiles, teléfonos, ordenadores, tabletas, drones",
      refused: "Rechazado: líquidos, polvos, baterías sueltas, falsificaciones…",
    },
    truck: {
      ordinary: "Mercancía general",
      kg1: "+1 RMB/kg: cuero, utensilios de cocina, luminarias LED, juguetes, auriculares, productos Bluetooth…",
      kg2: "+2 RMB/kg: ferretería, aparatos de belleza, cámaras de salpicadero, GPS, bolígrafos, artículos para adultos…",
      kg3: "+3 RMB/kg: pelucas, textiles (salvo ropa y calzado)",
      kg4: "+4 RMB/kg: tabletas",
      kg5: "+5 RMB/kg: ropa, calcetines, pantalones, paneles solares, cigarrillos electrónicos desechables",
      kg8: "+8 RMB/kg: calzado",
      pieces: "Relojes, memorias USB, consolas, tarjetas de memoria: +3 RMB por pieza",
      phones: "Teléfonos móviles: +8 RMB por teléfono",
      quote: "Gafas, maletas, drones, robots aspiradores, artículos de madera…: bajo presupuesto",
      refused: "Rechazado: líquidos, polvos, baterías sueltas, falsificaciones…",
    },
    rail: {
      ordinary: "Mercancía general",
      kg1: "+1 RMB/kg: cocina, luminarias, cerámica, madera, herramientas, cámaras, drones…",
      kg2: "+2 RMB/kg: bolsos, cuero, tejidos, ropa de cama, calcetines, cosméticos…",
      kg4: "+4 RMB/kg: ropa, calzado, ropa interior, bañadores…",
      phones: "Teléfonos móviles: +3 RMB por teléfono",
      scooters: "Patinetes, cintas de correr: +7,50 € por unidad",
      bikes: "Bicicletas: +75 € por unidad",
      refused: "Rechazado: líquidos, polvos, baterías sueltas, falsificaciones…",
    },
  },
  options: {
    declaration: "Declaración de exportación separada",
    declarationHint: "350 RMB por envío.",
    declarationHintSea: "350 RMB, +50 RMB por cada página después de la primera (5 productos por página).",
  },
  calc: {
    title: "Peso facturado",
    rule: "El mayor entre el peso real y el peso volumétrico (L × An × Al ÷ 6000), con un mínimo de 12 kg por caja.",
    volumetric: "Peso volumétrico",
    bracket: "Tramo",
    billed: "se facturan {kg} kg",
    volume: "Volumen total: {m3}",
  },
  estimate: {
    title: "Su estimación",
    delayLabel: "Plazo",
    delays: {
      sea: "40 a 45 días de principio a fin",
      air: "7 a 10 días hábiles",
      truck: "unos 16 a 20 días",
      rail: "35 a 38 días después de la salida",
    },
    surcharges: "Se añaden a su envío",
    oversize: "Bultos fuera de norma: {n}",
    singleCarton: "Envío de un solo bulto",
    battery: "Productos con batería",
    reinforcement: "Refuerzo de madera: {m3}",
    declaration: "Declaración de exportación separada",
  },
  quote: {
    title: "Precio bajo presupuesto",
    reasons: {
      formula: "En FOB o hasta la aduana, el precio se fija en un presupuesto: le respondemos por correo electrónico.",
      country: "Este modo no entrega en este país con impuestos incluidos: el precio se fija en un presupuesto.",
      air_battery:
        "Por avión, los productos con batería viajan por una línea reservada a almacenes de Amazon y almacenes logísticos: el precio se fija en un presupuesto.",
      too_many_products: "Con más de 5 productos distintos, el precio se fija en un presupuesto.",
      goods_quote: "El precio de esta mercancía se fija en un presupuesto.",
    },
  },
  warnings: {
    refusedGoods: "Una de sus mercancías no se acepta en este modo de transporte.",
    refusedCarton:
      "Una caja supera los límites (65 kg, 270 cm en un lado, o largo + 2 × (ancho + alto) por encima de 400 cm): hay que volver a embalarla.",
    noProducts: "Indique al menos un producto, con sus cajas, sus dimensiones y su peso.",
  },
  gate: {
    locked: "El precio se muestra tras registrarse",
    lockedQuote: "Precio bajo presupuesto: le respondemos por correo electrónico",
    points: [
      "El precio detallado, línea por línea, enviado por correo electrónico",
      "Transporte, recargos, refuerzo y nuestra comisión del 3 %",
      "Su estimación, lista para convertirse en presupuesto",
    ],
    name: "Nombre y apellidos",
    phone: "Teléfono (WhatsApp)",
    email: "Su correo electrónico",
    emailPlaceholder: "usted@empresa.com",
    cta: "Ver el precio",
    ctaQuote: "Recibir mi presupuesto",
    already: "Ya tengo una cuenta",
    note: "Precios orientativos; la tabla de tarifas se actualizará próximamente. El precio en firme figura en su presupuesto.",
    sending: "Enviando…",
    sent: "Lo hemos enviado a {email}. Cree ahora su cuenta para consultar sus presupuestos.",
    sentQuote: "Solicitud recibida: le responderemos en {email}. Cree ahora su cuenta para hacer el seguimiento de sus presupuestos.",
    errors: {
      invalid_email: "Esta dirección de correo electrónico no parece válida.",
      rate_limited: "Demasiadas solicitudes desde esta conexión. Vuelva a intentarlo dentro de una hora.",
      failed: "No se ha podido enviar. Escríbanos por WhatsApp o a contact@sourcingpick.com.",
      invalid: "Revise los campos: falta un dato para calcular el precio.",
    },
  },
  rules: {
    title: "Cómo calculamos su precio",
    intro:
      "El precio procede de las tablas de tarifas para Europa de nuestro transportista: barco, avión, camión y tren. Estas son sus reglas, tal como se aplican a su envío.",
    sections: [
      {
        title: "El peso facturable",
        text:
          "Cada caja se factura según el mayor de tres pesos: su peso real, su peso volumétrico (largo × ancho × alto en cm ÷ 6000) y 12 kg. Después se suman las cajas de todos sus productos.",
      },
      {
        title: "Los modos y sus plazos",
        text:
          "Barco: de 40 a 45 días de principio a fin, el más económico y el que recomendamos. Avión: de 7 a 10 días hábiles, para un envío pequeño o urgente. Camión: unos 16 a 20 días, más arriesgado; no lo recomendamos. Tren: de 35 a 38 días después de la salida del tren; tampoco lo recomendamos. El transportista de la última etapa lo elegimos nosotros.",
      },
      {
        title: "Los tramos de peso",
        text:
          "El precio por kilo baja con el peso total. Barco: de 21 a 70 kg, de 71 a 299 kg, y 300 kg o más. Avión: de 21 a 69 kg, de 70 a 99 kg, de 100 a 299 kg, y 300 kg o más. Camión: de 30 a 70 kg, de 71 a 100 kg, de 101 a 499 kg, y 500 kg o más (300 kg o más para el Reino Unido). Tren: de 45 a 74 kg, de 75 a 299 kg, y 300 kg o más. Un envío se factura como mínimo por 21 kg en barco y en avión, por 30 kg en camión y por 45 kg en tren.",
      },
      {
        title: "Las modalidades",
        text:
          "Entregado, impuestos incluidos (DDP): entrega en su dirección, con derechos e IVA de importación incluidos; como máximo 5 productos distintos por envío en barco, en avión y en tren. FOB: la mercancía se entrega en el puerto o el aeropuerto de salida en China, y su transitario se encarga del resto. Hasta la aduana: la transportamos hasta la aduana de llegada, y usted realiza el despacho de aduanas y la recoge. En FOB y hasta la aduana, el precio se fija en un presupuesto.",
      },
      {
        title: "Los países de entrega",
        text:
          "Cada modo entrega en su propia lista de países de Europa; al Reino Unido solo se envía en camión. Si el modo elegido no entrega en su país, el precio se fija en un presupuesto.",
      },
      {
        title: "Los recargos según la mercancía",
        text:
          "Cada modo tiene sus recargos, por kilo facturable del producto en cuestión o por unidad; la lista del formulario cambia con el modo y recoge los ejemplos de la tabla de tarifas. Barco: +1, +3 o +4 RMB/kg; teléfonos +3 RMB por pieza, patinetes y cintas de correr +7,50 € por unidad, bicicletas +75 € por unidad. Tren: +1, +2 o +4 RMB/kg, y los mismos recargos por unidad. Avión: +1, +2, +3, +5 o +7 RMB/kg. Camión: de +1 a +8 RMB/kg; relojes, memorias USB, consolas y tarjetas de memoria +3 RMB por pieza, teléfonos +8 RMB por pieza; gafas, maletas, drones y artículos de madera, bajo presupuesto. Los recargos se acumulan.",
      },
      {
        title: "Los productos con batería",
        text:
          "Se aceptan en barco y en tren. En camión: +100 RMB por envío. En avión, viajan por una línea con salida desde Hong Kong reservada a almacenes de Amazon y almacenes logísticos: el precio se fija en un presupuesto.",
      },
      {
        title: "Los bultos fuera de norma",
        text:
          "Rechazados: más de 65 kg, un lado de más de 270 cm, o largo + 2 × (ancho + alto) por encima de 400 cm. Por caja se aplica el recargo más alto: 130 RMB entre 30 y 40 kg, o si el lado más largo supera 100 cm o el segundo, 76 cm; 600 RMB por encima de 40 kg; 120 RMB si largo + 2 × (ancho + alto) está entre 266 y 320 cm, 900 RMB entre 321 y 400 cm. Un envío de un solo bulto: +80 RMB (+50 RMB en camión para el Reino Unido).",
      },
      {
        title: "El refuerzo de madera",
        text:
          "Para las mercancías frágiles, reforzamos las cajas con madera en nuestro almacén de Guangzhou: 15 $ por m³ del producto reforzado.",
      },
      {
        title: "La declaración de exportación separada",
        text:
          "350 RMB por envío; en barco, +50 RMB por cada página después de la primera (5 líneas por página). En camión, el expediente de exportación se prepara sin coste.",
      },
      {
        title: "Nuestra comisión",
        text: "3 % sobre el total de la estimación: transporte, recargos y refuerzo, en una línea aparte de su presupuesto.",
      },
      {
        title: "Lo que no incluye el precio",
        text:
          "Zonas remotas (recargo refacturado según la factura del transportista), cambio de dirección, gastos de control aduanero, seguro, y nuestros otros servicios de almacén en Guangzhou (recepción, verificación, carga), cuyo precio figura en su presupuesto.",
      },
      {
        title: "Las mercancías rechazadas",
        text:
          "Líquidos, polvos, falsificaciones, baterías sueltas, baterías externas, monociclos eléctricos, tabaco, alimentos, medicamentos, productos corrosivos, inflamables o explosivos, armas. Una mercancía sensible descubierta en el control previo a la exportación cuesta 3000 RMB de multa, además de la devolución y 8 RMB/kg de manipulación.",
      },
      {
        title: "El embalaje",
        text:
          "Todos los productos llevan la mención MADE IN CHINA, y los textiles, el cuero, el equipaje y el calzado, una etiqueta de composición y cuidado. Evite la cinta adhesiva amarilla.",
      },
      {
        title: "En caso de pérdida",
        text:
          "Barco y tren: la pérdida o el bloqueo en aduana se indemnizan sobre el valor declarado, con un límite de 20 RMB por kilo, sin reembolso del transporte; los daños no se indemnizan. Avión y camión: 40 RMB por kilo en caso de pérdida antes de que UPS se haga cargo del envío o de incautación en aduana; después, las reglas de UPS, con un límite de 100 USD por envío. Para una mercancía de valor, contrate un seguro.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Su estimación de transporte: {total}",
    subjectQuote: "Su solicitud de presupuesto de transporte",
    heading: "Su estimación de SourcingPick",
    headingQuote: "Su solicitud de presupuesto de SourcingPick",
    intro: "Este es el detalle de su envío, calculado con la tabla de tarifas para Europa de nuestro transportista y todas sus reglas.",
    introQuote: "Hemos recibido su solicitud. Esto es lo que nos ha indicado; nos pondremos en contacto con usted con un presupuesto.",
    summary: {
      mode: "Modo",
      formula: "Modalidad",
      address: "Dirección de entrega",
      cartons: "Cajas",
      real: "Peso real",
      volumetric: "Peso volumétrico",
      chargeable: "Peso facturable",
      bracket: "Tramo y tarifa",
      delay: "Plazo",
    },
    productsTitle: "Sus productos",
    product: "{name}: {cartons} cajas · {m3} · {chargeable} facturables",
    items: {
      freight: "Transporte ({kg} kg × {rate} RMB/kg)",
      goods: "Recargo por mercancía, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × {rate} €",
      singleCarton: "Envío de un solo bulto",
      oversize: "Bultos fuera de norma ({cartons} cajas)",
      battery: "Productos con batería",
      declaration: "Declaración de exportación separada ({pages} página(s))",
      reinforcement: "Refuerzo de madera ({m3} m³ × {rate} $)",
    },
    subtotal: "Subtotal",
    commission: "Comisión de SourcingPick (3 %)",
    total: "Total estimado",
    notIncludedTitle: "No incluido",
    notIncluded: [
      "Zonas remotas, cambio de dirección, gastos de control aduanero",
      "Seguro",
      "Nuestros otros servicios de almacén en Guangzhou (recepción, verificación, carga), cuyo precio figura en su presupuesto",
    ],
    disclaimer:
      "Precio orientativo, calculado con la tabla de tarifas actual de nuestro transportista (que se actualizará próximamente). El precio en firme figura en su presupuesto.",
    quoteNext: "Nos pondremos en contacto con usted con un presupuesto detallado.",
    signup: "Cree su cuenta de SourcingPick para hacer el seguimiento de sus presupuestos:",
    signupCta: "Crear mi cuenta",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
