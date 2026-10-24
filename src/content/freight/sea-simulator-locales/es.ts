import type { SeaSimulatorCopy } from "../sea-simulator";

export const es: SeaSimulatorCopy = {
  eyebrow: "Estimar mi envío",
  title: "¿Cuánto costaría su envío por barco?",
  intro:
    "Indique sus cajas: calculamos el peso facturable y aplicamos, línea por línea, la tabla de tarifas marítimas para Europa de nuestro transportista. Le enviamos el precio detallado por correo electrónico.",
  regime: {
    label: "Despacho de aduanas",
    ddp: "Impuestos incluidos",
    ddpHint: "Derechos e IVA de importación incluidos en el precio.",
    vat: "Con su número de IVA",
    vatHint: "IVA autoliquidado: se requieren un número de IVA y un EORI válidos.",
  },
  deliverTo: {
    label: "Entrega",
    amazon: "Almacén de Amazon",
    other: "Otra dirección",
    thirdParty: "Almacén logístico",
  },
  warehouse: { label: "Almacén", byCountry: "Otro almacén de Amazon (por país)" },
  country: "País de entrega",
  carrier: {
    label: "Transportista",
    truck: "Camión hasta el almacén",
    upsDpd: "UPS o DPD (lo elegimos)",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Tipo de mercancía",
    ordinary: "Mercancía general",
    plus1: "Cocina, luminarias, madera, herramientas, tecnología…",
    plus3: "Textiles, bolsos, cuero, cosméticos…",
    plus4: "Ropa, calzado, ropa interior…",
    refused: "Líquidos, polvos, baterías sueltas…",
    hint: "El detalle de cada categoría está más abajo, en «Cómo calculamos su precio».",
  },
  units: {
    label: "Productos contados por unidad",
    phones: "Teléfonos",
    scooters: "Patinetes, cintas de correr",
    bikes: "Bicicletas",
  },
  cartons: {
    title: "Sus cajas",
    line: "Lote {n}",
    quantity: "Cajas",
    length: "Largo (cm)",
    width: "Ancho (cm)",
    height: "Alto (cm)",
    weight: "Peso (kg)",
    add: "+ Añadir un lote",
    remove: "Eliminar",
  },
  designations: { label: "Referencias de productos", hint: "Número de productos distintos declarados." },
  options: {
    declaration: "Declaración de exportación separada",
    declarationHint: "350 RMB, +50 RMB por cada página después de la primera.",
    signature: "Firma en la entrega",
    signatureHint: "Entregas con UPS: 30 RMB por bulto.",
  },
  calc: {
    title: "Cómo se calcula",
    real: "Peso real",
    volumetric: "Peso volumétrico",
    formula: "L × An × Al ÷ 6000",
    chargeable: "Peso facturable",
    chargeableHint: "Caja por caja, el mayor de los tres",
    bracket: "Tramo",
    billed: "se facturan {kg} kg",
    volume: "Volumen total: {m3}",
    cartons: "{n} cajas",
  },
  estimate: {
    title: "Su estimación",
    mode: "Barco · China → Europa",
    delayLabel: "Plazo",
    delay: "40 a 45 días de principio a fin",
    surcharges: "Se añaden a su envío",
    oversize: "Bultos fuera de norma: {n}",
    singleCarton: "Envío de un solo bulto",
    nonAmazon: "Dirección fuera de Amazon",
    vatClearance: "Despacho de aduanas con su IVA",
  },
  warnings: {
    refusedGoods: "Esta mercancía no se acepta por vía marítima.",
    refusedCarton:
      "Una caja supera los límites (65 kg, 270 cm en un lado, o largo + 2 × (ancho + alto) por encima de 400 cm): hay que volver a embalarla.",
    tooManyDesignations: "Con impuestos incluidos, un envío admite como máximo 5 referencias: si hay más, le hacemos un presupuesto.",
    noCartons: "Indique al menos una caja, con sus dimensiones y su peso.",
  },
  gate: {
    locked: "El precio se muestra tras registrarse",
    points: [
      "El precio detallado, línea por línea, enviado por correo electrónico",
      "Flete, recargos y nuestra comisión del 3 %",
      "Su estimación, lista para convertirse en presupuesto",
    ],
    email: "Su correo electrónico",
    emailPlaceholder: "usted@empresa.com",
    cta: "Ver el precio",
    already: "Ya tengo una cuenta",
    note: "Precios orientativos; la tabla de tarifas se actualizará próximamente. El precio en firme figura en su presupuesto.",
    sending: "Enviando…",
    sent: "Lo hemos enviado a {email}. Cree ahora su cuenta para consultar sus presupuestos.",
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
      "El precio procede de la tabla de tarifas marítimas para Europa de nuestro transportista (navieras EMC y COSCO). Estas son todas sus reglas, tal como se aplican a su envío.",
    sections: [
      {
        title: "El peso facturable",
        text:
          "Cada caja se factura según el mayor de tres pesos: su peso real, su peso volumétrico (largo × ancho × alto en cm ÷ 6000) y un mínimo de 12 kg por caja (10 kg para los almacenes de Amazon con entrega en camión, con impuestos incluidos). Después se suman las cajas.",
      },
      {
        title: "Los tramos de peso",
        text:
          "El precio por kilo baja con el peso total: de 21 a 70 kg, de 71 a 299 kg, y 300 kg o más. Un envío se factura como mínimo por 21 kg, y como mínimo por 71 kg en las líneas de camión que empiezan en 71 kg.",
      },
      {
        title: "Impuestos incluidos o con su IVA",
        text:
          "Impuestos incluidos: los derechos y el IVA de importación están incluidos en el precio, con un máximo de 5 referencias de productos por envío. Con su número de IVA: usted aporta un número de IVA y un EORI válidos, y el IVA de importación se autoliquida; 380 RMB de gastos de despacho de aduanas por envío, derechos e impuestos refacturados por su importe real, y 30 RMB por referencia por encima de 5. En caso de control aduanero: 900 € de manipulación repartidos entre los lotes del contenedor, y 3 € por palé y por día de almacenaje.",
      },
      {
        title: "El destino",
        text:
          "Almacenes de Amazon con entrega en camión, entrega por UPS o DPD (transportista elegido por nosotros) en Alemania, Francia, Italia y España, o por UPS en 23 países. Una dirección que no sea un almacén de Amazon (particular, empresa): +1 RMB por kilo, mínimo 100 RMB para un envío de un solo bulto.",
      },
      {
        title: "Los recargos según la mercancía",
        text:
          "+1 RMB/kg: utensilios de cocina, luminarias, cerámica, accesorios para coche y bicicleta, artículos de madera o bambú, bolígrafos, tiendas de campaña, herramientas, cámaras, cámaras de salpicadero, aparatos de belleza, reproductores multimedia, robots aspiradores, proyectores, discos duros, lámparas solares, paraguas, pelucas, maletas, drones, memorias USB… +3 RMB/kg: artículos para adultos, cosméticos, mercería, calcetines, gorros, guantes, ropa de cama, tejidos, bolsos, cuero. +4 RMB/kg: ropa, calzado, ropa interior, bañadores y todos los textiles que se llevan puestos. Por unidad: teléfonos +3 RMB, patinetes y cintas de correr +7,50 €, bicicletas +75 €. Los recargos se acumulan.",
      },
      {
        title: "Los bultos fuera de norma",
        text:
          "Rechazados: más de 65 kg, un lado de más de 270 cm, o largo + 2 × (ancho + alto) por encima de 400 cm. Por caja se aplica el recargo más alto: 130 RMB entre 30 y 40 kg, o si el lado más largo supera 100 cm o el segundo, 76 cm; 600 RMB por encima de 40 kg; 120 RMB si largo + 2 × (ancho + alto) está entre 266 y 320 cm, 900 RMB entre 321 y 400 cm. Un envío de un solo bulto: +80 RMB.",
      },
      {
        title: "Las opciones",
        text:
          "Declaración de exportación separada: 350 RMB, +50 RMB por cada página después de la primera (5 líneas por página). Firma en la entrega con UPS: 30 RMB por bulto. Transportista elegido por usted: +1 RMB por kilo (+0,5 RMB para DHL en la línea QOT Express).",
      },
      {
        title: "Los plazos",
        text:
          "Cierre el viernes, salida el miércoles. Recogida unos 38 a 42 días después de la salida del buque; 40 a 45 días de principio a fin.",
      },
      {
        title: "Nuestra comisión",
        text: "3 % sobre el flete que le refacturamos, en una línea aparte de su presupuesto.",
      },
      {
        title: "Lo que no incluye el precio",
        text:
          "Zonas remotas (recargo refacturado según la factura del transportista), cambio de dirección, gastos de control aduanero, IVA y derechos con su número de IVA, seguro, y nuestros servicios de almacén en Guangzhou (recepción, verificación, refuerzo, carga), cuyo precio figura en su presupuesto.",
      },
      {
        title: "Las mercancías rechazadas",
        text:
          "Líquidos, polvos, falsificaciones, baterías sueltas, baterías externas, monociclos eléctricos, tabaco, alimentos, medicamentos, productos corrosivos, inflamables o explosivos, armas. Se aceptan los productos con baterías integradas y los productos magnéticos. Una mercancía sensible descubierta en el control previo a la exportación cuesta 3000 RMB de multa, además de la devolución y 8 RMB/kg de manipulación.",
      },
      {
        title: "El embalaje",
        text:
          "Todos los productos llevan la mención MADE IN CHINA, y los textiles, el cuero, el equipaje y el calzado, una etiqueta de composición y cuidado. Para Amazon: dos etiquetas de código de barras para la entrada en el almacén en cada caja, y etiquetas SKU y FBA protegidas con cinta transparente. Evite la cinta adhesiva amarilla.",
      },
      {
        title: "En caso de pérdida",
        text:
          "Pérdida o bloqueo en aduana: indemnización sobre el valor declarado, con un límite de 20 RMB por kilo, sin reembolso del flete. Los daños no se indemnizan: para una mercancía de valor, contrate un seguro.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Su estimación de flete marítimo: {total}",
    heading: "Su estimación de Sourcing Pick",
    intro:
      "Este es el detalle de su envío por barco, calculado con la tabla de tarifas marítimas para Europa de nuestro transportista y todas sus reglas.",
    summary: {
      regime: "Despacho de aduanas",
      delivery: "Entrega",
      cartons: "Cajas",
      real: "Peso real",
      volumetric: "Peso volumétrico",
      chargeable: "Peso facturable",
      bracket: "Tramo y tarifa",
      delay: "Plazo",
    },
    items: {
      freight: "Flete marítimo ({kg} kg × {rate} RMB/kg)",
      goods: "Recargo por mercancía ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Dirección fuera de Amazon (+1 RMB/kg, mínimo 100 RMB para un solo bulto)",
      singleCarton: "Envío de un solo bulto",
      oversize: "Bultos fuera de norma ({cartons} cajas)",
      phones: "Teléfonos ({units} × 3 RMB)",
      vatClearance: "Despacho de aduanas con su número de IVA",
      declaration: "Declaración de exportación separada ({pages} página(s))",
      designations: "Referencias por encima de 5 ({extra} × 30 RMB)",
      signature: "Firma en la entrega con UPS ({cartons} × 30 RMB)",
      scooters: "Patinetes y cintas de correr ({units} × 7,50 €)",
      bikes: "Bicicletas ({units} × 75 €)",
    },
    subtotal: "Subtotal de transporte",
    commission: "Comisión de Sourcing Pick (3 % del flete)",
    total: "Total estimado",
    notIncludedTitle: "No incluido",
    notIncluded: [
      "Zonas remotas, cambio de dirección, gastos de control aduanero",
      "IVA y derechos de importación con su número de IVA",
      "Seguro",
      "Nuestros servicios de almacén en Guangzhou (recepción, verificación, refuerzo, carga), cuyo precio figura en su presupuesto",
    ],
    disclaimer:
      "Precio orientativo, calculado con la tabla de tarifas actual de nuestro transportista (que se actualizará próximamente). El precio en firme figura en su presupuesto.",
    signup: "Cree su cuenta de Sourcing Pick para convertir esta estimación en un presupuesto:",
    signupCta: "Crear mi cuenta",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
