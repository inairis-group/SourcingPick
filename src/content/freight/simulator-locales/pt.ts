import type { FreightSimulatorCopy } from "../simulator";

export const pt: FreightSimulatorCopy = {
  eyebrow: "Simulador de transporte",
  title: "Quanto custaria o seu envio?",
  intro:
    "Indique o seu endereço e os seus produtos: calculamos o peso volumétrico de cada um e aplicamos a tabela para a Europa da nossa transportadora. O preço detalhado é-lhe enviado por e-mail.",
  mode: {
    label: "Modo de transporte",
    names: { sea: "Barco", air: "Avião", truck: "Camião", rail: "Comboio" },
    recommended: "Recomendado",
    discouraged: "Desaconselhado",
    hints: {
      sea: "O mais barato, e o que recomendamos: 40 a 45 dias de ponta a ponta.",
      air: "O mais rápido: 7 a 10 dias úteis. Para um envio pequeno ou urgente.",
      truck: "Mais arriscado: desaconselhamo-lo. Cerca de 16 a 20 dias.",
      rail: "Também o desaconselhamos. 35 a 38 dias após a partida do comboio.",
    },
  },
  formula: {
    label: "Modalidade",
    names: { ddp: "Entregue, impostos incluídos", fob: "FOB", customs: "Até à alfândega" },
    hints: {
      ddp: "Entregue no seu endereço, com direitos e IVA na importação incluídos (DDP).",
      fob: "Entregue no porto ou no aeroporto de partida na China; o seu transitário assume a partir daí. Preço mediante orçamento.",
      customs: "Transportado até à alfândega de chegada; o desalfandegamento e o levantamento da mercadoria ficam a seu cargo. Preço mediante orçamento.",
    },
  },
  address: {
    title: "Endereço de entrega",
    street: "Endereço",
    postcode: "Código postal",
    city: "Localidade",
    country: "País",
  },
  products: {
    title: "Os seus produtos",
    item: "Produto {n}",
    name: "Nome do produto",
    namePlaceholder: "Ex.: candeeiros de secretária",
    goods: "Tipo de mercadoria",
    cartons: "Caixas",
    length: "Comp. (cm)",
    width: "Larg. (cm)",
    height: "Alt. (cm)",
    weight: "Peso (kg)",
    cartonHint: "Dimensões e peso de uma caixa.",
    units: "Número de unidades",
    battery: "Contém bateria",
    reinforce: "Reforçar com madeira",
    reinforceHint: "15 US$ por m³, no nosso armazém em Guangzhou.",
    add: "+ Adicionar produto",
    remove: "Remover",
    summary: "{m3} · {volumetric} volumétricos",
    goodsReset: "A lista de mercadorias depende do modo: verifique o tipo de cada produto.",
  },
  goods: {
    sea: {
      ordinary: "Mercadoria comum",
      kg1: "+1 RMB/kg: cozinha, iluminação, cerâmica, madeira, ferramentas, câmaras, drones…",
      kg3: "+3 RMB/kg: sacos, couro, tecidos, roupa de cama, meias, cosméticos…",
      kg4: "+4 RMB/kg: vestuário, calçado, roupa interior, fatos de banho…",
      phones: "Telemóveis: +3 RMB por telemóvel",
      scooters: "Trotinetes, passadeiras de corrida: +7,50 € por unidade",
      bikes: "Bicicletas: +75 € por unidade",
      refused: "Recusado: líquidos, pós, baterias soltas, contrafações…",
    },
    air: {
      ordinary: "Mercadoria comum",
      kg1: "+1 RMB/kg: artigos de madeira, ferragens, metal, capas e cabos de telemóvel…",
      kg2: "+2 RMB/kg: iluminação, cerâmica, cosméticos, aparelhos de beleza, câmaras, discos rígidos…",
      kg3: "+3 RMB/kg: brinquedos, couro, acessórios têxteis",
      kg5: "+5 RMB/kg: relógios, cigarros eletrónicos sem líquido",
      kg7: "+7 RMB/kg: vestuário, calçado, têxteis, telemóveis, computadores, tablets, drones",
      refused: "Recusado: líquidos, pós, baterias soltas, contrafações…",
    },
    truck: {
      ordinary: "Mercadoria comum",
      kg1: "+1 RMB/kg: couro, utensílios de cozinha, iluminação LED, brinquedos, auscultadores, produtos Bluetooth…",
      kg2: "+2 RMB/kg: ferragens, aparelhos de beleza, dashcams, GPS, canetas, artigos para adultos…",
      kg3: "+3 RMB/kg: perucas, têxteis (exceto vestuário e calçado)",
      kg4: "+4 RMB/kg: tablets",
      kg5: "+5 RMB/kg: vestuário, meias, calças, painéis solares, cigarros eletrónicos descartáveis",
      kg8: "+8 RMB/kg: calçado",
      pieces: "Relógios, pens USB, consolas, cartões de memória: +3 RMB por peça",
      phones: "Telemóveis: +8 RMB por telemóvel",
      quote: "Óculos, malas de viagem, drones, robôs aspiradores, artigos de madeira…: mediante orçamento",
      refused: "Recusado: líquidos, pós, baterias soltas, contrafações…",
    },
    rail: {
      ordinary: "Mercadoria comum",
      kg1: "+1 RMB/kg: cozinha, iluminação, cerâmica, madeira, ferramentas, câmaras, drones…",
      kg2: "+2 RMB/kg: sacos, couro, tecidos, roupa de cama, meias, cosméticos…",
      kg4: "+4 RMB/kg: vestuário, calçado, roupa interior, fatos de banho…",
      phones: "Telemóveis: +3 RMB por telemóvel",
      scooters: "Trotinetes, passadeiras de corrida: +7,50 € por unidade",
      bikes: "Bicicletas: +75 € por unidade",
      refused: "Recusado: líquidos, pós, baterias soltas, contrafações…",
    },
  },
  options: {
    declaration: "Declaração de exportação separada",
    declarationHint: "350 RMB por envio.",
    declarationHintSea: "350 RMB, +50 RMB por página além da primeira (5 produtos por página).",
  },
  calc: {
    volumetric: "Peso volumétrico",
    formula: "C × L × A ÷ 6 000",
    bracket: "Escalão",
    billed: "{kg} kg faturados",
    volume: "Volume total: {m3}",
  },
  estimate: {
    title: "A sua estimativa",
    delayLabel: "Prazo",
    delays: {
      sea: "40 a 45 dias de ponta a ponta",
      air: "7 a 10 dias úteis",
      truck: "cerca de 16 a 20 dias",
      rail: "35 a 38 dias após a partida",
    },
    surcharges: "Acrescem ao seu envio",
    oversize: "Volumes fora de norma: {n}",
    singleCarton: "Envio de um único volume",
    battery: "Produtos com bateria",
    reinforcement: "Reforço em madeira: {m3}",
    declaration: "Declaração de exportação separada",
  },
  quote: {
    title: "Preço mediante orçamento",
    reasons: {
      formula: "Em FOB ou até à alfândega, fazemos um orçamento: respondemos-lhe por e-mail.",
      country: "Este modo não entrega neste país com impostos incluídos: fazemos um orçamento.",
      air_battery:
        "Por avião, os produtos com bateria seguem por uma linha reservada aos armazéns Amazon e aos armazéns logísticos: fazemos um orçamento.",
      too_many_products: "Acima de 5 produtos diferentes, fazemos um orçamento.",
      goods_quote: "Para esta mercadoria, fazemos um orçamento.",
    },
  },
  warnings: {
    refusedGoods: "Uma das suas mercadorias não é aceite por este modo de transporte.",
    refusedCarton:
      "Uma caixa excede os limites (65 kg, 270 cm num dos lados, ou comprimento + 2 × (largura + altura) acima de 400 cm): tem de ser reembalada.",
    noProducts: "Indique pelo menos um produto, com as respetivas caixas, dimensões e peso.",
  },
  gate: {
    locked: "O preço aparece após o registo",
    lockedQuote: "Preço mediante orçamento: respondemos-lhe por e-mail",
    points: [
      "O preço detalhado, linha a linha, enviado por e-mail",
      "Transporte, sobretaxas, reforço e a nossa comissão de 3%",
      "A sua estimativa, pronta a tornar-se um orçamento",
    ],
    name: "Nome e apelido",
    phone: "Telefone (WhatsApp)",
    email: "O seu e-mail",
    emailPlaceholder: "nome@empresa.com",
    cta: "Ver o preço",
    ctaQuote: "Receber o meu orçamento",
    already: "Já tenho conta",
    note: "Preços indicativos, tabela a atualizar em breve. O preço definitivo consta do seu orçamento.",
    sending: "A enviar…",
    sent: "Enviado para {email}. Crie agora a sua conta para ter acesso aos seus orçamentos.",
    sentQuote: "Pedido recebido: respondemos-lhe para {email}. Crie agora a sua conta para acompanhar os seus orçamentos.",
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
      "O preço vem das tabelas para a Europa da nossa transportadora: barco, avião, camião e comboio. Eis as suas regras, tal como se aplicam ao seu envio.",
    sections: [
      {
        title: "O peso faturável",
        text:
          "Cada caixa é faturada pelo mais elevado de três pesos: o seu peso real, o seu peso volumétrico (comprimento × largura × altura em cm ÷ 6 000) e 12 kg. Depois, somam-se as caixas de todos os seus produtos.",
      },
      {
        title: "Os modos e os respetivos prazos",
        text:
          "Barco: 40 a 45 dias de ponta a ponta, o mais barato e o que recomendamos. Avião: 7 a 10 dias úteis, para um envio pequeno ou urgente. Camião: cerca de 16 a 20 dias, mais arriscado, desaconselhamo-lo. Comboio: 35 a 38 dias após a partida do comboio, também o desaconselhamos. Somos nós que escolhemos a transportadora da última etapa.",
      },
      {
        title: "Os escalões de peso",
        text:
          "O preço por quilo baixa com o peso total. Barco: 21 a 70 kg, 71 a 299 kg, 300 kg ou mais. Avião: 21 a 69 kg, 70 a 99 kg, 100 a 299 kg, 300 kg ou mais. Camião: 30 a 70 kg, 71 a 100 kg, 101 a 499 kg, 500 kg ou mais (300 kg ou mais para o Reino Unido). Comboio: 45 a 74 kg, 75 a 299 kg, 300 kg ou mais. Um envio é faturado por um mínimo de 21 kg por barco e por avião, de 30 kg por camião e de 45 kg por comboio.",
      },
      {
        title: "As modalidades",
        text:
          "Entregue, impostos incluídos (DDP): entrega no seu endereço, com direitos e IVA na importação incluídos; no máximo 5 produtos diferentes por envio, por barco, por avião e por comboio. FOB: a mercadoria é entregue no porto ou no aeroporto de partida na China, e o seu transitário assume a partir daí. Até à alfândega: transportamo-la até à alfândega de chegada, e o desalfandegamento e o levantamento ficam a seu cargo. Em FOB e até à alfândega, fazemos um orçamento.",
      },
      {
        title: "Os países servidos",
        text:
          "Cada modo serve a sua própria lista de países da Europa; o Reino Unido só é servido por camião. Se o modo escolhido não servir o seu país, fazemos um orçamento.",
      },
      {
        title: "As sobretaxas consoante a mercadoria",
        text:
          "Cada modo tem as suas sobretaxas, por quilo faturável do produto em causa ou à unidade; a lista do formulário muda com o modo e segue os exemplos da tabela. Barco: +1, +3 ou +4 RMB/kg; telemóveis +3 RMB por peça, trotinetes e passadeiras de corrida +7,50 € por unidade, bicicletas +75 € por unidade. Comboio: +1, +2 ou +4 RMB/kg, e as mesmas sobretaxas à unidade. Avião: +1, +2, +3, +5 ou +7 RMB/kg. Camião: de +1 a +8 RMB/kg; relógios, pens USB, consolas e cartões de memória +3 RMB por peça, telemóveis +8 RMB por peça; óculos, malas de viagem, drones e artigos de madeira mediante orçamento. As sobretaxas acumulam-se.",
      },
      {
        title: "Os produtos com bateria",
        text:
          "Aceites por barco e por comboio. Por camião: +100 RMB por envio. Por avião, seguem por uma linha com partida de Hong Kong reservada aos armazéns Amazon e aos armazéns logísticos: fazemos um orçamento.",
      },
      {
        title: "Os volumes fora de norma",
        text:
          "Recusados: mais de 65 kg, um lado com mais de 270 cm, ou comprimento + 2 × (largura + altura) acima de 400 cm. Por caixa, aplica-se a sobretaxa mais elevada: 130 RMB entre 30 e 40 kg, ou se o lado maior exceder 100 cm ou o segundo maior 76 cm; 600 RMB acima de 40 kg; 120 RMB se comprimento + 2 × (largura + altura) estiver entre 266 e 320 cm, 900 RMB entre 321 e 400 cm. Um envio de um único volume: +80 RMB (+50 RMB por camião para o Reino Unido).",
      },
      {
        title: "O reforço em madeira",
        text:
          "Para as mercadorias frágeis, reforçamos as caixas com madeira no nosso armazém em Guangzhou: 15 US$ por m³ do produto reforçado.",
      },
      {
        title: "A declaração de exportação separada",
        text:
          "350 RMB por envio; por barco, +50 RMB por página além da primeira (5 linhas por página). Por camião, a documentação de exportação é preparada sem custos.",
      },
      {
        title: "A nossa comissão",
        text: "3% sobre o total da estimativa: transporte, sobretaxas e reforço, numa linha à parte do seu orçamento.",
      },
      {
        title: "O que o preço não inclui",
        text:
          "Zonas remotas (sobretaxa refaturada conforme a fatura da transportadora), mudança de endereço, custos de controlo aduaneiro, seguro e os nossos outros serviços de armazém em Guangzhou (receção, verificação, carregamento), com o preço indicado no seu orçamento.",
      },
      {
        title: "As mercadorias recusadas",
        text:
          "Líquidos, pós, contrafações, baterias soltas, baterias externas, monociclos elétricos, tabaco, produtos alimentares, medicamentos, produtos corrosivos, inflamáveis ou explosivos, armas. Uma mercadoria sensível descoberta no controlo antes da exportação custa uma multa de 3 000 RMB, a devolução e 8 RMB/kg de manuseamento.",
      },
      {
        title: "A embalagem",
        text:
          "Todos os produtos levam a menção MADE IN CHINA; os têxteis, o couro, a bagagem e o calçado, uma etiqueta de composição e de cuidados. Evite fita adesiva amarela.",
      },
      {
        title: "Em caso de perda",
        text:
          "Barco e comboio: perda ou retenção na alfândega indemnizada com base no valor declarado, até 20 RMB por quilo, sem reembolso do transporte; os danos não são indemnizados. Avião e camião: 40 RMB por quilo em caso de perda antes da recolha pela UPS ou de apreensão na alfândega e, depois, as regras da UPS, até 100 USD por envio. Para mercadoria de valor, contrate um seguro.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "A sua estimativa de transporte: {total}",
    subjectQuote: "O seu pedido de orçamento de transporte",
    heading: "A sua estimativa SourcingPick",
    headingQuote: "O seu pedido de orçamento SourcingPick",
    intro: "Eis o detalhe do seu envio, calculado com a tabela para a Europa da nossa transportadora e todas as suas regras.",
    introQuote: "Recebemos o seu pedido. Eis o que nos indicou; entraremos em contacto consigo com um orçamento.",
    summary: {
      mode: "Modo",
      formula: "Modalidade",
      address: "Endereço de entrega",
      cartons: "Caixas",
      real: "Peso real",
      volumetric: "Peso volumétrico",
      chargeable: "Peso faturável",
      bracket: "Escalão e tarifa",
      delay: "Prazo",
    },
    productsTitle: "Os seus produtos",
    product: "{name}: {cartons} caixas · {m3} · {chargeable} faturáveis",
    items: {
      freight: "Transporte ({kg} kg × {rate} RMB/kg)",
      goods: "Sobretaxa de mercadoria, {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × {rate} €",
      singleCarton: "Envio de um único volume",
      oversize: "Volumes fora de norma ({cartons} caixas)",
      battery: "Produtos com bateria",
      declaration: "Declaração de exportação separada ({pages} página(s))",
      reinforcement: "Reforço em madeira ({m3} m³ × {rate} US$)",
    },
    subtotal: "Subtotal",
    commission: "Comissão da SourcingPick (3%)",
    total: "Total estimado",
    notIncludedTitle: "Não incluído",
    notIncluded: [
      "Zonas remotas, mudança de endereço, custos de controlo aduaneiro",
      "Seguro",
      "Os nossos outros serviços de armazém em Guangzhou (receção, verificação, carregamento), com o preço indicado no seu orçamento",
    ],
    disclaimer:
      "Preço indicativo, calculado com a tabela atual da nossa transportadora (a atualizar em breve). O preço definitivo consta do seu orçamento.",
    quoteNext: "Entraremos em contacto consigo com um orçamento detalhado.",
    signup: "Crie a sua conta SourcingPick para acompanhar os seus orçamentos:",
    signupCta: "Criar a minha conta",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
