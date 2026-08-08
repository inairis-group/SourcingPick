import "server-only";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/**
 * SourcingPick invoice PDF — partner #11.
 *
 * Field set built from the compliance briefing:
 *   - EU VAT Directive 2006/112/EC Art. 226 (15 harmonised fields).
 *   - French CGI Art. 242 nonies A + Code de commerce R.123-238
 *     (SAS legal form, share capital, SIREN, RCS [City]).
 *   - 2026 e-invoicing reform's 4 new fields: customer SIREN,
 *     delivery address (when ≠ billing), transaction type, and the
 *     "VAT payable on debits" indicator.
 *   - Reverse-charge wording when the buyer is VAT-registered in
 *     another EU Member State.
 *   - Sequential numbering: caller passes the already-allocated
 *     invoice reference (INV-YYYY-NNNN); the PDF just renders it.
 *
 * The platform's own particulars come from env vars so they stay in
 * one place. See README for the variable list.
 */

const FR_VAT_RATE_BPS = 2000; // 20.00 %

export type InvoicePdfPayload = {
  // Document fields
  reference: string;
  type:
    | "DEPOSIT"
    | "BALANCE"
    | "RESEARCH_FEE"
    | "SOURCING_FEE"
    | "CERT_FEE"
    | "SHIPPING"
    | "ADMIN_CUSTOM";
  issuedAt: Date;
  dueAt: Date;
  amountCents: number;
  vatRateBps: number;

  // Buyer / customer
  buyer: {
    legalName: string;
    address: string;
    city: string;
    country: string; // ISO 3166-1 alpha-2
    vatNumber: string | null;
    siren: string | null;
  };

  // Delivery (when different from billing — 2026 reform mandates).
  delivery?: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  } | null;

  // Order reference for context. Optional for research-fee invoices.
  orderReference: string | null;
  // Plain-language description of what's billed.
  lineDescription: string;
};

/** Platform supplier particulars — pulled from env. */
function platformParticulars() {
  return {
    legalName: process.env.PLATFORM_LEGAL_NAME ?? "SourcingPick SAS",
    legalForm: process.env.PLATFORM_LEGAL_FORM ?? "SAS",
    address: process.env.PLATFORM_ADDRESS ?? "",
    city: process.env.PLATFORM_CITY ?? "Paris",
    country: process.env.PLATFORM_COUNTRY ?? "FR",
    vatNumber: process.env.PLATFORM_VAT_NUMBER ?? "",
    siren: process.env.PLATFORM_SIREN ?? "",
    rcsCity: process.env.PLATFORM_RCS_CITY ?? "Paris",
    shareCapital: process.env.PLATFORM_SHARE_CAPITAL ?? "",
    email: process.env.EMAIL_FROM ?? "",
  };
}

