import "server-only";
import { WiseError, wiseFetch, wiseProfileId } from "./client";

/**
 * Wise Recipients API helpers.
 *
 * Wise has dozens of recipient "types" — each country/rail has its own
 * shape (`iban`, `swift_code`, `chinese_local`, `aba`, `sort_code`, etc.).
 * Adding every type up front balloons the form. We support the three that
 * cover SourcingPick's actual supplier corridors today:
 *
 *   - IBAN          : EU, UK, Portugal, Morocco, Turkey (when offered as EUR).
 *   - SWIFT         : everything else — India, Vietnam, fallback rail.
 *   - CHINESE_LOCAL : mainland China, native CNY rail. Lower fees + faster
 *                     than SWIFT for the dominant corridor.
 *
 * Adding a new type later is mechanical: extend `RecipientInput`, add a
 * case in `buildPayload`, add the matching fields to the form. Wise's docs
 * enumerate every type's required `details` keys.
 */

export type RecipientInput =
  | {
      type: "IBAN";
      holderName: string;
      currency: string; // 3-letter ISO code, e.g. "EUR"
      iban: string;
    }
  | {
      type: "SWIFT";
      holderName: string;
      currency: string;
      swiftCode: string;
      accountNumber: string;
    }
  | {
      type: "CHINESE_LOCAL";
      holderName: string;
      currency: "CNY";
      bankCode: string;
      accountNumber: string;
    };

/**
 * The body Wise expects on `POST /v1/accounts`. `legalType: "BUSINESS"` is
 * baked in because our factories are always businesses, not individuals.
 */
function buildPayload(input: RecipientInput, profile: string) {
  switch (input.type) {
    case "IBAN":
      return {
        currency: input.currency,
        type: "iban",
        profile,
        accountHolderName: input.holderName,
        details: {
          legalType: "BUSINESS",
          IBAN: input.iban.replace(/\s+/g, "").toUpperCase(),
        },
      };
    case "SWIFT":
      return {
        currency: input.currency,
        type: "swift_code",
        profile,
        accountHolderName: input.holderName,
        details: {
          legalType: "BUSINESS",
          swiftCode: input.swiftCode.toUpperCase(),
          accountNumber: input.accountNumber,
        },
      };
    case "CHINESE_LOCAL":
      return {
        currency: "CNY",
        type: "chinese_local",
        profile,
        accountHolderName: input.holderName,
        details: {
          legalType: "BUSINESS",
          bankCode: input.bankCode,
          accountNumber: input.accountNumber,
        },
      };
  }
}

type CreateRecipientResponse = { id: number | string };

/**
 * Register a recipient with Wise and return its id. Throws WiseError on
 * any non-2xx — caller decides whether to surface the message or fall
 * back. We pass the profile id from env (the platform's business profile).
 */
export async function createWiseRecipient(
  input: RecipientInput,
): Promise<string> {
  const profile = wiseProfileId();
  if (!profile) {
    throw new WiseError(
      "WISE_PROFILE_ID is not set — cannot create a recipient.",
    );
  }
  const payload = buildPayload(input, profile);
  const res = await wiseFetch<CreateRecipientResponse>("/v1/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // Wise returns the id as a number historically — coerce to string for
  // our schema (Organization.wiseRecipientId is TEXT).
  return String(res.id);
}
