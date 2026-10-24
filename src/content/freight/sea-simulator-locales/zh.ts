import type { SeaSimulatorCopy } from "../sea-simulator";

export const zh: SeaSimulatorCopy = {
  eyebrow: "估算运费",
  title: "你的货走海运要多少钱？",
  intro:
    "填上你的箱子信息：我们先算出计费重，再按我们承运商的欧洲海运运价表一项一项算。详细价格会发到你的邮箱。",
  regime: {
    label: "清关方式",
    ddp: "包税",
    ddpHint: "关税和进口增值税都已经包含在价格里。",
    vat: "用你的增值税号",
    vatHint: "进口增值税你自己申报抵扣：需要有效的增值税号和 EORI 号。",
  },
  deliverTo: {
    label: "派送地址",
    amazon: "Amazon 仓库",
    other: "其他地址",
    thirdParty: "第三方海外仓",
  },
  warehouse: { label: "仓库", byCountry: "其他 Amazon 仓库（按国家选）" },
  country: "派送国家",
  carrier: {
    label: "承运商",
    truck: "卡车直送仓库",
    upsDpd: "UPS 或 DPD（由我们选）",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "货物类型",
    ordinary: "普货",
    plus1: "厨具、灯具、木制品、工具、数码产品…",
    plus3: "纺织品、包袋、皮具、化妆品…",
    plus4: "服装、鞋子、内衣…",
    refused: "液体、粉末、纯电池…",
    hint: "每一类具体包括哪些货，看下面的“我们怎么算你的运费”。",
  },
  units: {
    label: "按件计费的产品",
    phones: "手机",
    scooters: "滑板车、跑步机",
    bikes: "自行车",
  },
  cartons: {
    title: "你的箱子",
    line: "第 {n} 组",
    quantity: "箱数",
    length: "长（cm）",
    width: "宽（cm）",
    height: "高（cm）",
    weight: "单箱重（kg）",
    add: "+ 添加一组",
    remove: "删除",
  },
  designations: { label: "品名数量", hint: "要申报几种不同的产品。" },
  options: {
    declaration: "单独出口报关",
    declarationHint: "350 元，第一页之后每页加 50 元。",
    signature: "派送时签名签收",
    signatureHint: "UPS 派送：每箱 30 元。",
  },
  calc: {
    title: "怎么算的",
    real: "实重",
    volumetric: "体积重",
    formula: "长 × 宽 × 高 ÷ 6000",
    chargeable: "计费重",
    chargeableHint: "逐箱比较，取三者中最大的",
    bracket: "重量段",
    billed: "按 {kg} kg 计费",
    volume: "总体积：{m3}",
    cartons: "{n} 箱",
  },
  estimate: {
    title: "你的估算结果",
    mode: "海运 · 中国 → 欧洲",
    delayLabel: "时效",
    delay: "全程 40 到 45 天",
    surcharges: "这票货还要加收",
    oversize: "超规件：{n} 箱",
    singleCarton: "单箱发货",
    nonAmazon: "非 Amazon 地址",
    vatClearance: "用你的增值税号清关",
  },
  warnings: {
    refusedGoods: "这类货不能走海运。",
    refusedCarton:
      "有一箱超出限制（超过 65 kg、单边超过 270 cm，或 长 + 2 × (宽 + 高) 超过 400 cm）：得重新打包。",
    tooManyDesignations: "包税的话，一票货最多 5 个品名：超过了，我们单独给你报价。",
    noCartons: "至少填一箱，写上尺寸和重量。",
  },
  gate: {
    locked: "注册后显示价格",
    points: [
      "逐项列明的详细价格，发到你的邮箱",
      "运费、附加费和我们 3% 的佣金",
      "你的估算结果，随时能转成报价",
    ],
    email: "你的邮箱",
    emailPlaceholder: "zhangsan@company.com",
    cta: "查看价格",
    already: "已有账号",
    note: "这是参考价，运价表近期会更新。最终价格以你的报价单为准。",
    sending: "发送中…",
    sent: "已经发到 {email} 了。现在注册个账号，以后随时都能看你的报价。",
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
      "价格来自我们承运商的欧洲海运运价表（船公司：EMC 和 COSCO）。下面是这份运价表的全部规则，你的货就是按这些规则计费的。",
    sections: [
      {
        title: "计费重",
        text:
          "每箱按三个重量里最大的那个计费：实重、体积重（长 × 宽 × 高，单位 cm，再 ÷ 6000），以及每箱最低 12 kg（包税、卡车派送到 Amazon 仓库的，每箱最低 10 kg）。最后把所有箱子加起来。",
      },
      {
        title: "重量段",
        text:
          "总重量越大，每公斤单价越低：21 到 70 kg、71 到 299 kg、300 kg 及以上。每票货最低按 21 kg 计费；从 71 kg 起步的卡车线路，最低按 71 kg 计费。",
      },
      {
        title: "包税，还是用你的增值税号",
        text:
          "包税：关税和进口增值税都含在价格里，每票货最多 5 个品名。用你的增值税号：你提供有效的增值税号和 EORI 号，进口增值税你自己申报抵扣；每票货收 380 元清关费，关税和税费按实际金额另收，超过 5 个品名的，每多一个品名收 30 元。遇到海关查验：900 欧元的操作费由同一个集装箱里的各票货分摊，另收仓储费，每托盘每天 3 欧元。",
      },
      {
        title: "目的地",
        text:
          "卡车派送到 Amazon 仓库；在德国、法国、意大利和西班牙由 UPS 或 DPD 派送（承运商由我们选）；或在 23 个国家由 UPS 派送。不是 Amazon 仓库的地址（个人、企业）：每公斤加 1 元，一票只有一箱的，最低收 100 元。",
      },
      {
        title: "按货物类型加收",
        text:
          "+1 元/公斤：厨房用具、灯具、陶瓷、汽车和自行车配件、木制品或竹制品、笔、帐篷、工具、相机、行车记录仪、美容仪器、多媒体播放器、扫地机器人、投影仪、硬盘、太阳能灯、雨伞、假发、行李箱、无人机、U 盘等。+3 元/公斤：成人用品、化妆品、服装辅料、袜子、帽子、手套、床上用品、布料、包袋、皮具。+4 元/公斤：服装、鞋子、内衣、泳衣，以及所有穿戴类纺织品。按件加收：手机每台 +3 元，滑板车和跑步机每台 +7.5 欧元，自行车每辆 +75 欧元。各项附加费可以叠加。",
      },
      {
        title: "超规件",
        text:
          "不收：超过 65 kg、单边超过 270 cm，或 长 + 2 × (宽 + 高) 超过 400 cm。每箱只收其中最高的一项附加费：30 到 40 kg，或最长边超过 100 cm，或第二长边超过 76 cm，收 130 元；超过 40 kg，收 600 元；长 + 2 × (宽 + 高) 在 266 到 320 cm 之间，收 120 元，在 321 到 400 cm 之间，收 900 元。一票只有一箱：加收 80 元。",
      },
      {
        title: "可选服务",
        text:
          "单独出口报关：350 元，第一页之后每页加 50 元（每页 5 行）。UPS 派送签名签收：每箱 30 元。指定承运商：每公斤 +1 元（QOT Express 线路指定 DHL 为 +0.5 元）。",
      },
      {
        title: "时效",
        text:
          "每周五截单，周三开船。开船后约 38 到 42 天提柜；全程 40 到 45 天。",
      },
      {
        title: "我们的佣金",
        text: "通过我们结算的运费收 3%，在你的报价单上单独一行列出。",
      },
      {
        title: "价格不包括这些",
        text:
          "偏远地区（附加费按承运商账单另收）、改地址、海关查验费、用你的增值税号清关时的增值税和关税、保险，以及我们在广州仓库的服务（收货、验货、加固、装柜），这些会在你的报价单上写明价格。",
      },
      {
        title: "不收的货",
        text:
          "液体、粉末、仿牌货、纯电池、移动电源、电动独轮车、烟草、食品、药品、腐蚀性、易燃或易爆物品、武器。内置电池的产品和带磁产品可以走。出口前查验时要是查出敏感货，罚款 3,000 元，退回的费用你来出，另外每公斤还要收 8 元操作费。",
      },
      {
        title: "包装要求",
        text:
          "所有产品都要标 MADE IN CHINA；纺织品、皮具、箱包和鞋子还要有成分和洗护标签。发 Amazon：每箱贴两张入仓条码标签，SKU 和 FBA 标签用透明胶带保护。不要用黄色胶带。",
      },
      {
        title: "丢件怎么办",
        text:
          "丢件或被海关扣货：按申报价值赔偿，每公斤最多赔 20 元，运费不退。货物损坏不赔：值钱的货，建议买个保险。",
      },
    ],
  },
  email: {
    sep: "：",
    subject: "你的海运运费估算：{total}",
    heading: "你的 Sourcing Pick 运费估算",
    intro:
      "这是你这票海运货的费用明细，是按我们承运商的欧洲海运运价表和它的全部规则算出来的。",
    summary: {
      regime: "清关方式",
      delivery: "派送",
      cartons: "箱数",
      real: "实重",
      volumetric: "体积重",
      chargeable: "计费重",
      bracket: "重量段和单价",
      delay: "时效",
    },
    items: {
      freight: "海运费（{kg} kg × {rate} 元/公斤）",
      goods: "货物附加费（{kg} kg × {rate} 元/公斤）",
      nonAmazon: "非 Amazon 地址（+1 元/公斤，单箱发货最低 100 元）",
      singleCarton: "单箱发货",
      oversize: "超规件（{cartons} 箱）",
      phones: "手机（{units} × 3 元）",
      vatClearance: "用你的增值税号清关",
      declaration: "单独出口报关（{pages} 页）",
      designations: "超过 5 个的品名（{extra} × 30 元）",
      signature: "UPS 派送签名签收（{cartons} × 30 元）",
      scooters: "滑板车和跑步机（{units} × 7.5 欧元）",
      bikes: "自行车（{units} × 75 欧元）",
    },
    subtotal: "运输小计",
    commission: "Sourcing Pick 佣金（运费的 3%）",
    total: "预估总价",
    notIncludedTitle: "不包括",
    notIncluded: [
      "偏远地区附加费、改地址、海关查验费",
      "用你的增值税号清关时的进口增值税和关税",
      "保险",
      "我们在广州仓库的服务（收货、验货、加固、装柜），价格写在你的报价单上",
    ],
    disclaimer:
      "这是参考价，按我们承运商现在的运价表算的（运价表近期会更新）。最终价格以你的报价单为准。",
    signup: "注册 Sourcing Pick 账号，把这份估算转成报价：",
    signupCta: "注册账号",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
