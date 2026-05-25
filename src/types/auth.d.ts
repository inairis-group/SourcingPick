import type { Role, SubRole, Locale } from "@prisma/client";

/**
 * Module augmentation to add SourcingPick domain fields to the Auth.js
 * Session and JWT shapes. Phase 1 wires the callbacks that actually populate
 * these from the User row at sign-in time.
 */
declare module "next-auth" {
  interface User {
    role?: Role;
    subRole?: SubRole;
    organizationId?: string;
    locale?: Locale;
    twoFactorVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      subRole: SubRole;
      organizationId: string;
      locale: Locale;
      twoFactorVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    subRole?: SubRole;
    organizationId?: string;
    locale?: Locale;
    twoFactorVerified?: boolean;
  }
}