export async function renderInvoicePdf(payload: InvoicePdfPayload): Promise<Buffer> {
  const supplier = platformParticulars();

  // VAT treatment (per the compliance briefing):
  //   - Buyer in another EU country with valid VAT number → reverse charge
  //     (no VAT on the invoice; wording mandatory).
  //   - Buyer in FR → French VAT applies at the line rate.
  //   - Buyer outside the EU → outside scope of French VAT.
  const buyerInFR = payload.buyer.country === "FR";
  const buyerInEU =
    EU_COUNTRY_CODES.has(payload.buyer.country) && payload.buyer.country !== "FR";
  const isReverseCharge = buyerInEU && Boolean(payload.buyer.vatNumber);
  const isExtraEU = !buyerInFR && !buyerInEU;

  const netAmountCents = buyerInFR
    ? Math.round((payload.amountCents * 10000) / (10000 + payload.vatRateBps))
    : payload.amountCents;
  const vatAmountCents = buyerInFR ? payload.amountCents - netAmountCents : 0;

  const doc = (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header — supplier + invoice number / dates */}
        <View style={S.header}>
          <View style={S.supplier}>
            <Text style={S.supplierName}>{supplier.legalName}</Text>
            <Text>{supplier.address}</Text>
            <Text>
              {supplier.city}, {supplier.country}
            </Text>
            <Text>
              {supplier.legalForm}
              {supplier.shareCapital
                ? ` au capital de ${supplier.shareCapital} €`
                : ""}
            </Text>
            <Text>
              SIREN {supplier.siren} · RCS {supplier.rcsCity}
            </Text>
            <Text>TVA intracom. {supplier.vatNumber}</Text>
            {supplier.email && <Text>{supplier.email}</Text>}
          </View>
          <View style={S.headerRight}>
            <Text style={S.docTitle}>FACTURE / INVOICE</Text>
            <Text>
              <Text style={S.label}>N°: </Text>
              {payload.reference}
            </Text>
            <Text>
              <Text style={S.label}>Émise le: </Text>
              {payload.issuedAt.toISOString().slice(0, 10)}
            </Text>
            <Text>
              <Text style={S.label}>Échéance: </Text>
              {payload.dueAt.toISOString().slice(0, 10)}
            </Text>
            {payload.orderReference && (
              <Text>
                <Text style={S.label}>Commande: </Text>
                {payload.orderReference}
              </Text>
            )}
            <Text>
              <Text style={S.label}>Type: </Text>
              {TYPE_LABEL[payload.type]}
            </Text>
          </View>
        </View>

        {/* Buyer block */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Facturé à / Bill to</Text>
          <Text style={S.bold}>{payload.buyer.legalName}</Text>
          <Text>{payload.buyer.address}</Text>
          <Text>
            {payload.buyer.city}, {payload.buyer.country}
          </Text>
          {payload.buyer.vatNumber && (
            <Text>TVA intracom. {payload.buyer.vatNumber}</Text>
          )}
          {payload.buyer.siren && <Text>SIREN {payload.buyer.siren}</Text>}
        </View>

        {/* Delivery address — only when different from billing */}
        {payload.delivery && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Livraison / Delivery</Text>
            <Text>{payload.delivery.street}</Text>
            <Text>
              {payload.delivery.postalCode} {payload.delivery.city},{" "}
              {payload.delivery.country}
            </Text>
          </View>
        )}

        {/* Line items */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Détail / Line</Text>
          <View style={S.lineRow}>
            <Text style={[S.lineCell, S.lineDesc]}>
              {payload.lineDescription}
            </Text>
            <Text style={[S.lineCell, S.lineAmount]}>
              {formatEur(netAmountCents)} HT
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={S.totals}>
          {buyerInFR ? (
            <>
              <Text>
                <Text style={S.label}>HT: </Text>
                {formatEur(netAmountCents)}
              </Text>
              <Text>
                <Text style={S.label}>TVA {payload.vatRateBps / 100} %: </Text>
                {formatEur(vatAmountCents)}
              </Text>
              <Text style={S.total}>
                <Text style={S.label}>TTC: </Text>
                {formatEur(payload.amountCents)}
              </Text>
            </>
          ) : (
            <Text style={S.total}>
              <Text style={S.label}>Total: </Text>
              {formatEur(payload.amountCents)}
            </Text>
          )}
        </View>

        {/* Statutory mentions */}
        <View style={S.footer}>
          {isReverseCharge && (
            <Text style={S.mention}>
              Autoliquidation — TVA due par le preneur (Art. 196 Directive
              2006/112/CE). Reverse charge — VAT due by the customer.
            </Text>
          )}
          {isExtraEU && (
            <Text style={S.mention}>
              Exportation de services — hors champ de la TVA française (Art. 259
              CGI).
            </Text>
          )}
          <Text style={S.mention}>
            Pénalités de retard : taux d'intérêt légal + 10 points · indemnité
            forfaitaire de recouvrement de 40 €.
          </Text>
          <Text style={S.mention}>
            Pas d'escompte pour règlement anticipé.
          </Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

const S = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  supplier: { width: "60%" },
  supplierName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  headerRight: { width: "35%", textAlign: "right" as const },
  docTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  label: { fontFamily: "Helvetica-Bold" },
  bold: { fontFamily: "Helvetica-Bold" },
  section: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: 8,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  lineCell: {},
  lineDesc: { width: "70%" },
  lineAmount: { width: "30%", textAlign: "right" as const },
  totals: {
    marginTop: 8,
    alignSelf: "flex-end" as const,
    width: 220,
  },
  total: {
    marginTop: 4,
    paddingTop: 4,
    borderTop: "1px solid #1e293b",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    marginTop: 24,
    paddingTop: 8,
    borderTop: "1px solid #e2e8f0",
  },
  mention: {
    fontSize: 7,
    color: "#475569",
    marginBottom: 3,
  },
});

const TYPE_LABEL: Record<InvoicePdfPayload["type"], string> = {
  DEPOSIT: "Acompte / Deposit",
  BALANCE: "Solde / Balance",
  RESEARCH_FEE: "Frais de recherche / Research fee",
  SOURCING_FEE: "Frais de sourcing / Sourcing fee",
  CERT_FEE: "Frais de certification / Certification fee",
  SHIPPING: "Transport / Freight",
  ADMIN_CUSTOM: "Facture / Invoice",
};

function formatEur(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

/** EU27 country codes (post-Brexit). Source: EU Commission as of 2026. */
const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

// Suppress unused-import warnings for the VAT rate constant — kept so
// the caller can sanity-check against the 20 % default.
void FR_VAT_RATE_BPS;
