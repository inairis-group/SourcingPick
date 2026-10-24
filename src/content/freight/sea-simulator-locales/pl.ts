import type { SeaSimulatorCopy } from "../sea-simulator";

export const pl: SeaSimulatorCopy = {
  eyebrow: "Oszacuj koszt wysyłki",
  title: "Ile kosztowałaby Państwa wysyłka statkiem?",
  intro:
    "Prosimy podać dane kartonów: obliczamy wagę rozliczeniową i pozycja po pozycji stosujemy cennik morski naszego przewoźnika dla Europy. Szczegółową cenę wysyłamy Państwu e-mailem.",
  regime: {
    label: "Odprawa celna",
    ddp: "Cło i podatki w cenie",
    ddpHint: "Cło i VAT importowy wliczone w cenę.",
    vat: "Na Państwa numer VAT",
    vatHint: "Samonaliczenie VAT importowego: wymagany ważny numer VAT i numer EORI.",
  },
  deliverTo: {
    label: "Dostawa",
    amazon: "Magazyn Amazon",
    other: "Inny adres",
    thirdParty: "Magazyn logistyczny",
  },
  warehouse: { label: "Magazyn", byCountry: "Inny magazyn Amazon (według kraju)" },
  country: "Kraj dostawy",
  carrier: {
    label: "Przewoźnik",
    truck: "Ciężarówką do magazynu",
    upsDpd: "UPS lub DPD, nasz wybór",
    ups: "UPS",
    qot: "QOT Express",
  },
  goods: {
    label: "Rodzaj towaru",
    ordinary: "Towar standardowy",
    plus1: "Kuchnia, oświetlenie, drewno, narzędzia, elektronika…",
    plus3: "Tekstylia, torby, skóra, kosmetyki…",
    plus4: "Odzież, obuwie, bielizna…",
    refused: "Płyny, proszki, baterie luzem…",
    hint: "Szczegóły każdej kategorii znajdą Państwo niżej, w sekcji „Jak obliczamy Państwa cenę”.",
  },
  units: {
    label: "Produkty liczone na sztuki",
    phones: "Telefony",
    scooters: "Hulajnogi, bieżnie",
    bikes: "Rowery",
  },
  cartons: {
    title: "Państwa kartony",
    line: "Partia {n}",
    quantity: "Kartony",
    length: "Dł. (cm)",
    width: "Szer. (cm)",
    height: "Wys. (cm)",
    weight: "Waga (kg)",
    add: "+ Dodaj partię",
    remove: "Usuń",
  },
  designations: { label: "Rodzaje produktów", hint: "Liczba różnych deklarowanych produktów." },
  options: {
    declaration: "Osobna deklaracja eksportowa",
    declarationHint: "350 RMB, +50 RMB za każdą stronę po pierwszej.",
    signature: "Podpis przy doręczeniu",
    signatureHint: "Dostawy UPS: 30 RMB za paczkę.",
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
    mode: "Statek · Chiny → Europa",
    delayLabel: "Czas transportu",
    delay: "łącznie od 40 do 45 dni",
    surcharges: "Do wysyłki doliczamy",
    oversize: "Paczki niestandardowe: {n}",
    singleCarton: "Wysyłka jednej paczki",
    nonAmazon: "Adres inny niż Amazon",
    vatClearance: "Odprawa na Państwa numer VAT",
  },
  warnings: {
    refusedGoods: "Ten towar nie jest przyjmowany do transportu morskiego.",
    refusedCarton:
      "Jeden z kartonów przekracza limity (65 kg, 270 cm na jednym boku lub długość + 2 × (szerokość + wysokość) powyżej 400 cm): trzeba go przepakować.",
    tooManyDesignations:
      "W wariancie z cłem i podatkami w cenie wysyłka może obejmować maksymalnie 5 rodzajów produktów: przy większej liczbie przygotowujemy wycenę.",
    noCartons: "Prosimy podać co najmniej jeden karton wraz z wymiarami i wagą.",
  },
  gate: {
    locked: "Cena wyświetli się po rejestracji",
    points: [
      "Szczegółowa cena, pozycja po pozycji, wysłana e-mailem",
      "Fracht, dopłaty i nasza prowizja 3%",
      "Państwa szacunek, gotowy do zamiany w wycenę",
    ],
    email: "Państwa adres e-mail",
    emailPlaceholder: "jan.kowalski@firma.pl",
    cta: "Zobacz cenę",
    already: "Mam już konto",
    note: "Ceny orientacyjne, cennik wkrótce zostanie zaktualizowany. Wiążącą cenę podajemy w wycenie.",
    sending: "Wysyłanie…",
    sent: "Wysłaliśmy wiadomość na adres {email}. Prosimy teraz założyć konto, aby mieć dostęp do swoich wycen.",
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
      "Cena wynika z cennika morskiego naszego przewoźnika dla Europy (linie żeglugowe EMC i COSCO). Oto wszystkie jego zasady w odniesieniu do Państwa wysyłki.",
    sections: [
      {
        title: "Waga rozliczeniowa",
        text:
          "Każdy karton rozliczamy według najwyższej z trzech wartości: jego wagi rzeczywistej, wagi gabarytowej (długość × szerokość × wysokość w cm ÷ 6000) oraz minimum 12 kg na karton (10 kg w przypadku magazynów Amazon z dostawą ciężarówką, w wariancie z cłem i podatkami w cenie). Następnie sumujemy wszystkie kartony.",
      },
      {
        title: "Przedziały wagowe",
        text:
          "Cena za kilogram spada wraz z łączną wagą: od 21 do 70 kg, od 71 do 299 kg, 300 kg i więcej. Każda wysyłka jest rozliczana jako co najmniej 21 kg, a na liniach z dostawą ciężarówką, które zaczynają się od 71 kg – jako co najmniej 71 kg.",
      },
      {
        title: "Cło i podatki w cenie czy na Państwa numer VAT",
        text:
          "Cło i podatki w cenie: cło i VAT importowy są wliczone w cenę, maksymalnie 5 rodzajów produktów na wysyłkę. Na Państwa numer VAT: podają Państwo ważny numer VAT i numer EORI, a VAT importowy rozliczają Państwo w ramach samonaliczenia; 380 RMB opłaty za odprawę celną od wysyłki, cło i podatki refakturowane według rzeczywistych kosztów, 30 RMB za każdy rodzaj produktu powyżej 5. W razie kontroli celnej: 900 € opłaty manipulacyjnej, rozdzielonej między partie w kontenerze, oraz 3 € za paletę za każdy dzień składowania.",
      },
      {
        title: "Miejsce dostawy",
        text:
          "Magazyny Amazon z dostawą ciężarówką, dostawa przez UPS lub DPD (przewoźnika wybieramy my) w Niemczech, Francji, we Włoszech i w Hiszpanii albo przez UPS w 23 krajach. Adres, który nie jest magazynem Amazon (osoba prywatna, firma): +1 RMB za kilogram, minimum 100 RMB przy wysyłce jednej paczki.",
      },
      {
        title: "Dopłaty zależne od rodzaju towaru",
        text:
          "+1 RMB/kg: przybory kuchenne, oświetlenie, ceramika, akcesoria samochodowe i rowerowe, artykuły z drewna lub bambusa, długopisy, namioty, narzędzia, kamery, wideorejestratory, urządzenia kosmetyczne, odtwarzacze multimedialne, roboty odkurzające, projektory, dyski twarde, lampy solarne, parasole, peruki, walizki, drony, pamięci USB… +3 RMB/kg: artykuły dla dorosłych, kosmetyki, dodatki krawieckie, skarpety, czapki, rękawiczki, pościel, tkaniny, torby, wyroby ze skóry. +4 RMB/kg: odzież, obuwie, bielizna, stroje kąpielowe i wszelkie tekstylia do noszenia. Za sztukę: telefony +3 RMB, hulajnogi i bieżnie +7,50 €, rowery +75 €. Dopłaty sumują się.",
      },
      {
        title: "Paczki niestandardowe",
        text:
          "Nie są przyjmowane paczki powyżej 65 kg, z bokiem dłuższym niż 270 cm lub takie, w których długość + 2 × (szerokość + wysokość) przekracza 400 cm. Dla każdego kartonu naliczana jest najwyższa z dopłat: 130 RMB przy wadze od 30 do 40 kg albo gdy najdłuższy bok przekracza 100 cm lub drugi co do długości 76 cm; 600 RMB powyżej 40 kg; 120 RMB, gdy długość + 2 × (szerokość + wysokość) wynosi od 266 do 320 cm, 900 RMB – od 321 do 400 cm. Wysyłka jednej paczki: +80 RMB.",
      },
      {
        title: "Opcje",
        text:
          "Osobna deklaracja eksportowa: 350 RMB, +50 RMB za każdą stronę po pierwszej (5 pozycji na stronę). Podpis przy doręczeniu w przypadku UPS: 30 RMB za paczkę. Przewoźnik wskazany przez Państwa: +1 RMB za kilogram (+0,5 RMB za DHL na linii QOT Express).",
      },
      {
        title: "Terminy",
        text:
          "Zamknięcie przyjęć w piątek, wypłynięcie w środę. Odbiór towaru około 38–42 dni po wypłynięciu statku; łącznie od 40 do 45 dni.",
      },
      {
        title: "Nasza prowizja",
        text: "3% od frachtu, który Państwu refakturujemy, jako osobna pozycja w wycenie.",
      },
      {
        title: "Czego cena nie obejmuje",
        text:
          "Obszary oddalone (dopłata refakturowana na podstawie faktury przewoźnika), zmiana adresu, opłaty za kontrolę celną, VAT i cło przy odprawie na Państwa numer VAT, ubezpieczenie oraz nasze usługi magazynowe w Guangzhou (przyjęcie, kontrola, wzmocnienie, załadunek), które podajemy w wycenie.",
      },
      {
        title: "Towary nieprzyjmowane",
        text:
          "Płyny, proszki, podróbki, baterie luzem, powerbanki, monocykle elektryczne, wyroby tytoniowe, żywność, leki, produkty żrące, łatwopalne lub wybuchowe, broń. Produkty z wbudowanymi bateriami i produkty magnetyczne są przyjmowane. Jeśli podczas kontroli przed eksportem zostanie wykryty towar wrażliwy, kosztuje to 3000 RMB kary, zwrot towaru oraz 8 RMB/kg opłaty manipulacyjnej.",
      },
      {
        title: "Opakowanie",
        text:
          "Wszystkie produkty muszą mieć oznaczenie MADE IN CHINA, a tekstylia, wyroby skórzane, bagaż i obuwie – także etykietę ze składem i sposobem konserwacji. Dla magazynów Amazon: na każdym kartonie dwie etykiety z kodem kreskowym do przyjęcia w magazynie, etykiety SKU i FBA zabezpieczone przezroczystą taśmą. Prosimy nie używać żółtej taśmy klejącej.",
      },
      {
        title: "W razie utraty",
        text:
          "Utrata lub zatrzymanie przez urząd celny: odszkodowanie według zadeklarowanej wartości, maksymalnie 20 RMB za kilogram, bez zwrotu kosztów frachtu. Uszkodzenia nie podlegają odszkodowaniu: w przypadku wartościowego towaru prosimy zadbać o ubezpieczenie.",
      },
    ],
  },
  email: {
    sep: ": ",
    subject: "Szacunkowy koszt frachtu morskiego: {total}",
    heading: "Państwa szacunek od Sourcing Pick",
    intro:
      "Oto szczegóły Państwa wysyłki statkiem, obliczone według cennika morskiego naszego przewoźnika dla Europy i wszystkich jego zasad.",
    summary: {
      regime: "Odprawa celna",
      delivery: "Dostawa",
      cartons: "Kartony",
      real: "Waga rzeczywista",
      volumetric: "Waga gabarytowa",
      chargeable: "Waga rozliczeniowa",
      bracket: "Przedział i stawka",
      delay: "Czas transportu",
    },
    items: {
      freight: "Fracht morski ({kg} kg × {rate} RMB/kg)",
      goods: "Dopłata za rodzaj towaru ({kg} kg × {rate} RMB/kg)",
      nonAmazon: "Adres inny niż Amazon (+1 RMB/kg, minimum 100 RMB przy jednej paczce)",
      singleCarton: "Wysyłka jednej paczki",
      oversize: "Paczki niestandardowe ({cartons} szt.)",
      phones: "Telefony ({units} × 3 RMB)",
      vatClearance: "Odprawa na Państwa numer VAT",
      declaration: "Osobna deklaracja eksportowa ({pages} str.)",
      designations: "Rodzaje produktów powyżej 5 ({extra} × 30 RMB)",
      signature: "Podpis przy doręczeniu UPS ({cartons} × 30 RMB)",
      scooters: "Hulajnogi i bieżnie ({units} × 7,50 €)",
      bikes: "Rowery ({units} × 75 €)",
    },
    subtotal: "Suma częściowa za transport",
    commission: "Prowizja Sourcing Pick (3% frachtu)",
    total: "Szacunkowa suma",
    notIncludedTitle: "Cena nie obejmuje",
    notIncluded: [
      "Obszary oddalone, zmiana adresu, opłaty za kontrolę celną",
      "VAT importowy i cło przy odprawie na Państwa numer VAT",
      "Ubezpieczenie",
      "Nasze usługi magazynowe w Guangzhou (przyjęcie, kontrola, wzmocnienie, załadunek), podane w wycenie",
    ],
    disclaimer:
      "Cena orientacyjna, obliczona według obecnego cennika naszego przewoźnika (wkrótce zostanie zaktualizowany). Wiążącą cenę podajemy w wycenie.",
    signup: "Prosimy założyć konto Sourcing Pick, aby zamienić ten szacunek w wycenę:",
    signupCta: "Załóż konto",
    footer: "Sourcing Pick · Guangzhou · contact@sourcingpick.com",
  },
};
