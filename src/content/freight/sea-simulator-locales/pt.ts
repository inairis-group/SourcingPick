import type { SeaSimulatorCopy } from "../sea-simulator";

export const pt: SeaSimulatorCopy = {
  eyebrow: "Estimar o meu envio",
  title: "Quanto custaria o seu envio por barco?",
  intro:
    "Indique as suas caixas: calculamos o peso faturável e aplicamos, linha a linha, a tabela de frete marítimo para a Europa da nossa transportadora. O preço detalhado é-lhe enviado por e-mail.",
  regime: {
    label: "Alfândega",
    ddp: "Impostos incluídos",
    ddpHint: "Direitos e IVA na importação incluídos no preço.",
    vat: "Com o seu número de IVA",
    vatHint: "IVA autoliquidado: são necessários um número de IVA e um EORI válidos.",
  },
  deliverTo: {
    label: "Entrega",
    amazon: "Armazém Amazon",
    other: "Outro endereço",
    thirdParty: "Armazém logístico",
  },
  warehouse: { label: "Armazém", byCountry: "Outro armazém Amazon (por país)" },
  country: "País de entrega",
  carrier: {
    label: "Transportadora",
    truck: "Camião até ao armazém",
    upsDpd: "UPS/DPD, à nossa escolha",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Tipo de mercadoria",
    ordinary: "Mercadoria comum",
    plus1: "Cozinha, iluminação, madeira, ferramentas, eletrónica…",
    plus3: "Têxteis, sacos, couro, cosméticos…",
    plus4: "Vestuário, calçado, roupa interior…",
    refused: "Líquidos, pós, baterias soltas…",
    hint: "O detalhe de cada categoria está mais abaixo, em «Como calculamos o seu preço».",
  },
  units: {
    label: "Produtos cobrados à unidade",
    phones: "Telemóveis",
    scooters: "Trotinetes, passadeiras",
    bikes: "Bicicletas",
  },
  cartons: {
    title: "As suas caixas",
    line: "Lote {n}",
    quantity: "Caixas",
    length: "Comp. (cm)",
    width: "Larg. (cm)",
    height: "Alt. (cm)",
    weight: "Peso (kg)",
    add: "+ Adicionar lote",
    remove: "Remover",
  },
  designations: { label: "Referências de produtos", hint: "Número de produtos diferentes declarados." },
  options: {
    declaration: "Declaração de exportação separada",
    declarationHint: "350 RMB, +50 RMB por página além da primeira.",
    signature: "Assinatura na entrega",
    signatureHint: "Entregas UPS: 30 RMB por volume.",
  },
  calc: {
    title: "Como é calculado",
    real: "Peso real",
    volumetric: "Peso volumétrico",
    formula: "C × L × A ÷ 6 000",
    chargeable: "Peso faturável",
    chargeableHint: "Caixa a caixa, o mais elevado dos três",
    bracket: "Escalão",
    billed: "{kg} kg faturados",
    volume: "Volume total: {m3}",
    cartons: "{n} caixas",
  },
  estimate: {
    title: "A sua estimativa",
    mode: "Barco · China → Europa",
    delayLabel: "Prazo",
    delay: "40 a 45 dias de ponta a ponta",
    surcharges: "Acrescem ao seu envio",
    oversize: "Volumes fora de norma: {n}",
    singleCarton: "Envio de um único volume",
    nonAmazon: "Endereço fora da Amazon",
    vatClearance: "Desalfandegamento com o seu IVA",
  },
  warnings: {
    refusedGoods: "Esta mercadoria não é aceite por via marítima.",
    refusedCarton:
      "Uma caixa excede os limites (65 kg, 270 cm num dos lados, ou comprimento + 2 × (largura + altura) acima de 400 cm): tem de ser reembalada.",
    tooManyDesignations: "Com impostos incluídos, um envio tem no máximo 5 referências: acima disso, fazemos um orçamento.",
    noCartons: "Indique pelo menos uma caixa, com as dimensões e o peso.",
  },
  gate: {
    locked: "O preço aparece após o registo",
    points: [
      "O preço detalhado, linha a linha, enviado por e-mail",
      "Frete, sobretaxas e a nossa comissão de 3%",
      "A sua estimativa, pronta a tornar-se um orçamento",
    ],
    email: "O seu e-mail",
    emailPlaceholder: "nome@empresa.com",
    cta: "Ver o preço",
    already: "Já tenho conta",
    note: "Preços indicativos, tabela a atualizar em breve. O preço definitivo consta do seu orçamento.",
    sending: "A enviar…",
    sent: "Enviado para {email}. Crie agora a sua conta para ter acesso aos seus orçamentos.",
    errors: {
      invalid_email: "Este endereço de e-mail não parece válido.",
      rate_limited: "Demasiados pedidos a partir desta ligação. Tente novamente dentro de uma hora.",
      failed: "Não foi possível fazer o envio. Escreva-nos pelo WhatsApp ou para contact@sourcingpick.com.",
      invalid: "Verifique os campos: falta uma informação para calcular o preço.",
    },
  },
  rules: {
    title: "Como calculamos o seu preço",
    intro:
      "O preço vem da tabela de frete marítimo para a Europa da nossa transportadora (companhias EMC e COSCO). Eis todas as suas regras, tal como se aplicam ao seu envio.",
    sections: [
      {
        title: "O peso faturável",
        text:
          "Cada caixa é faturada pelo mais elevado de três pesos: o seu peso real, o seu peso volumétrico (comprimento × largura × altura em cm ÷ 6 000) e um mínimo de 12 kg por caixa (10 kg para os armazéns Amazon com entrega por camião, com impostos incluídos). Depois, somam-se as caixas.",
      },
      {
        title: "Os escalões de peso",
        text:
          "O preço por quilo baixa com o peso total: 21 a 70 kg, 71 a 299 kg, 300 kg ou mais. Um envio é faturado por um mínimo de 21 kg, e por um mínimo de 71 kg nas linhas de camião que começam nos 71 kg.",
      },
      {
        title: "Impostos incluídos ou com o seu IVA",
        text:
          "Impostos incluídos: os direitos aduaneiros e o IVA na importação estão incluídos no preço, com um máximo de 5 referências de produtos por envio. Com o seu número de IVA: fornece um número de IVA e um EORI válidos, e o IVA na importação é autoliquidado; 380 RMB de custos de desalfandegamento por envio, direitos e impostos refaturados pelo valor real, 30 RMB por referência acima de 5. Em caso de controlo aduaneiro: 900 € de manuseamento repartidos pelos lotes do contentor, e 3 € por palete e por dia de armazenagem.",
      },
      {
        title: "O destino",
        text:
          "Armazéns Amazon com entrega por camião, entrega por UPS ou DPD (transportadora escolhida por nós) na Alemanha, em França, em Itália e em Espanha, ou por UPS em 23 países. Um endereço que não seja um armazém Amazon (particular, empresa): +1 RMB por quilo, mínimo de 100 RMB para um envio de um único volume.",
      },
      {
        title: "As sobretaxas consoante a mercadoria",
        text:
          "+1 RMB/kg: utensílios de cozinha, artigos de iluminação, cerâmica, acessórios para automóvel e bicicleta, artigos de madeira ou bambu, canetas, tendas, ferramentas, câmaras, dashcams, aparelhos de beleza, leitores multimédia, robôs aspiradores, videoprojetores, discos rígidos, candeeiros solares, guarda-chuvas, perucas, malas de viagem, drones, pens USB… +3 RMB/kg: artigos para adultos, cosméticos, acessórios de confeção, meias, gorros, luvas, roupa de cama, tecidos, sacos, couro. +4 RMB/kg: vestuário, calçado, roupa interior, fatos de banho e todos os têxteis de vestir. À unidade: telemóveis +3 RMB, trotinetes e passadeiras de corrida +7,50 €, bicicletas +75 €. As sobretaxas acumulam-se.",
      },
      {
        title: "Os volumes fora de norma",
        text:
          "Recusados: mais de 65 kg, um lado com mais de 270 cm, ou comprimento + 2 × (largura + altura) acima de 400 cm. Por caixa, aplica-se a sobretaxa mais elevada: 130 RMB entre 30 e 40 kg, ou se o lado maior exceder 100 cm ou o segundo maior 76 cm; 600 RMB acima de 40 kg; 120 RMB se comprimento + 2 × (largura + altura) estiver entre 266 e 320 cm, 900 RMB entre 321 e 400 cm. Um envio de um único volume: +80 RMB.",
      },
      {
        title: "As opções",
        text:
          "Declaração de exportação separada: 350 RMB, +50 RMB por página além da primeira (5 linhas por página). Assinatura na entrega para UPS: 30 RMB por volume. Transportadora definida por si: +1 RMB por quilo (+0,5 RMB para a DHL na linha QOT Express).",
      },
      {
        title: "Os prazos",
        text:
          "Fecho à sexta-feira, partida à quarta-feira. Levantamento cerca de 38 a 42 dias após a partida do navio; 40 a 45 dias de ponta a ponta.",
      },
      {
        title: "A nossa comissão",
        text: "3% sobre o frete que lhe refaturamos, numa linha à parte do seu orçamento.",
      },
      {
        title: "O que o preço não inclui",
        text:
          "Zonas remotas (sobretaxa refaturada conforme a fatura da transportadora), mudança de endereço, custos de controlo aduaneiro, IVA e direitos com o seu número de IVA, seguro e os nossos serviços de armazém em Guangzhou (receção, verificação, reforço, carregamento), com o preço indicado no seu orçamento.",
      },
      {
        title: "As mercadorias recusadas",
        text:
          "Líquidos, pós, contrafações, baterias soltas, baterias externas, monociclos elétricos, tabaco, produtos alimentares, medicamentos, produtos corrosivos, inflamáveis ou explosivos, armas. Os produtos com baterias integradas e os produtos magnéticos são aceites. Uma mercadoria sensível descoberta no controlo antes da exportação custa uma multa de 3 000 RMB, a devolução e 8 RMB/kg de manuseamento.",
      },
      {
        title: "A embalagem",
        text:
          "Todos os produtos levam a menção MADE IN CHINA; os têxteis, o couro, a bagagem e o calçado, uma etiqueta de composição e de cuidados. Para a Amazon: duas etiquetas de código de barras de entrada no armazém em cada caixa, etiquetas SKU e FBA protegidas com fita transparente. Evite fita adesiva amarela.",
      },
      {
        title: "Em caso de perda",
        text:
          "Perda ou retenção na alfândega: indemnização com base no valor declarado, até 20 RMB por quilo, sem reembolso do frete. Os danos não são indemnizados: para mercadoria de valor, contrate um seguro.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "A sua estimativa de frete marítimo: {total}",
    heading: "A sua estimativa Sourcing Pick",
    intro:
      "Eis o detalhe do seu envio por barco, calculado com a tabela de frete marítimo para a Europa da nossa transportadora e todas as suas regras.",
    summary: {
      regime: "Desalfandegamento",
      delivery: "Entrega",
      cartons: "Caixas",
      real: "Peso real",
      volumetric: "Peso volumétrico",
      chargeable: "Peso faturável",
      bracket: "Escalão e tarifa",
      delay: "Prazo",
    },
    items: {
      freight: "Frete marítimo ({kg} kg × {rate} RMB/kg)",
      goods: "Sobretaxa de mercadoria ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Endereço fora da Amazon (+1 RMB/kg, mínimo de 100 RMB para um único volume)",
      singleCarton: "Envio de um único volume",
      oversize: "Volumes fora de norma ({cartons} caixas)",
      phones: "Telemóveis ({units} × 3 RMB)",
      vatClearance: "Desalfandegamento com o seu número de IVA",
      declaration: "Declaração de exportação separada ({pages} página(s))",
      designations: "Referências acima de 5 ({extra} × 30 RMB)",
      signature: "Assinatura na entrega UPS ({cartons} × 30 RMB)",
      scooters: "Trotinetes e passadeiras de corrida ({units} × 7,50 €)",
      bikes: "Bicicletas ({units} × 75 €)",
    },
    subtotal: "Subtotal do transporte",
    commission: "Comissão da Sourcing Pick (3% do frete)",
    total: "Total estimado",
    notIncludedTitle: "Não incluído",
    notIncluded: [
      "Zonas remotas, mudança de endereço, custos de controlo aduaneiro",
      "IVA e direitos de importação com o seu número de IVA",
      "Seguro",
      "Os nossos serviços de armazém em Guangzhou (receção, verificação, reforço, carregamento), com o preço indicado no seu orçamento",
    ],
    disclaimer:
      "Preço indicativo, calculado com a tabela atual da nossa transportadora (a atualizar em breve). O preço definitivo consta do seu orçamento.",
    signup: "Crie a sua conta Sourcing Pick para transformar esta estimativa num orçamento:",
    signupCta: "Criar a minha conta",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
