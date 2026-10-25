import type { FreightSimulatorCopy } from "../simulator";

export const zh: FreightSimulatorCopy = {
  eyebrow: "估算运费",
  title: "你的货运过去要多少钱？",
  intro:
    "填上你的地址和产品：我们帮你算出每个产品的体积重，再按我们承运商的欧洲运价表来算。详细价格会发到你的邮箱。",
  mode: {
    label: "运输方式",
    names: { sea: "海运", air: "空运", truck: "卡车", rail: "铁路" },
    recommended: "推荐",
    discouraged: "不推荐",
    hints: {
      sea: "最便宜，也是我们推荐的方式：全程 40 到 45 天。",
      air: "最快：7 到 10 个工作日。适合货量小或着急的货。",
      truck: "风险更大：我们不推荐。大约 16 到 20 天。",
      rail: "我们同样不推荐。火车发车后 35 到 38 天。",
    },
  },
  formula: {
    label: "交货方式",
    names: { ddp: "包税到门", fob: "FOB", customs: "到目的国海关" },
    hints: {
      ddp: "送到你的地址，关税和进口增值税都包含在内（DDP）。",
      fob: "在中国的起运港或起飞机场交货，之后由你的货代接手。价格需要单独报价。",
      customs: "运到目的国海关，你自己清关、提货。价格需要单独报价。",
    },
  },
  address: {
    title: "派送地址",
    street: "详细地址",
    postcode: "邮编",
    city: "城市",
    country: "国家",
  },
  products: {
    title: "你的产品",
    item: "产品 {n}",
    name: "产品名称",
    namePlaceholder: "例如：台灯",
    goods: "货物类型",
    cartons: "箱数",
    length: "长（cm）",
    width: "宽（cm）",
    height: "高（cm）",
    weight: "单箱重（kg）",
    cartonHint: "填的是一箱的尺寸和重量。",
    units: "件数",
    battery: "带电池",
    reinforce: "打木架加固",
    reinforceHint: "每 m³ 15 美元，在我们广州仓库做。",
    add: "+ 添加产品",
    remove: "删除",
    summary: "{m3} · 体积重 {volumetric}",
    goodsReset: "货物类型的选项跟着运输方式变：检查一下每个产品选的类型。",
  },
  goods: {
    sea: {
      ordinary: "普货",
      kg1: "+1 RMB/kg：厨房用品、灯具、陶瓷、木制品、工具、相机、无人机…",
      kg3: "+3 RMB/kg：包袋、皮具、布料、床上用品、袜子、化妆品…",
      kg4: "+4 RMB/kg：服装、鞋子、内衣、泳衣…",
      phones: "手机：每台 +3 RMB",
      scooters: "滑板车、跑步机：每台 +7.5 欧元",
      bikes: "自行车：每辆 +75 欧元",
      refused: "不收：液体、粉末、纯电池、仿牌货…",
    },
    air: {
      ordinary: "普货",
      kg1: "+1 RMB/kg：木制品、五金、金属制品、手机壳和手机线…",
      kg2: "+2 RMB/kg：灯具、陶瓷、化妆品、美容仪器、相机、硬盘…",
      kg3: "+3 RMB/kg：玩具、皮具、纺织辅料",
      kg5: "+5 RMB/kg：手表、不含烟油的电子烟",
      kg7: "+7 RMB/kg：服装、鞋子、纺织品、手机、电脑、平板、无人机",
      refused: "不收：液体、粉末、纯电池、仿牌货…",
    },
    truck: {
      ordinary: "普货",
      kg1: "+1 RMB/kg：皮具、厨具、LED 灯具、玩具、耳机、Bluetooth 产品…",
      kg2: "+2 RMB/kg：五金、美容仪器、行车记录仪、GPS、笔、成人用品…",
      kg3: "+3 RMB/kg：假发、纺织品（服装和鞋子除外）",
      kg4: "+4 RMB/kg：平板",
      kg5: "+5 RMB/kg：服装、袜子、裤子、太阳能板、一次性电子烟",
      kg8: "+8 RMB/kg：鞋子",
      pieces: "手表、U 盘、游戏机、存储卡：每件 +3 RMB",
      phones: "手机：每台 +8 RMB",
      quote: "眼镜、箱包、无人机、扫地机器人、木制品…：单独报价",
      refused: "不收：液体、粉末、纯电池、仿牌货…",
    },
    rail: {
      ordinary: "普货",
      kg1: "+1 RMB/kg：厨房用品、灯具、陶瓷、木制品、工具、相机、无人机…",
      kg2: "+2 RMB/kg：包袋、皮具、布料、床上用品、袜子、化妆品…",
      kg4: "+4 RMB/kg：服装、鞋子、内衣、泳衣…",
      phones: "手机：每台 +3 RMB",
      scooters: "滑板车、跑步机：每台 +7.5 欧元",
      bikes: "自行车：每辆 +75 欧元",
      refused: "不收：液体、粉末、纯电池、仿牌货…",
    },
  },
  options: {
    declaration: "单独出口报关",
    declarationHint: "每票货 350 元。",
    declarationHintSea: "350 元，第一页之后每页加 50 元（每页 5 个产品）。",
  },
  calc: {
    title: "计费重量",
    rule: "实重和体积重（长 × 宽 × 高 ÷ 6000）取较大者，每箱最低 12 kg。",
    volumetric: "体积重",
    bracket: "重量段",
    billed: "按 {kg} kg 计费",
    volume: "总体积：{m3}",
  },
  estimate: {
    title: "你的估算结果",
    delayLabel: "时效",
    delays: {
      sea: "全程 40 到 45 天",
      air: "7 到 10 个工作日",
      truck: "大约 16 到 20 天",
      rail: "发车后 35 到 38 天",
    },
    surcharges: "这票货还要加收",
    oversize: "超规件：{n} 箱",
    singleCarton: "单箱发货",
    battery: "带电池的产品",
    reinforcement: "木架加固：{m3}",
    declaration: "单独出口报关",
  },
  quote: {
    title: "单独报价",
    reasons: {
      formula: "选 FOB 或到目的国海关，价格需要单独报价：我们会发邮件回复你。",
      country: "这种运输方式不能包税派送到这个国家：价格需要单独报价。",
      air_battery:
        "空运的话，带电池的产品要走一条只送 Amazon 仓库和物流仓库的专线：价格需要单独报价。",
      too_many_products: "超过 5 种不同的产品，价格需要单独报价。",
      goods_quote: "这类货需要单独报价。",
    },
  },
  warnings: {
    refusedGoods: "你有一种货不能走这种运输方式。",
    refusedCarton:
      "有一箱超出限制（超过 65 kg、单边超过 270 cm，或 长 + 2 × (宽 + 高) 超过 400 cm）：得重新打包。",
    noProducts: "至少填一个产品，写上箱数、尺寸和重量。",
  },
  gate: {
    locked: "注册后显示价格",
    lockedQuote: "需要单独报价：我们会发邮件回复你",
    points: [
      "逐项列明的详细价格，发到你的邮箱",
      "运费、附加费、加固费和我们 3% 的佣金",
      "你的估算结果，随时能转成报价",
    ],
    name: "姓名",
    phone: "电话（WhatsApp）",
    email: "你的邮箱",
    emailPlaceholder: "zhangsan@company.com",
    cta: "查看价格",
    ctaQuote: "获取报价",
    already: "已有账号",
    note: "这是参考价，运价表近期会更新。最终价格以你的报价单为准。",
    sending: "发送中…",
    sent: "已经发到 {email} 了。现在注册个账号，以后随时都能看你的报价。",
    sentQuote: "申请收到了：我们会回复到 {email}。现在注册个账号，随时跟进你的报价。",
    errors: {
      invalid_email: "这个邮箱地址好像不对。",
      rate_limited: "这个网络发的请求太多了，过一小时再试试吧。",
      failed: "没发出去。可以在 WhatsApp 上找我们，或者发邮件到 contact@sourcingpick.com。",
      invalid: "检查一下填的内容：还少了算价格要用的信息。",
    },
  },
  rules: {
    title: "我们怎么算你的运费",
    intro:
      "价格来自我们承运商的欧洲运价表：海运、空运、卡车和铁路。下面是这些运价表的规则，你的货就是按这些规则计费的。",
    sections: [
      {
        title: "计费重",
        text:
          "每箱按三个重量里最大的那个计费：实重、体积重（长 × 宽 × 高，单位 cm，再 ÷ 6000），以及 12 kg。最后把你所有产品的箱子加起来。",
      },
      {
        title: "运输方式和时效",
        text:
          "海运：全程 40 到 45 天，最便宜，也是我们推荐的方式。空运：7 到 10 个工作日，适合货量小或着急的货。卡车：大约 16 到 20 天，风险更大，我们不推荐。铁路：火车发车后 35 到 38 天，我们同样不推荐。最后一程的承运商由我们来选。",
      },
      {
        title: "重量段",
        text:
          "总重量越大，每公斤单价越低。海运：21 到 70 kg、71 到 299 kg、300 kg 及以上。空运：21 到 69 kg、70 到 99 kg、100 到 299 kg、300 kg 及以上。卡车：30 到 70 kg、71 到 100 kg、101 到 499 kg、500 kg 及以上（发英国是 300 kg 及以上）。铁路：45 到 74 kg、75 到 299 kg、300 kg 及以上。每票货最低计费重量：海运和空运 21 kg，卡车 30 kg，铁路 45 kg。",
      },
      {
        title: "交货方式",
        text:
          "包税到门（DDP）：送到你的地址，关税和进口增值税都包含在内；海运、空运和铁路每票货最多 5 种不同的产品。FOB：货在中国的起运港或起飞机场交付，之后由你的货代接手。到目的国海关：我们把货运到目的国海关，你自己清关、提货。FOB 和到目的国海关这两种，价格需要单独报价。",
      },
      {
        title: "派送国家",
        text:
          "每种运输方式都有自己能派送的欧洲国家；英国只有卡车能送。如果你选的运输方式不派送你所在的国家，价格需要单独报价。",
      },
      {
        title: "按货物类型加收",
        text:
          "每种运输方式都有自己的附加费，按对应产品的计费重每公斤收，或者按件收；表单里的货物类型选项会跟着运输方式变，里面的例子都来自运价表。海运：+1、+3 或 +4 元/公斤；手机每台 +3 元，滑板车和跑步机每台 +7.5 欧元，自行车每辆 +75 欧元。铁路：+1、+2 或 +4 元/公斤，按件加收的和海运一样。空运：+1、+2、+3、+5 或 +7 元/公斤。卡车：+1 到 +8 元/公斤；手表、U 盘、游戏机和存储卡每件 +3 元，手机每台 +8 元；眼镜、箱包、无人机和木制品单独报价。各项附加费可以叠加。",
      },
      {
        title: "带电池的产品",
        text:
          "海运和铁路可以走。卡车：每票货加收 100 元。空运：要走一条从 Hong Kong 出发、只送 Amazon 仓库和物流仓库的专线，价格需要单独报价。",
      },
      {
        title: "超规件",
        text:
          "不收：超过 65 kg、单边超过 270 cm，或 长 + 2 × (宽 + 高) 超过 400 cm。每箱只收其中最高的一项附加费：30 到 40 kg，或最长边超过 100 cm，或第二长边超过 76 cm，收 130 元；超过 40 kg，收 600 元；长 + 2 × (宽 + 高) 在 266 到 320 cm 之间，收 120 元，在 321 到 400 cm 之间，收 900 元。一票只有一箱：加收 80 元（卡车发英国加收 50 元）。",
      },
      {
        title: "打木架加固",
        text:
          "易碎的货，我们会在广州仓库给箱子打木架加固：按加固产品的体积，每 m³ 15 美元。",
      },
      {
        title: "单独出口报关",
        text:
          "每票货 350 元；海运的话，第一页之后每页加 50 元（每页 5 行）。走卡车的话，出口资料免费帮你做。",
      },
      {
        title: "我们的佣金",
        text: "按整个估算金额收 3%：运费、附加费和加固费，在你的报价单上单独一行列出。",
      },
      {
        title: "价格不包括这些",
        text:
          "偏远地区（附加费按承运商账单另收）、改地址、海关查验费、保险，以及我们在广州仓库的其他服务（收货、验货、装货），这些会在你的报价单上写明价格。",
      },
      {
        title: "不收的货",
        text:
          "液体、粉末、仿牌货、纯电池、移动电源、电动独轮车、烟草、食品、药品、腐蚀性、易燃或易爆物品、武器。出口前查验时要是查出敏感货，罚款 3,000 元，退回的费用你来出，另外每公斤还要收 8 元操作费。",
      },
      {
        title: "包装要求",
        text:
          "所有产品都要标 MADE IN CHINA；纺织品、皮具、箱包和鞋子还要有成分和洗护标签。不要用黄色胶带。",
      },
      {
        title: "丢件怎么办",
        text:
          "海运和铁路：丢件或被海关扣货，按申报价值赔偿，每公斤最多赔 20 元，运费不退；货物损坏不赔。空运和卡车：UPS 接手之前丢件，或者被海关扣押，每公斤赔 40 元；之后按 UPS 的规则赔，每票最多 100 美元。值钱的货，建议买个保险。",
      },
    ],
  },
  email: {
    sep: "：",
    subject: "你的运费估算：{total}",
    subjectQuote: "你的运费报价申请",
    heading: "你的 SourcingPick 运费估算",
    headingQuote: "你的 SourcingPick 报价申请",
    intro: "这是你这票货的费用明细，是按我们承运商的欧洲运价表和它的全部规则算出来的。",
    introQuote: "你的申请我们收到了。下面是你填的信息；我们之后会给你发报价。",
    summary: {
      mode: "运输方式",
      formula: "交货方式",
      address: "派送地址",
      cartons: "箱数",
      real: "实重",
      volumetric: "体积重",
      chargeable: "计费重",
      bracket: "重量段和单价",
      delay: "时效",
    },
    productsTitle: "你的产品",
    product: "{name}：{cartons} 箱 · {m3} · 计费重 {chargeable}",
    items: {
      freight: "运费（{kg} kg × {rate} 元/公斤）",
      goods: "货物附加费，{product}（{kg} kg × {rate} 元/公斤）",
      pieces: "{product}：{units} × {rate} 元",
      units: "{product}：{units} × {rate} 欧元",
      singleCarton: "单箱发货",
      oversize: "超规件（{cartons} 箱）",
      battery: "带电池的产品",
      declaration: "单独出口报关（{pages} 页）",
      reinforcement: "木架加固（{m3} m³ × {rate} 美元）",
    },
    subtotal: "小计",
    commission: "SourcingPick 佣金（3%）",
    total: "预估总价",
    notIncludedTitle: "不包括",
    notIncluded: [
      "偏远地区附加费、改地址、海关查验费",
      "保险",
      "我们在广州仓库的其他服务（收货、验货、装货），价格写在你的报价单上",
    ],
    disclaimer:
      "这是参考价，按我们承运商现在的运价表算的（运价表近期会更新）。最终价格以你的报价单为准。",
    quoteNext: "我们之后会给你发一份详细报价。",
    signup: "注册 SourcingPick 账号，随时跟进你的报价：",
    signupCta: "注册账号",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
