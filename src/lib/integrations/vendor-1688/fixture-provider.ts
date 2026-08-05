import "server-only";
import {
  type Vendor1688Offer,
  type Vendor1688Provider,
} from "./provider";
import { offerUrl } from "./url";

/**
 * Development provider. Returns a small fixed catalogue so the search, detail,
 * pricing and order flows can be built and reviewed before anyone signs with a
 * data reseller.
 *
 * `live: false` is load-bearing: the UI uses it to label the catalogue as
 * sample data, and `submitOrder` refuses rather than pretending. A stub that
 * silently "succeeds" would be worse than no stub at all — it would let a real
 * buyer believe an order had been placed.
 */
const FIXTURES: Vendor1688Offer[] = [
  {
    offerId: "612345678901",
    url: offerUrl("612345678901"),
    title: "纯棉帆布手提袋 定制logo 环保购物袋",
    titleTranslated: "Cotton canvas tote bag, custom logo, reusable shopper",
    images: [],
    unitPriceFen: 1240,
    moq: 500,
    supplierName: "义乌市布艺有限公司",
    attributes: [
      { name: "材质", value: "12oz 全棉帆布" },
      { name: "尺寸", value: "38 × 42 cm" },
    ],
  },
  {
    offerId: "698765432109",
    url: offerUrl("698765432109"),
    title: "牛皮纸气泡信封 快递包装袋",
    titleTranslated: "Kraft bubble mailer, courier packaging",
    images: [],
    unitPriceFen: 86,
    moq: 2000,
    supplierName: "temasek 包装厂",
    attributes: [{ name: "规格", value: "A4 / 250 × 330 mm" }],
  },
  {
    offerId: "655544433322",
    url: offerUrl("655544433322"),
    title: "搪瓷马克杯 复古咖啡杯 可定制",
    titleTranslated: "Enamel mug, vintage coffee cup, customisable",
    images: [],
    unitPriceFen: 980,
    moq: 300,
    supplierName: "潮州市金瓷实业",
    attributes: [{ name: "容量", value: "350 ml" }],
  },
];

export const fixtureProvider: Vendor1688Provider = {
  name: "fixture",
  live: false,

  async search(query) {
    const q = query.trim().toLowerCase();
    const offers = q
      ? FIXTURES.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            (o.titleTranslated ?? "").toLowerCase().includes(q),
        )
      : FIXTURES;
    return { offers, total: offers.length };
  },

  async getOffer(offerId) {
    return FIXTURES.find((o) => o.offerId === offerId) ?? null;
  },

  async submitOrder() {
    // Never fake a success. Until a real provider is configured, submitting is
    // an operational no-op and the caller must surface that.
    return { ok: false, reason: "provider_not_configured" };
  },
};
