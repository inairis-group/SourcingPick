import type { Locale } from "@/lib/i18n/config";

/**
 * The warehouse address, given to signed-up clients only: the public pages
 * say it is sent after sign-up (address-gate.tsx), and the client dashboard
 * shows it. In Chinese for the suppliers, in Latin letters and with the
 * receiving hours in each language, as the warehouse page wrote them.
 */
export const WAREHOUSE_ADDRESS_ZH = "广东省广州市白云区钟落潭镇长腰岭康海北路113号";

export const WAREHOUSE_PHONE = "+86 195 5817 9800";

export const warehouseAddress: Record<Locale, { latin: string; hours: string }> = {
  fr: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, district de Baiyun, Guangzhou",
    hours: "9 h – 23 h, heure de Chine (UTC+8)",
  },
  en: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, Baiyun District, Guangzhou",
    hours: "9 am – 11 pm, China time (UTC+8)",
  },
  zh: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, 广州白云区",
    hours: "9:00–23:00（中国时间 UTC+8）",
  },
  es: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, distrito de Baiyun, Guangzhou",
    hours: "9:00 – 23:00, hora de China (UTC+8)",
  },
  de: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, Bezirk Baiyun, Guangzhou",
    hours: "9–23 Uhr, China-Zeit (UTC+8)",
  },
  it: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, distretto di Baiyun, Guangzhou",
    hours: "9–23, ora cinese (UTC+8)",
  },
  pt: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, distrito de Baiyun, Guangzhou",
    hours: "9h – 23h, hora da China (UTC+8)",
  },
  nl: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, district Baiyun, Guangzhou",
    hours: "9–23 uur, Chinese tijd (UTC+8)",
  },
  ar: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan، منطقة بايون، قوانغتشو",
    hours: "من 9 صباحًا إلى 11 مساءً بتوقيت الصين (UTC+8)",
  },
  ru: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, район Байюнь, Гуанчжоу",
    hours: "9:00–23:00 по китайскому времени (UTC+8)",
  },
  tr: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, Baiyun ilçesi, Guangzhou",
    hours: "09.00–23.00, Çin saati (UTC+8)",
  },
  pl: {
    latin: "113 Kanghai Beilu, Changyaoling, Zhongluotan, dzielnica Baiyun, Guangzhou",
    hours: "9.00–23.00 czasu chińskiego (UTC+8)",
  },
};
