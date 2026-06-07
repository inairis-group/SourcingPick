import "server-only";
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * SourcingPick quote PDF — partner #22.
 *
 * Per the compliance briefing, quotes are commercial (PRC Civil Code
 * Art. 473: invitation to offer, not a binding instrument) — no
 * statutory fapiao analog. Field set is therefore driven by buyer
 * clarity, not regulation:
 *
 *   - Buyer + factory (via agent) identities
 *   - Product + quantity + unit price + total in EUR
 *   - Lead time, MOQ, Incoterm
 *   - Deposit / balance split
 *   - Validity period
 *   - Reference numbers (quote, request, factory)
 *   - Notes (free-text from the agent)
 *
 * The PDF is intentionally clean and brand-aligned — partner asked
 * for "complete, readable, visual" without legal overhead.
 */

export type QuotePdfPayload = {
  reference: string;
  request: { reference: string; title: string };
  buyer: {
    legalName: string;
    city: string | null;
    country: string;
  };
  factory: { displayName: string; country: string };
  agentName: string | null;
  unitPriceCentsClient: number;
  totalCentsClient: number;
  quantity: number;
  leadTimeDays: number;
  moq: number;
  incoterm: string;
  depositPercentageBps: number;
  validUntil: Date;
  issuedAt: Date;
  notes: string | null;
};

export async function renderQuotePdf(payload: QuotePdfPayload): Promise<Buffer> {
  const depositCents = Math.round(
    (payload.totalCentsClient * payload.depositPercentageBps) / 10000,
  );
  const balanceCents = payload.totalCentsClient - depositCents;

  const doc = (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.brand}>SourcingPick</Text>
            <Text style={S.brandTagline}>International sourcing, industrialised</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.docTitle}>DEVIS · QUOTE</Text>
            <Text>
              <Text style={S.label}>N°: </Text>
              {payload.reference}
            </Text>
            <Text>
              <Text style={S.label}>Demande: </Text>
              {payload.request.reference}
            </Text>
            <Text>
              <Text style={S.label}>Émis: </Text>
              {payload.issuedAt.toISOString().slice(0, 10)}
            </Text>
            <Text>
              <Text style={S.label}>Validité jusqu'au: </Text>
              {payload.validUntil.toISOString().slice(0, 10)}
            </Text>
          </View>
        </View>

        <Text style={S.requestTitle}>{payload.request.title}</Text>

        {/* Parties */}
        <View style={S.partiesRow}>
          <View style={S.party}>
            <Text style={S.sectionTitle}>Acheteur / Buyer</Text>
            <Text style={S.bold}>{payload.buyer.legalName}</Text>
            <Text>
              {payload.buyer.city ? `${payload.buyer.city}, ` : ""}
              {payload.buyer.country}
            </Text>
          </View>
          <View style={S.party}>
            <Text style={S.sectionTitle}>Usine / Factory</Text>
            <Text style={S.bold}>{payload.factory.displayName}</Text>
            <Text>{payload.factory.country}</Text>
            {payload.agentName && (
              <Text style={S.muted}>Agent: {payload.agentName}</Text>
            )}
          </View>
        </View>

        {/* Pricing */}
        <View style={S.pricingBlock}>
          <View style={S.pricingRow}>
            <Text style={S.pricingLabel}>Prix unitaire / Unit price</Text>
            <Text style={S.pricingValue}>
              {formatEur(payload.unitPriceCentsClient)}
            </Text>
          </View>
          <View style={S.pricingRow}>
            <Text style={S.pricingLabel}>Quantité / Quantity</Text>
            <Text style={S.pricingValue}>{payload.quantity}</Text>
          </View>
          <View style={S.pricingRow}>
            <Text style={S.pricingLabel}>MOQ</Text>
            <Text style={S.pricingValue}>{payload.moq}</Text>
          </View>
          <View style={S.pricingRow}>
            <Text style={S.pricingLabel}>Délai / Lead time</Text>
            <Text style={S.pricingValue}>{payload.leadTimeDays} jours / days</Text>
          </View>
          <View style={S.pricingRow}>
            <Text style={S.pricingLabel}>Incoterm</Text>
            <Text style={S.pricingValue}>{payload.incoterm}</Text>
          </View>
          <View style={[S.pricingRow, S.pricingTotal]}>
            <Text style={S.pricingLabelBold}>Total TTC</Text>
            <Text style={S.pricingValueBold}>
              {formatEur(payload.totalCentsClient)}
            </Text>
          </View>
        </View>

        {/* Payment split */}
        <View style={S.paymentBlock}>
          <Text style={S.sectionTitle}>Modalités de paiement / Payment terms</Text>
          <View style={S.paymentRow}>
            <Text>
              Acompte / Deposit ({payload.depositPercentageBps / 100} %)
            </Text>
            <Text style={S.bold}>{formatEur(depositCents)}</Text>
          </View>
          <View style={S.paymentRow}>
            <Text>
              Solde à l'expédition / Balance on shipment (
              {(10000 - payload.depositPercentageBps) / 100} %)
            </Text>
            <Text style={S.bold}>{formatEur(balanceCents)}</Text>
          </View>
          <Text style={S.paymentFootnote}>
            Paiements en virement bancaire vers le compte séquestre SourcingPick.
            L'usine n'est payée qu'après confirmation de livraison. Toute
            ouverture de litige sous 7 jours après réception suspend le paiement
            de l'usine jusqu'à arbitrage.
          </Text>
        </View>

        {/* Notes */}
        {payload.notes && payload.notes.trim().length > 0 && (
          <View style={S.notesBlock}>
            <Text style={S.sectionTitle}>Notes</Text>
            <Text>{payload.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerNote}>
            Ce devis est valable jusqu'au {payload.validUntil.toISOString().slice(0, 10)}.
            Pour accepter, connectez-vous à votre espace SourcingPick et cliquez
            sur « Accepter le devis » sur cette demande.
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
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottom: "2px solid #162456",
  },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#162456",
  },
  brandTagline: {
    fontSize: 8,
    color: "#475569",
    marginTop: 2,
  },
  headerRight: { textAlign: "right" as const },
  docTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#162456",
    marginBottom: 6,
  },
  label: { fontFamily: "Helvetica-Bold" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#475569", fontSize: 9 },
  requestTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
  },
  partiesRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  party: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 8,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pricingBlock: {
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  pricingLabel: { color: "#475569" },
  pricingValue: { fontFamily: "Helvetica" },
  pricingTotal: {
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1px solid #1e293b",
  },
  pricingLabelBold: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  pricingValueBold: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  paymentBlock: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  paymentFootnote: {
    fontSize: 8,
    color: "#475569",
    marginTop: 6,
    lineHeight: 1.3,
  },
  notesBlock: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#fefce8",
    borderRadius: 4,
  },
  footer: {
    marginTop: 16,
    paddingTop: 8,
    borderTop: "1px solid #e2e8f0",
  },
  footerNote: {
    fontSize: 8,
    color: "#475569",
    lineHeight: 1.3,
  },
});

function formatEur(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
