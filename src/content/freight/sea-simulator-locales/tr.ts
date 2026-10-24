import type { SeaSimulatorCopy } from "../sea-simulator";

export const tr: SeaSimulatorCopy = {
  eyebrow: "Sevkiyat tahmini",
  title: "Sevkiyatınız gemiyle ne kadara mal olur?",
  intro:
    "Kolilerinizi girin: faturalanacak ağırlığı hesaplar ve taşıyıcımızın Avrupa deniz navlunu tarifesini kalem kalem uygularız. Ayrıntılı fiyat size e-postayla gönderilir.",
  regime: {
    label: "Gümrükleme",
    ddp: "Vergiler dâhil",
    ddpHint: "Gümrük vergileri ve ithalat KDV’si fiyata dâhildir.",
    vat: "Kendi KDV numaranızla",
    vatHint: "İthalat KDV’sini kendiniz beyan edersiniz (ters ibraz): geçerli bir KDV numarası ve EORI gerekir.",
  },
  deliverTo: {
    label: "Teslimat",
    amazon: "Amazon deposu",
    other: "Başka bir adres",
    thirdParty: "Lojistik deposu",
  },
  warehouse: { label: "Depo", byCountry: "Başka bir Amazon deposu (ülkeye göre)" },
  country: "Teslimat ülkesi",
  carrier: {
    label: "Taşıyıcı",
    truck: "Depoya kadar kamyonla",
    upsDpd: "UPS veya DPD, biz seçeriz",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Mal türü",
    ordinary: "Genel kargo",
    plus1: "Mutfak, aydınlatma, ahşap, el aletleri, elektronik…",
    plus3: "Tekstil, çanta, deri, kozmetik…",
    plus4: "Giyim, ayakkabı, iç çamaşırı…",
    refused: "Sıvılar, tozlar, tek başına bataryalar…",
    hint: "Her kategorinin ayrıntısı aşağıda, “Fiyatınızı nasıl hesaplıyoruz” bölümünde.",
  },
  units: {
    label: "Adet olarak sayılan ürünler",
    phones: "Telefonlar",
    scooters: "Scooter, koşu bandı",
    bikes: "Bisikletler",
  },
  cartons: {
    title: "Kolileriniz",
    line: "Parti {n}",
    quantity: "Koli",
    length: "Uzun. (cm)",
    width: "Gen. (cm)",
    height: "Yük. (cm)",
    weight: "Ağırlık (kg)",
    add: "+ Parti ekleyin",
    remove: "Kaldır",
  },
  designations: { label: "Ürün çeşitleri", hint: "Beyan edilen farklı ürün sayısı." },
  options: {
    declaration: "Ayrı ihracat beyannamesi",
    declarationHint: "350 RMB, ilk sayfadan sonraki her sayfa için +50 RMB.",
    signature: "Teslimatta imza",
    signatureHint: "UPS teslimatları: koli başına 30 RMB.",
  },
  calc: {
    title: "Nasıl hesaplanıyor",
    real: "Gerçek ağırlık",
    volumetric: "Hacimsel ağırlık",
    formula: "U × G × Y ÷ 6.000",
    chargeable: "Faturalanacak ağırlık",
    chargeableHint: "Koli koli, üçünden en yükseği",
    bracket: "Kademe",
    billed: "{kg} kg faturalanır",
    volume: "Toplam hacim: {m3}",
    cartons: "{n} koli",
  },
  estimate: {
    title: "Tahmininiz",
    mode: "Gemi · Çin → Avrupa",
    delayLabel: "Teslim süresi",
    delay: "40 ila 45 gün, uçtan uca",
    surcharges: "Sevkiyatınıza eklenenler",
    oversize: "Standart dışı koliler: {n}",
    singleCarton: "Tek kolilik sevkiyat",
    nonAmazon: "Amazon dışı adres",
    vatClearance: "Kendi KDV numaranızla gümrükleme",
  },
  warnings: {
    refusedGoods: "Bu mal deniz yoluyla kabul edilmiyor.",
    refusedCarton:
      "Bir koli sınırları aşıyor (65 kg, bir kenarda 270 cm ya da uzunluk + 2 × (genişlik + yükseklik) toplamı 400 cm’nin üzerinde): yeniden paketlenmesi gerekir.",
    tooManyDesignations: "Vergiler dâhil seçeneğinde bir sevkiyat en fazla 5 ürün çeşidi içerebilir: daha fazlası için teklif hazırlarız.",
    noCartons: "Ölçüleri ve ağırlığıyla birlikte en az bir koli girin.",
  },
  gate: {
    locked: "Fiyat, kayıttan sonra görünür",
    points: [
      "Kalem kalem ayrıntılı fiyat, e-postanıza gönderilir",
      "Navlun, ek ücretler ve %3’lük komisyonumuz",
      "Tahmininiz, teklife dönüşmeye hazır",
    ],
    email: "E-posta adresiniz",
    emailPlaceholder: "adiniz@sirketiniz.com",
    cta: "Fiyatı görün",
    already: "Zaten hesabım var",
    note: "Yaklaşık fiyatlar; tarife yakında güncellenecek. Kesin fiyat teklifinizde yer alır.",
    sending: "Gönderiliyor…",
    sent: "{email} adresine gönderildi. Tekliflerinize ulaşmak için şimdi hesabınızı oluşturun.",
    errors: {
      invalid_email: "Bu e-posta adresi geçerli görünmüyor.",
      rate_limited: "Bu bağlantıdan çok fazla istek geldi. Bir saat sonra tekrar deneyin.",
      failed: "Gönderim yapılamadı. Bize WhatsApp’tan ya da contact@sourcingpick.com adresinden yazın.",
      invalid: "Alanları kontrol edin: fiyatı hesaplamak için bir bilgi eksik.",
    },
  },
  rules: {
    title: "Fiyatınızı nasıl hesaplıyoruz",
    intro:
      "Fiyat, taşıyıcımızın (EMC ve COSCO hatları) Avrupa deniz navlunu tarifesinden gelir. Tarifenin tüm kuralları, sevkiyatınıza uygulandıkları biçimiyle aşağıda.",
    sections: [
      {
        title: "Faturalanacak ağırlık",
        text:
          "Her koli, üç ağırlıktan en yükseği üzerinden faturalanır: gerçek ağırlığı, hacimsel ağırlığı (cm cinsinden uzunluk × genişlik × yükseklik ÷ 6.000) ve koli başına en az 12 kg (vergiler dâhil seçeneğinde, kamyonla teslim edilen Amazon depoları için 10 kg). Ardından kolilerin ağırlıkları toplanır.",
      },
      {
        title: "Ağırlık kademeleri",
        text:
          "Kilo fiyatı, toplam ağırlık arttıkça düşer: 21 ila 70 kg, 71 ila 299 kg, 300 kg ve üzeri. Bir sevkiyat en az 21 kg üzerinden faturalanır; 71 kg’dan başlayan kamyon hatlarında ise en az 71 kg üzerinden.",
      },
      {
        title: "Vergiler dâhil ya da kendi KDV numaranızla",
        text:
          "Vergiler dâhil: gümrük vergileri ve ithalat KDV’si fiyata dâhildir; sevkiyat başına en fazla 5 ürün çeşidi. Kendi KDV numaranızla: geçerli bir KDV numarası ve EORI sağlarsınız, ithalat KDV’sini kendiniz beyan edersiniz (ters ibraz); sevkiyat başına 380 RMB gümrükleme ücreti, gümrük vergileri ve diğer vergiler gerçek tutarı üzerinden size yansıtılır, 5’i aşan her ürün çeşidi için 30 RMB. Gümrük kontrolü durumunda: konteynerdeki partiler arasında paylaştırılan 900 € elleçleme ücreti ve depolamada palet başına günlük 3 €.",
      },
      {
        title: "Varış yeri",
        text:
          "Kamyonla teslim edilen Amazon depoları; Almanya, Fransa, İtalya ve İspanya’da UPS veya DPD ile teslimat (taşıyıcıyı biz seçeriz) ya da 23 ülkede UPS ile teslimat. Amazon deposu olmayan bir adres (bireysel alıcı, şirket): kilo başına +1 RMB, tek kolilik bir sevkiyatta en az 100 RMB.",
      },
      {
        title: "Mal türüne göre ek ücretler",
        text:
          "+1 RMB/kg: mutfak gereçleri, aydınlatma ürünleri, seramikler, oto ve bisiklet aksesuarları, ahşap veya bambu ürünler, kalemler, çadırlar, el aletleri, kameralar, araç kameraları, güzellik cihazları, multimedya oynatıcılar, robot süpürgeler, projeksiyon cihazları, sabit diskler, güneş enerjili lambalar, şemsiyeler, peruklar, valizler, dronlar, USB bellekler… +3 RMB/kg: yetişkin ürünleri, kozmetikler, giyim malzemeleri, çoraplar, bereler, eldivenler, yatak takımları, kumaşlar, çantalar, deri. +4 RMB/kg: giysiler, ayakkabılar, iç çamaşırları, mayolar ve giyilen tüm tekstil ürünleri. Adet başına: telefonlar +3 RMB, scooter ve koşu bantları +7,50 €, bisikletler +75 €. Ek ücretler birbirine eklenir.",
      },
      {
        title: "Standart dışı koliler",
        text:
          "Kabul edilmez: 65 kg’dan ağır, bir kenarı 270 cm’den uzun ya da uzunluk + 2 × (genişlik + yükseklik) toplamı 400 cm’yi aşan koliler. Her koli için en yüksek ek ücret uygulanır: 30 ile 40 kg arasında ya da en uzun kenar 100 cm’yi veya ikinci kenar 76 cm’yi aşıyorsa 130 RMB; 40 kg’ın üzerinde 600 RMB; uzunluk + 2 × (genişlik + yükseklik) 266 ile 320 cm arasındaysa 120 RMB, 321 ile 400 cm arasındaysa 900 RMB. Tek kolilik sevkiyat: +80 RMB.",
      },
      {
        title: "Seçenekler",
        text:
          "Ayrı ihracat beyannamesi: 350 RMB, ilk sayfadan sonraki her sayfa için +50 RMB (sayfa başına 5 satır). UPS teslimatlarında imza: koli başına 30 RMB. Taşıyıcıyı siz belirlerseniz: kilo başına +1 RMB (QOT Express hattında DHL için +0,5 RMB).",
      },
      {
        title: "Teslim süreleri",
        text:
          "Kapanış cuma günü, kalkış çarşamba günü. Teslim alma, geminin kalkışından yaklaşık 38 ila 42 gün sonra; uçtan uca 40 ila 45 gün.",
      },
      {
        title: "Komisyonumuz",
        text: "Size yansıttığımız navlun üzerinden %3; teklifinizde ayrı bir kalemde gösterilir.",
      },
      {
        title: "Fiyata dâhil olmayanlar",
        text:
          "Uzak bölgeler (ek ücret, taşıyıcının faturası üzerinden yansıtılır), adres değişikliği, gümrük kontrolü masrafları, kendi KDV numaranızla yapılan sevkiyatlarda KDV ve gümrük vergileri, sigorta ve teklifinizde fiyatlandırılan, Guangzhou’daki depo hizmetlerimiz (mal kabul, kontrol, güçlendirme, yükleme).",
      },
      {
        title: "Kabul edilmeyen mallar",
        text:
          "Sıvılar, tozlar, sahte ürünler, tek başına bataryalar, taşınabilir şarj cihazları (powerbank), elektrikli tek tekerlekler, tütün, gıda ürünleri, ilaçlar, aşındırıcı, yanıcı veya patlayıcı ürünler, silahlar. Entegre bataryalı ürünler ve manyetik ürünler kabul edilir. İhracat öncesi kontrolde tespit edilen hassas bir mal için 3.000 RMB para cezası, geri gönderim masrafı ve 8 RMB/kg elleçleme ücreti ödenir.",
      },
      {
        title: "Ambalaj",
        text:
          "Tüm ürünlerin üzerinde MADE IN CHINA ibaresi bulunmalı; tekstil, deri, bavul ve ayakkabılarda ayrıca içerik ve bakım etiketi olmalı. Amazon için: her kolide iki adet depo girişi barkod etiketi; SKU ve FBA etiketleri şeffaf bantla korunmalı. Sarı koli bandından kaçının.",
      },
      {
        title: "Kayıp durumunda",
        text:
          "Kayıp ya da gümrükte takılma: beyan edilen değer üzerinden, kilo başına en fazla 20 RMB tazminat; navlun iade edilmez. Hasarlar tazmin edilmez: değerli mallar için sigorta yaptırın.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Deniz navlunu tahmininiz: {total}",
    heading: "Sourcing Pick tahmininiz",
    intro:
      "Taşıyıcımızın Avrupa deniz navlunu tarifesi ve tüm kurallarıyla hesaplanan gemi sevkiyatınızın ayrıntıları aşağıdadır.",
    summary: {
      regime: "Gümrükleme",
      delivery: "Teslimat",
      cartons: "Koliler",
      real: "Gerçek ağırlık",
      volumetric: "Hacimsel ağırlık",
      chargeable: "Faturalanacak ağırlık",
      bracket: "Kademe ve birim fiyat",
      delay: "Teslim süresi",
    },
    items: {
      freight: "Deniz navlunu ({kg} kg × {rate} RMB/kg)",
      goods: "Mal türü ek ücreti ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Amazon dışı adres (+1 RMB/kg, tek kolide en az 100 RMB)",
      singleCarton: "Tek kolilik sevkiyat",
      oversize: "Standart dışı koliler ({cartons} koli)",
      phones: "Telefonlar ({units} × 3 RMB)",
      vatClearance: "Kendi KDV numaranızla gümrükleme",
      declaration: "Ayrı ihracat beyannamesi ({pages} sayfa)",
      designations: "5’in üzerindeki ürün çeşitleri ({extra} × 30 RMB)",
      signature: "UPS teslimatında imza ({cartons} × 30 RMB)",
      scooters: "Scooter ve koşu bantları ({units} × 7,50 €)",
      bikes: "Bisikletler ({units} × 75 €)",
    },
    subtotal: "Taşıma ara toplamı",
    commission: "Sourcing Pick komisyonu (navlunun %3’ü)",
    total: "Tahmini toplam",
    notIncludedTitle: "Dâhil olmayanlar",
    notIncluded: [
      "Uzak bölgeler, adres değişikliği, gümrük kontrolü masrafları",
      "Kendi KDV numaranızla yapılan sevkiyatlarda ithalat KDV’si ve gümrük vergileri",
      "Sigorta",
      "Guangzhou’daki depo hizmetlerimiz (mal kabul, kontrol, güçlendirme, yükleme), teklifinizde fiyatlandırılır",
    ],
    disclaimer:
      "Taşıyıcımızın güncel tarifesiyle hazırlanmış yaklaşık fiyat (tarife yakında güncellenecek). Kesin fiyat teklifinizde yer alır.",
    signup: "Bu tahmini teklife dönüştürmek için Sourcing Pick hesabınızı oluşturun:",
    signupCta: "Hesabınızı oluşturun",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
