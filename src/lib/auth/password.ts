import { hash, compare } from "bcryptjs";

/**
 * bcrypt cost factor. Spec §12.3 says cost 12.
 * Adjust upward (not down) only via a deliberate migration that rehashes
 * passwords on next successful login.
 */
const BCRYPT_COST = 12;

export function hashPassword(plaintext: string): Promise<string> {
  return hash(plaintext, BCRYPT_COST);
}

export function verifyPassword(plaintext: string, hashed: string): Promise<boolean> {
  return compare(plaintext, hashed);
}
