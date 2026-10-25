import type { FreightSimulatorCopy } from "../simulator";

export const tr: FreightSimulatorCopy = {
  eyebrow: "Sevkiyat simülatörü",
  title: "Sevkiyatınız ne kadara mal olur?",
  intro:
    "Adresinizi ve ürünlerinizi girin: her birinin hacimsel ağırlığını hesaplar ve taşıyıcımızın Avrupa tarifesini uygularız. Ayrıntılı fiyat size e-postayla gönderilir.",
  mode: {
    label: "Taşıma türü",
    names: { sea: "Gemi", air: "Uçak", truck: "Kamyon", rail: "Tren" },
    recommended: "Önerilen",
    discouraged: "Önerilmez",
    hints: {
      sea: "En ucuzu, önerdiğimiz de bu: uçtan uca 40 ila 45 gün.",
      air: "En hızlısı: 7 ila 10 iş günü. Küçük ya da acil bir sevkiyat için.",
      truck: "Daha riskli: önermiyoruz. Yaklaşık 16 ila 20 gün.",
      rail: "Bunu da önermiyoruz. Trenin kalkışından sonra 35 ila 38 gün.",
    },
  },
  formula: {
    label: "Teslim şekli",
    names: { ddp: "Vergiler dâhil teslim", fob: "FOB", customs: "Gümrüğe kadar" },
    hints: {
      ddp: "Adresinize teslim; gümrük vergileri ve ithalat KDV’si dâhil (DDP).",
      fob: "Mallar Çin’deki çıkış limanında ya da havalimanında teslim edilir; işi sizin nakliye firmanız devralır. Fiyat teklifle belirlenir.",
      customs: "Mallar varış gümrüğüne kadar taşınır; gümrükleme işlemlerini siz yapar ve malları teslim alırsınız. Fiyat teklifle belirlenir.",
    },
  },
  address: {
    title: "Teslimat adresi",
    street: "Adres",
    postcode: "Posta kodu",
    city: "Şehir",
    country: "Ülke",
  },
  products: {
    title: "Ürünleriniz",
    item: "Ürün {n}",
    name: "Ürün adı",
    namePlaceholder: "Örn. masa lambaları",
    goods: "Mal türü",
    cartons: "Koli",
    length: "Uzun. (cm)",
    width: "Gen. (cm)",
    height: "Yük. (cm)",
    weight: "Ağırlık (kg)",
    cartonHint: "Tek bir kolinin ölçüleri ve ağırlığı.",
    units: "Adet sayısı",
    battery: "Batarya içerir",
    reinforce: "Ahşapla güçlendirme",
    reinforceHint: "m³ başına 15 $, Guangzhou’daki depomuzda.",
    add: "+ Ürün ekleyin",
    remove: "Kaldır",
    summary: "{m3} · hacimsel {volumetric}",
    goodsReset: "Mal listesi taşıma türüne göre değişir: her ürünün mal türünü kontrol edin.",
  },
  goods: {
    sea: {
      ordinary: "Genel kargo",
      kg1: "+1 RMB/kg: mutfak gereçleri, aydınlatma, seramik, ahşap, el aletleri, kameralar, dronlar…",
      kg3: "+3 RMB/kg: çantalar, deri, kumaşlar, yatak takımları, çoraplar, kozmetikler…",
      kg4: "+4 RMB/kg: giysiler, ayakkabılar, iç çamaşırları, mayolar…",
      phones: "Cep telefonları: telefon başına +3 RMB",
      scooters: "Scooter, koşu bandı: adet başına +7,50 €",
      bikes: "Bisikletler: adet başına +75 €",
      refused: "Kabul edilmez: sıvılar, tozlar, tek başına bataryalar, sahte ürünler…",
    },
    air: {
      ordinary: "Genel kargo",
      kg1: "+1 RMB/kg: ahşap ürünler, hırdavat, metal, telefon kılıfları ve kabloları…",
      kg2: "+2 RMB/kg: aydınlatma, seramik, kozmetikler, güzellik cihazları, kameralar, sabit diskler…",
      kg3: "+3 RMB/kg: oyuncaklar, deri, tekstil aksesuarları",
      kg5: "+5 RMB/kg: saatler, sıvısız elektronik sigaralar",
      kg7: "+7 RMB/kg: giysiler, ayakkabılar, tekstil ürünleri, telefonlar, bilgisayarlar, tabletler, dronlar",
      refused: "Kabul edilmez: sıvılar, tozlar, tek başına bataryalar, sahte ürünler…",
    },
    truck: {
      ordinary: "Genel kargo",
      kg1: "+1 RMB/kg: deri, mutfak gereçleri, LED aydınlatma, oyuncaklar, kulaklıklar, Bluetooth ürünleri…",
      kg2: "+2 RMB/kg: hırdavat, güzellik cihazları, araç kameraları, GPS cihazları, kalemler, yetişkin ürünleri…",
      kg3: "+3 RMB/kg: peruklar, tekstil ürünleri (giysi ve ayakkabı hariç)",
      kg4: "+4 RMB/kg: tabletler",
      kg5: "+5 RMB/kg: giysiler, çoraplar, pantolonlar, güneş panelleri, tek kullanımlık elektronik sigaralar",
      kg8: "+8 RMB/kg: ayakkabılar",
      pieces: "Saatler, USB bellekler, oyun konsolları, hafıza kartları: adet başına +3 RMB",
      phones: "Cep telefonları: telefon başına +8 RMB",
      quote: "Gözlükler, valizler, dronlar, robot süpürgeler, ahşap ürünler…: fiyat teklifle belirlenir",
      refused: "Kabul edilmez: sıvılar, tozlar, tek başına bataryalar, sahte ürünler…",
    },
    rail: {
      ordinary: "Genel kargo",
      kg1: "+1 RMB/kg: mutfak gereçleri, aydınlatma, seramik, ahşap, el aletleri, kameralar, dronlar…",
      kg2: "+2 RMB/kg: çantalar, deri, kumaşlar, yatak takımları, çoraplar, kozmetikler…",
      kg4: "+4 RMB/kg: giysiler, ayakkabılar, iç çamaşırları, mayolar…",
      phones: "Cep telefonları: telefon başına +3 RMB",
      scooters: "Scooter, koşu bandı: adet başına +7,50 €",
      bikes: "Bisikletler: adet başına +75 €",
      refused: "Kabul edilmez: sıvılar, tozlar, tek başına bataryalar, sahte ürünler…",
    },
  },
  options: {
    declaration: "Ayrı ihracat beyannamesi",
    declarationHint: "Sevkiyat başına 350 RMB.",
    declarationHintSea: "350 RMB, ilk sayfadan sonraki her sayfa için +50 RMB (sayfa başına 5 ürün).",
  },
  calc: {
    volumetric: "Hacimsel ağırlık",
    formula: "U × G × Y ÷ 6.000",
    bracket: "Kademe",
    billed: "{kg} kg faturalanır",
    volume: "Toplam hacim: {m3}",
  },
  estimate: {
    title: "Tahmininiz",
    delayLabel: "Teslim süresi",
    delays: {
      sea: "40 ila 45 gün, uçtan uca",
      air: "7 ila 10 iş günü",
      truck: "Yaklaşık 16 ila 20 gün",
      rail: "Kalkıştan sonra 35 ila 38 gün",
    },
    surcharges: "Sevkiyatınıza eklenenler",
    oversize: "Standart dışı koliler: {n}",
    singleCarton: "Tek kolilik sevkiyat",
    battery: "Bataryalı ürünler",
    reinforcement: "Ahşap güçlendirme: {m3}",
    declaration: "Ayrı ihracat beyannamesi",
  },
  quote: {
    title: "Fiyat teklifle belirlenir",
    reasons: {
      formula: "FOB seçeneğinde ve gümrüğe kadar teslimde fiyat teklifle belirlenir: size e-postayla yanıt veririz.",
      country: "Bu taşıma türü, bu ülkeye vergiler dâhil teslimat yapmıyor: fiyat teklifle belirlenir.",
      air_battery:
        "Uçakla gönderilen bataryalı ürünler, yalnızca Amazon depolarına ve lojistik depolarına teslimat yapan bir hattan gider: fiyat teklifle belirlenir.",
      too_many_products: "5’ten fazla farklı ürün olduğunda fiyat teklifle belirlenir.",
      goods_quote: "Bu malın fiyatı teklifle belirlenir.",
    },
  },
  warnings: {
    refusedGoods: "Mallarınızdan biri bu taşıma türüyle kabul edilmiyor.",
    refusedCarton:
      "Bir koli sınırları aşıyor (65 kg, bir kenarda 270 cm ya da uzunluk + 2 × (genişlik + yükseklik) toplamı 400 cm’nin üzerinde): yeniden paketlenmesi gerekir.",
    noProducts: "En az bir ürün girin; kolilerini, ölçülerini ve ağırlıklarını da belirtin.",
  },
  gate: {
    locked: "Fiyat, kayıttan sonra görünür",
    lockedQuote: "Fiyat teklifle belirlenir: size e-postayla yanıt veririz",
    points: [
      "Kalem kalem ayrıntılı fiyat, e-postanıza gönderilir",
      "Navlun, ek ücretler, güçlendirme ve %3’lük komisyonumuz",
      "Tahmininiz, teklife dönüşmeye hazır",
    ],
    name: "Ad soyad",
    phone: "Telefon (WhatsApp)",
    email: "E-posta adresiniz",
    emailPlaceholder: "adiniz@sirketiniz.com",
    cta: "Fiyatı görün",
    ctaQuote: "Teklifinizi alın",
    already: "Zaten hesabım var",
    note: "Yaklaşık fiyatlar; tarife yakında güncellenecek. Kesin fiyat teklifinizde yer alır.",
    sending: "Gönderiliyor…",
    sent: "{email} adresine gönderildi. Tekliflerinize ulaşmak için şimdi hesabınızı oluşturun.",
    sentQuote: "Talebiniz alındı: {email} adresine yanıt vereceğiz. Tekliflerinizi takip etmek için şimdi hesabınızı oluşturun.",
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
      "Fiyat, taşıyıcımızın gemi, uçak, kamyon ve tren için Avrupa tarifelerinden gelir. Bu tarifelerin kuralları, sevkiyatınıza uygulandıkları biçimiyle aşağıda.",
    sections: [
      {
        title: "Faturalanacak ağırlık",
        text:
          "Her koli, üç ağırlıktan en yükseği üzerinden faturalanır: gerçek ağırlığı, hacimsel ağırlığı (cm cinsinden uzunluk × genişlik × yükseklik ÷ 6.000) ve 12 kg. Ardından tüm ürünlerinizin kolileri toplanır.",
      },
      {
        title: "Taşıma türleri ve teslim süreleri",
        text:
          "Gemi: uçtan uca 40 ila 45 gün; en ucuzu ve önerdiğimiz seçenek. Uçak: 7 ila 10 iş günü; küçük ya da acil bir sevkiyat için. Kamyon: yaklaşık 16 ila 20 gün; daha riskli, önermiyoruz. Tren: trenin kalkışından sonra 35 ila 38 gün; bunu da önermiyoruz. Son aşamanın taşıyıcısını biz seçeriz.",
      },
      {
        title: "Ağırlık kademeleri",
        text:
          "Kilo fiyatı, toplam ağırlık arttıkça düşer. Gemi: 21 ila 70 kg, 71 ila 299 kg, 300 kg ve üzeri. Uçak: 21 ila 69 kg, 70 ila 99 kg, 100 ila 299 kg, 300 kg ve üzeri. Kamyon: 30 ila 70 kg, 71 ila 100 kg, 101 ila 499 kg, 500 kg ve üzeri (Birleşik Krallık için 300 kg ve üzeri). Tren: 45 ila 74 kg, 75 ila 299 kg, 300 kg ve üzeri. Bir sevkiyat gemi ve uçakla en az 21 kg, kamyonla en az 30 kg, trenle en az 45 kg üzerinden faturalanır.",
      },
      {
        title: "Teslim şekilleri",
        text:
          "Vergiler dâhil teslim (DDP): adresinize teslimat, gümrük vergileri ve ithalat KDV’si dâhil; gemi, uçak ve trenle sevkiyat başına en fazla 5 farklı ürün. FOB: mallar Çin’deki çıkış limanında ya da havalimanında teslim edilir, işi sizin nakliye firmanız devralır. Gümrüğe kadar: malları varış gümrüğüne kadar biz taşırız, gümrükleme işlemlerini siz yapar ve malları teslim alırsınız. FOB seçeneğinde ve gümrüğe kadar teslimde fiyat teklifle belirlenir.",
      },
      {
        title: "Teslimat yapılan ülkeler",
        text:
          "Her taşıma türünün teslimat yaptığı Avrupa ülkelerinin listesi kendine özgüdür; Birleşik Krallık’a yalnızca kamyonla teslimat yapılır. Seçtiğiniz taşıma türü ülkenize teslimat yapmıyorsa fiyat teklifle belirlenir.",
      },
      {
        title: "Mal türüne göre ek ücretler",
        text:
          "Her taşıma türünün kendi ek ücretleri vardır: ilgili ürünün faturalanacak kilosu başına ya da adet başına uygulanır; formdaki liste taşıma türüne göre değişir ve tarifedeki örnekleri içerir. Gemi: +1, +3 veya +4 RMB/kg; telefonlar adet başına +3 RMB, scooter ve koşu bantları adet başına +7,50 €, bisikletler adet başına +75 €. Tren: +1, +2 veya +4 RMB/kg ve adet başına aynı ek ücretler. Uçak: +1, +2, +3, +5 veya +7 RMB/kg. Kamyon: +1 ila +8 RMB/kg; saatler, USB bellekler, oyun konsolları ve hafıza kartları adet başına +3 RMB, telefonlar adet başına +8 RMB; gözlükler, valizler, dronlar ve ahşap ürünler için fiyat teklifle belirlenir. Ek ücretler birbirine eklenir.",
      },
      {
        title: "Bataryalı ürünler",
        text:
          "Gemi ve trenle kabul edilir. Kamyonla: sevkiyat başına +100 RMB. Uçakla, Hong Kong’dan kalkan ve yalnızca Amazon depolarına ve lojistik depolarına teslimat yapan bir hattan gider: fiyat teklifle belirlenir.",
      },
      {
        title: "Standart dışı koliler",
        text:
          "Kabul edilmez: 65 kg’dan ağır, bir kenarı 270 cm’den uzun ya da uzunluk + 2 × (genişlik + yükseklik) toplamı 400 cm’yi aşan koliler. Her koli için en yüksek ek ücret uygulanır: 30 ile 40 kg arasında ya da en uzun kenar 100 cm’yi veya ikinci kenar 76 cm’yi aşıyorsa 130 RMB; 40 kg’ın üzerinde 600 RMB; uzunluk + 2 × (genişlik + yükseklik) 266 ile 320 cm arasındaysa 120 RMB, 321 ile 400 cm arasındaysa 900 RMB. Tek kolilik sevkiyat: +80 RMB (Birleşik Krallık’a kamyonla +50 RMB).",
      },
      {
        title: "Ahşapla güçlendirme",
        text:
          "Kırılabilir mallar için kolileri Guangzhou’daki depomuzda ahşapla güçlendiririz: güçlendirilen ürün için m³ başına 15 $.",
      },
      {
        title: "Ayrı ihracat beyannamesi",
        text:
          "Sevkiyat başına 350 RMB; gemiyle, ilk sayfadan sonraki her sayfa için +50 RMB (sayfa başına 5 satır). Kamyonla, ihracat dosyası ücretsiz hazırlanır.",
      },
      {
        title: "Komisyonumuz",
        text: "Tahminin tamamı üzerinden %3: navlun, ek ücretler ve güçlendirme; teklifinizde ayrı bir kalemde gösterilir.",
      },
      {
        title: "Fiyata dâhil olmayanlar",
        text:
          "Uzak bölgeler (ek ücret, taşıyıcının faturası üzerinden yansıtılır), adres değişikliği, gümrük kontrolü masrafları, sigorta ve teklifinizde fiyatlandırılan, Guangzhou’daki diğer depo hizmetlerimiz (mal kabul, kontrol, yükleme).",
      },
      {
        title: "Kabul edilmeyen mallar",
        text:
          "Sıvılar, tozlar, sahte ürünler, tek başına bataryalar, taşınabilir şarj cihazları (powerbank), elektrikli tek tekerlekler, tütün, gıda ürünleri, ilaçlar, aşındırıcı, yanıcı veya patlayıcı ürünler, silahlar. İhracat öncesi kontrolde tespit edilen hassas bir mal için 3.000 RMB para cezası, geri gönderim masrafı ve 8 RMB/kg elleçleme ücreti ödenir.",
      },
      {
        title: "Ambalaj",
        text:
          "Tüm ürünlerin üzerinde MADE IN CHINA ibaresi bulunmalı; tekstil, deri, bavul ve ayakkabılarda ayrıca içerik ve bakım etiketi olmalı. Sarı koli bandından kaçının.",
      },
      {
        title: "Kayıp durumunda",
        text:
          "Gemi ve tren: kayıp ya da gümrükte takılma durumunda beyan edilen değer üzerinden, kilo başına en fazla 20 RMB tazminat ödenir; navlun iade edilmez; hasarlar tazmin edilmez. Uçak ve kamyon: mallar UPS’e teslim edilmeden önce kaybolursa ya da gümrükte el konulursa kilo başına 40 RMB, sonrasında UPS kuralları, sevkiyat başına en fazla 100 USD. Değerli mallar için sigorta yaptırın.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Navlun tahmininiz: {total}",
    subjectQuote: "Navlun teklifi talebiniz",
    heading: "SourcingPick tahmininiz",
    headingQuote: "SourcingPick teklif talebiniz",
    intro: "Taşıyıcımızın Avrupa tarifesi ve tüm kurallarıyla hesaplanan sevkiyatınızın ayrıntıları aşağıdadır.",
    introQuote: "Talebinizi aldık. Bize ilettiğiniz bilgiler aşağıda; size bir teklifle döneceğiz.",
    summary: {
      mode: "Taşıma türü",
      formula: "Teslim şekli",
      address: "Teslimat adresi",
      cartons: "Koliler",
      real: "Gerçek ağırlık",
      volumetric: "Hacimsel ağırlık",
      chargeable: "Faturalanacak ağırlık",
      bracket: "Kademe ve birim fiyat",
      delay: "Teslim süresi",
    },
    productsTitle: "Ürünleriniz",
    product: "{name}: {cartons} koli · {m3} · faturalanacak {chargeable}",
    items: {
      freight: "Navlun ({kg} kg × {rate} RMB/kg)",
      goods: "{product} için mal türü ek ücreti ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × {rate} €",
      singleCarton: "Tek kolilik sevkiyat",
      oversize: "Standart dışı koliler ({cartons} koli)",
      battery: "Bataryalı ürünler",
      declaration: "Ayrı ihracat beyannamesi ({pages} sayfa)",
      reinforcement: "Ahşap güçlendirme ({m3} m³ × {rate} $)",
    },
    subtotal: "Ara toplam",
    commission: "SourcingPick komisyonu (%3)",
    total: "Tahmini toplam",
    notIncludedTitle: "Dâhil olmayanlar",
    notIncluded: [
      "Uzak bölgeler, adres değişikliği, gümrük kontrolü masrafları",
      "Sigorta",
      "Guangzhou’daki diğer depo hizmetlerimiz (mal kabul, kontrol, yükleme), teklifinizde fiyatlandırılır",
    ],
    disclaimer:
      "Taşıyıcımızın güncel tarifesiyle hazırlanmış yaklaşık fiyat (tarife yakında güncellenecek). Kesin fiyat teklifinizde yer alır.",
    quoteNext: "Size ayrıntılı bir teklifle döneceğiz.",
    signup: "Tekliflerinizi takip etmek için SourcingPick hesabınızı oluşturun:",
    signupCta: "Hesabınızı oluşturun",
    footer: "SourcingPick · Guangzhou · contact@sourcingpick.com",
  },
};
