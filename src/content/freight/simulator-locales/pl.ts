import type { FreightSimulatorCopy } from "../simulator";

export const pl: FreightSimulatorCopy = {
  eyebrow: "Kalkulator kosztów transportu",
  title: "Ile kosztowałaby Państwa wysyłka?",
  intro:
    "Prosimy podać adres i produkty: obliczamy wagę gabarytową każdego z nich i stosujemy cennik naszego przewoźnika dla Europy. Szczegółową cenę wysyłamy Państwu e-mailem.",
  mode: {
    label: "Rodzaj transportu",
    names: { sea: "Statek", air: "Samolot", truck: "Ciężarówka", rail: "Pociąg" },
    recommended: "Polecamy",
    discouraged: "Odradzamy",
    hints: {
      sea: "Najtańszy i właśnie ten polecamy: łącznie od 40 do 45 dni.",
      air: "Najszybszy: od 7 do 10 dni roboczych. Dla małej lub pilnej wysyłki.",
      truck: "Bardziej ryzykowna: nie polecamy jej. Około 16–20 dni.",
      rail: "Jego również nie polecamy. Od 35 do 38 dni po odjeździe pociągu.",
    },
  },
  formula: {
    label: "Wariant dostawy",
    names: { ddp: "Dostawa, cło i podatki w cenie", fob: "FOB", customs: "Do odprawy celnej" },
    hints: {
      ddp: "Dostawa pod Państwa adres, cło i VAT importowy wliczone w cenę (DDP).",
      fob: "Przekazanie towaru w porcie lub na lotnisku wysyłki w Chinach; dalej przejmuje go Państwa spedytor. Cenę podajemy w indywidualnej wycenie.",
      customs:
        "Transport do urzędu celnego w miejscu przybycia; odprawę celną i odbiór towaru zapewniają Państwo. Cenę podajemy w indywidualnej wycenie.",
    },
  },
  address: {
    title: "Adres dostawy",
    street: "Adres",
    postcode: "Kod pocztowy",
    city: "Miejscowość",
    country: "Kraj",
  },
  products: {
    title: "Państwa produkty",
    item: "Produkt {n}",
    name: "Nazwa produktu",
    namePlaceholder: "Np. lampy biurkowe",
    goods: "Rodzaj towaru",
    cartons: "Kartony",
    length: "Dł. (cm)",
    width: "Szer. (cm)",
    height: "Wys. (cm)",
    weight: "Waga (kg)",
    cartonHint: "Wymiary i waga jednego kartonu.",
    units: "Liczba sztuk",
    battery: "Zawiera baterię",
    reinforce: "Wzmocnienie drewnem",
    reinforceHint: "15 $ za m³, w naszym magazynie w Guangzhou.",
    add: "+ Dodaj produkt",
    remove: "Usuń",
    summary: "{m3} · waga rzeczywista {real} · gabarytowa {volumetric} · rozliczeniowa {chargeable}",
    goodsReset: "Lista towarów zależy od rodzaju transportu: prosimy sprawdzić rodzaj towaru przy każdym produkcie.",
  },
  goods: {
    sea: {
      ordinary: "Towar standardowy",
      kg1: "+1 RMB/kg: kuchnia, oświetlenie, ceramika, drewno, narzędzia, kamery, drony…",
      kg3: "+3 RMB/kg: torby, skóra, tkaniny, pościel, skarpety, kosmetyki…",
      kg4: "+4 RMB/kg: odzież, obuwie, bielizna, stroje kąpielowe…",
      phones: "Telefony komórkowe: +3 RMB za telefon",
      scooters: "Hulajnogi, bieżnie: +7,50 € za sztukę",
      bikes: "Rowery: +75 € za sztukę",
      refused: "Nieprzyjmowane: płyny, proszki, baterie luzem, podróbki…",
    },
    air: {
      ordinary: "Towar standardowy",
      kg1: "+1 RMB/kg: artykuły z drewna, artykuły żelazne, wyroby metalowe, etui i kable do telefonów…",
      kg2: "+2 RMB/kg: oświetlenie, ceramika, kosmetyki, urządzenia kosmetyczne, kamery, dyski twarde…",
      kg3: "+3 RMB/kg: zabawki, skóra, dodatki tekstylne",
      kg5: "+5 RMB/kg: zegarki, e-papierosy bez płynu",
      kg7: "+7 RMB/kg: odzież, obuwie, tekstylia, telefony, komputery, tablety, drony",
      refused: "Nieprzyjmowane: płyny, proszki, baterie luzem, podróbki…",
    },
    truck: {
      ordinary: "Towar standardowy",
      kg1: "+1 RMB/kg: skóra, przybory kuchenne, oświetlenie LED, zabawki, słuchawki, urządzenia Bluetooth…",
      kg2: "+2 RMB/kg: artykuły żelazne, urządzenia kosmetyczne, wideorejestratory, GPS, długopisy, artykuły dla dorosłych…",
      kg3: "+3 RMB/kg: peruki, tekstylia (oprócz odzieży i obuwia)",
      kg4: "+4 RMB/kg: tablety",
      kg5: "+5 RMB/kg: odzież, skarpety, spodnie, panele słoneczne, jednorazowe e-papierosy",
      kg8: "+8 RMB/kg: obuwie",
      pieces: "Zegarki, pamięci USB, konsole, karty pamięci: +3 RMB za sztukę",
      phones: "Telefony komórkowe: +8 RMB za telefon",
      quote: "Okulary, bagaż, drony, roboty odkurzające, artykuły z drewna…: wycena indywidualna",
      refused: "Nieprzyjmowane: płyny, proszki, baterie luzem, podróbki…",
    },
    rail: {
      ordinary: "Towar standardowy",
      kg1: "+1 RMB/kg: kuchnia, oświetlenie, ceramika, drewno, narzędzia, kamery, drony…",
      kg2: "+2 RMB/kg: torby, skóra, tkaniny, pościel, skarpety, kosmetyki…",
      kg4: "+4 RMB/kg: odzież, obuwie, bielizna, stroje kąpielowe…",
      phones: "Telefony komórkowe: +3 RMB za telefon",
      scooters: "Hulajnogi, bieżnie: +7,50 € za sztukę",
      bikes: "Rowery: +75 € za sztukę",
      refused: "Nieprzyjmowane: płyny, proszki, baterie luzem, podróbki…",
    },
  },
  options: {
    declaration: "Osobna deklaracja eksportowa",
    declarationHint: "350 RMB za wysyłkę.",
    declarationHintSea: "350 RMB, +50 RMB za każdą stronę po pierwszej (5 produktów na stronę).",
  },
  calc: {
    title: "Jak to liczymy",
    real: "Waga rzeczywista",
    volumetric: "Waga gabarytowa",
    formula: "D × S × W ÷ 6000",
    chargeable: "Waga rozliczeniowa",
    chargeableHint: "Karton po kartonie: najwyższa z trzech wartości",
    bracket: "Przedział",
    billed: "rozliczane jako {kg} kg",
    volume: "Łączna objętość: {m3}",
    cartons: "Kartony: {n}",
  },
  estimate: {
    title: "Szacunkowy koszt",
    delayLabel: "Czas transportu",
    delays: {
      sea: "łącznie od 40 do 45 dni",
      air: "od 7 do 10 dni roboczych",
      truck: "około 16–20 dni",
      rail: "od 35 do 38 dni po odjeździe",
    },
    surcharges: "Do wysyłki doliczamy",
    oversize: "Paczki niestandardowe: {n}",
    singleCarton: "Wysyłka jednej paczki",
    battery: "Produkty z baterią",
    reinforcement: "Wzmocnienie drewnem: {m3}",
    declaration: "Osobna deklaracja eksportowa",
  },
  quote: {
    title: "Wycena indywidualna",
    reasons: {
      formula: "W wariantach FOB i „Do odprawy celnej” cenę podajemy w indywidualnej wycenie: odpowiemy Państwu e-mailem.",
      country:
        "W wariancie z cłem i podatkami w cenie ten rodzaj transportu nie obsługuje tego kraju: cenę podajemy w indywidualnej wycenie.",
      air_battery:
        "W transporcie lotniczym produkty z baterią wysyłamy linią przeznaczoną wyłącznie dla magazynów Amazon i magazynów logistycznych: cenę podajemy w indywidualnej wycenie.",
      too_many_products: "Przy ponad 5 różnych produktach cenę podajemy w indywidualnej wycenie.",
      goods_quote: "Dla tego towaru cenę podajemy w indywidualnej wycenie.",
    },
  },
  warnings: {
    refusedGoods: "Jeden z Państwa towarów nie jest przyjmowany w tym rodzaju transportu.",
    refusedCarton:
      "Jeden z kartonów przekracza limity (65 kg, 270 cm na jednym boku lub długość + 2 × (szerokość + wysokość) powyżej 400 cm): trzeba go przepakować.",
    noProducts: "Prosimy podać co najmniej jeden produkt wraz z kartonami, ich wymiarami i wagą.",
  },
  gate: {
    locked: "Cena wyświetli się po rejestracji",
    lockedQuote: "Wycena indywidualna: odpowiemy Państwu e-mailem",
    points: [
      "Szczegółowa cena, pozycja po pozycji, wysłana e-mailem",
      "Transport, dopłaty, wzmocnienie i nasza prowizja 3%",
      "Państwa szacunek, gotowy do zamiany w wycenę",
    ],
    name: "Imię i nazwisko",
    phone: "Telefon (WhatsApp)",
    email: "Państwa adres e-mail",
    emailPlaceholder: "jan.kowalski@firma.pl",
    cta: "Zobacz cenę",
    ctaQuote: "Otrzymaj wycenę",
    already: "Mam już konto",
    note: "Ceny orientacyjne, cennik wkrótce zostanie zaktualizowany. Wiążącą cenę podajemy w wycenie.",
    sending: "Wysyłanie…",
    sent: "Wysłaliśmy wiadomość na adres {email}. Prosimy teraz założyć konto, aby mieć dostęp do swoich wycen.",
    sentQuote: "Otrzymaliśmy zapytanie: odpowiemy na adres {email}. Prosimy teraz założyć konto, aby śledzić swoje wyceny.",
    errors: {
      invalid_email: "Ten adres e-mail wygląda na nieprawidłowy.",
      rate_limited: "Zbyt wiele zapytań z tego połączenia. Prosimy spróbować ponownie za godzinę.",
      failed: "Nie udało się wysłać wiadomości. Prosimy napisać do nas przez WhatsApp lub na adres contact@sourcingpick.com.",
      invalid: "Prosimy sprawdzić pola: brakuje informacji potrzebnej do obliczenia ceny.",
    },
  },
  rules: {
    title: "Jak obliczamy Państwa cenę",
    intro:
      "Cena wynika z cenników naszego przewoźnika dla Europy: dla transportu statkiem, samolotem, ciężarówką i pociągiem. Oto ich zasady w odniesieniu do Państwa wysyłki.",
    sections: [
      {
        title: "Waga rozliczeniowa",
        text:
          "Każdy karton rozliczamy według najwyższej z trzech wartości: jego wagi rzeczywistej, wagi gabarytowej (długość × szerokość × wysokość w cm ÷ 6000) oraz 12 kg. Następnie sumujemy kartony wszystkich Państwa produktów.",
      },
      {
        title: "Rodzaje transportu i terminy",
        text:
          "Statek: łącznie od 40 do 45 dni, najtańszy i właśnie ten polecamy. Samolot: od 7 do 10 dni roboczych, dla małej lub pilnej wysyłki. Ciężarówka: około 16–20 dni, bardziej ryzykowna – nie polecamy jej. Pociąg: od 35 do 38 dni po odjeździe pociągu – jego również nie polecamy. Przewoźnika na ostatnim etapie wybieramy my.",
      },
      {
        title: "Przedziały wagowe",
        text:
          "Cena za kilogram spada wraz z łączną wagą. Statek: od 21 do 70 kg, od 71 do 299 kg, 300 kg i więcej. Samolot: od 21 do 69 kg, od 70 do 99 kg, od 100 do 299 kg, 300 kg i więcej. Ciężarówka: od 30 do 70 kg, od 71 do 100 kg, od 101 do 499 kg, 500 kg i więcej (300 kg i więcej przy wysyłce do Wielkiej Brytanii). Pociąg: od 45 do 74 kg, od 75 do 299 kg, 300 kg i więcej. Każda wysyłka jest rozliczana jako co najmniej 21 kg statkiem i samolotem, 30 kg ciężarówką i 45 kg pociągiem.",
      },
      {
        title: "Warianty dostawy",
        text:
          "Dostawa, cło i podatki w cenie (DDP): dostarczamy towar pod Państwa adres, a cło i VAT importowy są wliczone w cenę; przy transporcie statkiem, samolotem i pociągiem maksymalnie 5 różnych produktów na wysyłkę. FOB: towar jest przekazywany w porcie lub na lotnisku wysyłki w Chinach, a dalej przejmuje go Państwa spedytor. Do odprawy celnej: transportujemy towar do urzędu celnego w miejscu przybycia, a odprawę celną i odbiór zapewniają Państwo. W wariantach FOB i „Do odprawy celnej” cenę podajemy w indywidualnej wycenie.",
      },
      {
        title: "Kraje dostawy",
        text:
          "Każdy rodzaj transportu obsługuje własną listę krajów europejskich; do Wielkiej Brytanii dostarczamy wyłącznie ciężarówką. Jeśli wybrany rodzaj transportu nie obsługuje Państwa kraju, cenę podajemy w indywidualnej wycenie.",
      },
      {
        title: "Dopłaty zależne od rodzaju towaru",
        text:
          "Każdy rodzaj transportu ma własne dopłaty, liczone za kilogram rozliczeniowy danego produktu lub za sztukę; lista w formularzu zmienia się wraz z rodzajem transportu i zawiera przykłady z cennika. Statek: +1, +3 lub +4 RMB/kg; telefony +3 RMB za sztukę, hulajnogi i bieżnie +7,50 € za sztukę, rowery +75 € za sztukę. Pociąg: +1, +2 lub +4 RMB/kg oraz te same dopłaty za sztukę. Samolot: +1, +2, +3, +5 lub +7 RMB/kg. Ciężarówka: od +1 do +8 RMB/kg; zegarki, pamięci USB, konsole i karty pamięci +3 RMB za sztukę, telefony +8 RMB za sztukę; okulary, bagaż, drony i artykuły z drewna – wycena indywidualna. Dopłaty sumują się.",
      },
      {
        title: "Produkty z baterią",
        text:
          "Przyjmowane przy transporcie statkiem i pociągiem. Ciężarówką: +100 RMB za wysyłkę. Samolotem wysyłamy je linią z Hong Kongu, przeznaczoną wyłącznie dla magazynów Amazon i magazynów logistycznych: cenę podajemy w indywidualnej wycenie.",
      },
      {
        title: "Paczki niestandardowe",
        text:
          "Nie są przyjmowane paczki powyżej 65 kg, z bokiem dłuższym niż 270 cm lub takie, w których długość + 2 × (szerokość + wysokość) przekracza 400 cm. Dla każdego kartonu naliczana jest najwyższa z dopłat: 130 RMB przy wadze od 30 do 40 kg albo gdy najdłuższy bok przekracza 100 cm lub drugi co do długości 76 cm; 600 RMB powyżej 40 kg; 120 RMB, gdy długość + 2 × (szerokość + wysokość) wynosi od 266 do 320 cm, 900 RMB – od 321 do 400 cm. Wysyłka jednej paczki: +80 RMB (+50 RMB przy transporcie ciężarówką do Wielkiej Brytanii).",
      },
      {
        title: "Wzmocnienie drewnem",
        text:
          "W przypadku delikatnych towarów wzmacniamy kartony drewnem w naszym magazynie w Guangzhou: 15 $ za m³ wzmacnianego produktu.",
      },
      {
        title: "Osobna deklaracja eksportowa",
        text:
          "350 RMB za wysyłkę; przy transporcie statkiem +50 RMB za każdą stronę po pierwszej (5 pozycji na stronę). Przy transporcie ciężarówką dokumentację eksportową przygotowujemy bezpłatnie.",
      },
      {
        title: "Nasza prowizja",
        text: "3% od całej szacowanej kwoty: transportu, dopłat i wzmocnienia, jako osobna pozycja w Państwa wycenie.",
      },
      {
        title: "Czego cena nie obejmuje",
        text:
          "Obszary oddalone (dopłata refakturowana na podstawie faktury przewoźnika), zmiana adresu, opłaty za kontrolę celną, ubezpieczenie oraz nasze pozostałe usługi magazynowe w Guangzhou (przyjęcie, kontrola, załadunek), które podajemy w wycenie.",
      },
      {
        title: "Towary nieprzyjmowane",
        text:
          "Płyny, proszki, podróbki, baterie luzem, powerbanki, monocykle elektryczne, wyroby tytoniowe, żywność, leki, produkty żrące, łatwopalne lub wybuchowe, broń. Jeśli podczas kontroli przed eksportem zostanie wykryty towar wrażliwy, kosztuje to 3000 RMB kary, zwrot towaru oraz 8 RMB/kg opłaty manipulacyjnej.",
      },
      {
        title: "Opakowanie",
        text:
          "Wszystkie produkty muszą mieć oznaczenie MADE IN CHINA, a tekstylia, wyroby skórzane, bagaż i obuwie – także etykietę ze składem i sposobem konserwacji. Prosimy nie używać żółtej taśmy klejącej.",
      },
      {
        title: "W razie utraty",
        text:
          "Statek i pociąg: utrata lub zatrzymanie przez urząd celny – odszkodowanie według zadeklarowanej wartości, maksymalnie 20 RMB za kilogram, bez zwrotu kosztów transportu; uszkodzenia nie podlegają odszkodowaniu. Samolot i ciężarówka: 40 RMB za kilogram w razie utraty przed przejęciem przesyłki przez UPS lub zajęcia przez urząd celny, a później obowiązują zasady UPS, maksymalnie 100 USD za wysyłkę. W przypadku wartościowego towaru prosimy zadbać o ubezpieczenie.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Szacunkowy koszt transportu: {total}",
    subjectQuote: "Państwa zapytanie o wycenę transportu",
    heading: "Państwa szacunek od Sourcing Pick",
    headingQuote: "Państwa zapytanie o wycenę do Sourcing Pick",
    intro: "Oto szczegóły Państwa wysyłki, obliczone według cennika naszego przewoźnika dla Europy i wszystkich jego zasad.",
    introQuote: "Otrzymaliśmy Państwa zapytanie. Oto podane przez Państwa informacje; odezwiemy się do Państwa z wyceną.",
    summary: {
      mode: "Rodzaj transportu",
      formula: "Wariant dostawy",
      address: "Adres dostawy",
      cartons: "Kartony",
      real: "Waga rzeczywista",
      volumetric: "Waga gabarytowa",
      chargeable: "Waga rozliczeniowa",
      bracket: "Przedział i stawka",
      delay: "Czas transportu",
    },
    productsTitle: "Państwa produkty",
    product: "{name}: liczba kartonów {cartons} · {m3} · waga rozliczeniowa {chargeable}",
    items: {
      freight: "Transport ({kg} kg × {rate} RMB/kg)",
      goods: "Dopłata za rodzaj towaru – {product} ({kg} kg × {rate} RMB/kg)",
      pieces: "{product}: {units} × {rate} RMB",
      units: "{product}: {units} × {rate} €",
      singleCarton: "Wysyłka jednej paczki",
      oversize: "Paczki niestandardowe ({cartons} szt.)",
      battery: "Produkty z baterią",
      declaration: "Osobna deklaracja eksportowa ({pages} str.)",
      reinforcement: "Wzmocnienie drewnem ({m3} m³ × {rate} $)",
    },
    subtotal: "Suma częściowa",
    commission: "Prowizja Sourcing Pick (3%)",
    total: "Szacunkowa suma",
    notIncludedTitle: "Cena nie obejmuje",
    notIncluded: [
      "Obszary oddalone, zmiana adresu, opłaty za kontrolę celną",
      "Ubezpieczenie",
      "Nasze pozostałe usługi magazynowe w Guangzhou (przyjęcie, kontrola, załadunek), podane w wycenie",
    ],
    disclaimer:
      "Cena orientacyjna, obliczona według obecnego cennika naszego przewoźnika (wkrótce zostanie zaktualizowany). Wiążącą cenę podajemy w wycenie.",
    quoteNext: "Odezwiemy się do Państwa ze szczegółową wyceną.",
    signup: "Prosimy założyć konto Sourcing Pick, aby śledzić swoje wyceny:",
    signupCta: "Załóż konto",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
