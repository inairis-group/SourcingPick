-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('fr', 'en', 'zh');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'FACTORY', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubRole" AS ENUM ('OWNER', 'MEMBER', 'ACCOUNTANT', 'AGENT', 'SENIOR', 'SUPER');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('CLIENT', 'FACTORY', 'PLATFORM');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'GROWTH', 'PRO');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TEXTILE', 'HOME', 'STATIONERY', 'COSMETICS', 'FOOD', 'ELECTRONICS', 'METAL', 'WOOD', 'PLASTIC', 'OTHER');

-- CreateEnum
CREATE TYPE "SourcingRegion" AS ENUM ('EUROPE', 'MAGHREB', 'AFRICA', 'ASIA', 'AMERICAS', 'OCEANIA', 'MIDDLE_EAST', 'ANYWHERE');

-- CreateEnum
CREATE TYPE "Incoterm" AS ENUM ('EXW', 'FOB', 'DAP', 'DDP', 'CIF');

-- CreateEnum
CREATE TYPE "SourcingStatus" AS ENUM ('DRAFT', 'REQUEST_RECEIVED', 'ASSIGNED', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'PAYMENT_PENDING', 'PREPARATION', 'SHIPPED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenderInvitationStatus" AS ENUM ('INVITED', 'VIEWED', 'RESPONDED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT_TO_AGENT', 'SENT_TO_CLIENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PAYMENT_PENDING', 'PREPARATION', 'QC', 'SHIPPED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarketplaceProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OUT_OF_STOCK', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('DEPOSIT', 'BALANCE', 'SOURCING_FEE', 'CERT_FEE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('INITIATED', 'FUNDED', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EscrowReleaseTrigger" AS ENUM ('DELIVERY_CONFIRMED', 'ADMIN_OVERRIDE', 'AUTO_TIMEOUT');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('SEPA', 'SWIFT', 'STRIPE_CONNECT');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'SCHEDULED', 'SENT', 'RECEIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "CertificationBody" AS ENUM ('BUREAU_VERITAS', 'AFNOR', 'SGS', 'LNE');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('DOSSIER', 'AUDIT_PROGRAMME', 'EN_COURS', 'CERTIFIE', 'REFUSE');

-- CreateEnum
CREATE TYPE "ThreadContextType" AS ENUM ('REQUEST', 'QUOTE', 'ORDER', 'CERT', 'KYC', 'DISPUTE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('QUOTE_RECEIVED', 'QUOTE_ACCEPTED', 'PAYMENT_RECEIVED', 'SHIPMENT', 'INVOICE_DUE', 'CERT_UPDATE', 'KYC_DECISION', 'MESSAGE_MENTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditLevel" AS ENUM ('INFO', 'WARN', 'ALERT');

-- CreateEnum
CREATE TYPE "AgentTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AgentTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WebhookSource" AS ENUM ('STRIPE', 'CARRIER', 'OTHER');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "locale" "Locale" NOT NULL DEFAULT 'fr',
    "role" "Role" NOT NULL,
    "subRole" "SubRole" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "EmailOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "vatNumber" TEXT,
    "siren" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kycVerifiedAt" TIMESTAMP(3),
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryProfile" (
    "organizationId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "foundedYear" INTEGER,
    "employees" INTEGER,
    "capabilities" TEXT[],
    "languages" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "iban" TEXT,
    "bic" TEXT,
    "certifications" TEXT[],

    CONSTRAINT "FactoryProfile_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "SourcingRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientOrgId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "agentId" TEXT,
    "title" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "budgetCents" INTEGER,
    "targetUnitPriceCents" INTEGER,
    "deadline" TIMESTAMP(3) NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "incoterm" "Incoterm" NOT NULL,
    "sourcingRegion" "SourcingRegion" NOT NULL,
    "requiredCerts" TEXT[],
    "status" "SourcingStatus" NOT NULL DEFAULT 'DRAFT',
    "assignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourcingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourcingProduct" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "targetPriceCents" INTEGER,
    "images" TEXT[],

    CONSTRAINT "SourcingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderInvitation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "factoryOrgId" TEXT NOT NULL,
    "matchingScore" INTEGER NOT NULL,
    "status" "TenderInvitationStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "factoryOrgId" TEXT NOT NULL,
    "agentId" TEXT,
    "unitPriceCentsFactory" INTEGER NOT NULL,
    "marginCents" INTEGER NOT NULL,
    "unitPriceCentsClient" INTEGER NOT NULL,
    "totalCentsClient" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "moq" INTEGER NOT NULL,
    "incoterm" "Incoterm" NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "qualificationScore" INTEGER NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "clientOrgId" TEXT NOT NULL,
    "factoryOrgId" TEXT NOT NULL,
    "agentId" TEXT,
    "totalCents" INTEGER NOT NULL,
    "depositCents" INTEGER NOT NULL,
    "balanceCents" INTEGER NOT NULL,
    "commissionCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "estimatedEta" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "trackingNumber" TEXT,
    "trackingCarrier" TEXT,
    "trackingUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceProduct" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "factoryOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "priceCentsClient" INTEGER NOT NULL,
    "priceCentsFactory" INTEGER NOT NULL,
    "moq" INTEGER NOT NULL,
    "stockAvailable" INTEGER NOT NULL DEFAULT 0,
    "stockLowThreshold" INTEGER,
    "leadTimeDays" INTEGER NOT NULL,
    "certifications" TEXT[],
    "status" "MarketplaceProductStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "orderId" TEXT,
    "organizationId" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "vatRateBps" INTEGER NOT NULL DEFAULT 2000,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'INITIATED',
    "fundedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "releaseTrigger" "EscrowReleaseTrigger",
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "factoryOrgId" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "commissionCents" INTEGER NOT NULL,
    "method" "PayoutMethod" NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "providerRef" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "factoryOrgId" TEXT NOT NULL,
    "sponsorClientOrgId" TEXT,
    "standard" TEXT NOT NULL,
    "body" "CertificationBody" NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'DOSSIER',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "preAuditDate" TIMESTAMP(3),
    "auditDate" TIMESTAMP(3),
    "etaDate" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "contextType" "ThreadContextType" NOT NULL,
    "contextId" TEXT NOT NULL,
    "title" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadParticipant" (
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ThreadParticipant_pkey" PRIMARY KEY ("threadId","userId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "body" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "scanStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contextType" TEXT,
    "contextId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deliveredInapp" BOOLEAN NOT NULL DEFAULT true,
    "deliveredEmail" BOOLEAN NOT NULL DEFAULT false,
    "deliveredSms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "payload" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "level" "AuditLevel" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTask" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "requestId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "AgentTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "AgentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" "WebhookSource" NOT NULL,
    "eventType" TEXT NOT NULL,
    "signature" TEXT,
    "payload" JSONB NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_role_deletedAt_idx" ON "User"("role", "deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "EmailOtp_userId_expiresAt_idx" ON "EmailOtp"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Organization_type_kycStatus_deletedAt_idx" ON "Organization"("type", "kycStatus", "deletedAt");

-- CreateIndex
CREATE INDEX "Organization_type_country_idx" ON "Organization"("type", "country");

-- CreateIndex
CREATE INDEX "FactoryProfile_category_rating_idx" ON "FactoryProfile"("category", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "SourcingRequest_reference_key" ON "SourcingRequest"("reference");

-- CreateIndex
CREATE INDEX "SourcingRequest_status_agentId_idx" ON "SourcingRequest"("status", "agentId");

-- CreateIndex
CREATE INDEX "SourcingRequest_clientOrgId_status_idx" ON "SourcingRequest"("clientOrgId", "status");

-- CreateIndex
CREATE INDEX "SourcingRequest_status_createdAt_idx" ON "SourcingRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SourcingProduct_requestId_idx" ON "SourcingProduct"("requestId");

-- CreateIndex
CREATE INDEX "TenderInvitation_factoryOrgId_status_idx" ON "TenderInvitation"("factoryOrgId", "status");

-- CreateIndex
CREATE INDEX "TenderInvitation_requestId_status_idx" ON "TenderInvitation"("requestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TenderInvitation_requestId_factoryOrgId_key" ON "TenderInvitation"("requestId", "factoryOrgId");

-- CreateIndex
CREATE INDEX "Quote_requestId_status_idx" ON "Quote"("requestId", "status");

-- CreateIndex
CREATE INDEX "Quote_factoryOrgId_status_idx" ON "Quote"("factoryOrgId", "status");

-- CreateIndex
CREATE INDEX "Quote_status_validUntil_idx" ON "Quote"("status", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Order_quoteId_key" ON "Order"("quoteId");

-- CreateIndex
CREATE INDEX "Order_status_factoryOrgId_idx" ON "Order"("status", "factoryOrgId");

-- CreateIndex
CREATE INDEX "Order_status_clientOrgId_idx" ON "Order"("status", "clientOrgId");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceProduct_reference_key" ON "MarketplaceProduct"("reference");

-- CreateIndex
CREATE INDEX "MarketplaceProduct_status_category_idx" ON "MarketplaceProduct"("status", "category");

-- CreateIndex
CREATE INDEX "MarketplaceProduct_factoryOrgId_status_idx" ON "MarketplaceProduct"("factoryOrgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_reference_key" ON "Invoice"("reference");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_status_idx" ON "Invoice"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Invoice_status_dueAt_idx" ON "Invoice"("status", "dueAt");

-- CreateIndex
CREATE INDEX "Invoice_type_issuedAt_idx" ON "Invoice"("type", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_reference_key" ON "EscrowTransaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_invoiceId_key" ON "EscrowTransaction"("invoiceId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_status_orderId_idx" ON "EscrowTransaction"("status", "orderId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_provider_providerRef_idx" ON "EscrowTransaction"("provider", "providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_reference_key" ON "Payout"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_escrowId_key" ON "Payout"("escrowId");

-- CreateIndex
CREATE INDEX "Payout_factoryOrgId_status_idx" ON "Payout"("factoryOrgId", "status");

-- CreateIndex
CREATE INDEX "Payout_status_scheduledAt_idx" ON "Payout"("status", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_reference_key" ON "Certification"("reference");

-- CreateIndex
CREATE INDEX "Certification_factoryOrgId_status_idx" ON "Certification"("factoryOrgId", "status");

-- CreateIndex
CREATE INDEX "Certification_body_status_idx" ON "Certification"("body", "status");

-- CreateIndex
CREATE INDEX "Thread_contextType_contextId_idx" ON "Thread"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "Thread_lastMessageAt_idx" ON "Thread"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ThreadParticipant_userId_unreadCount_idx" ON "ThreadParticipant"("userId", "unreadCount");

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_read_createdAt_idx" ON "Notification"("recipientUserId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_level_createdAt_idx" ON "AuditLog"("level", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AgentTask_agentId_status_dueAt_idx" ON "AgentTask"("agentId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_status_receivedAt_idx" ON "WebhookEvent"("source", "status", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_receivedAt_idx" ON "WebhookEvent"("eventType", "receivedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailOtp" ADD CONSTRAINT "EmailOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryProfile" ADD CONSTRAINT "FactoryProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcingRequest" ADD CONSTRAINT "SourcingRequest_clientOrgId_fkey" FOREIGN KEY ("clientOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcingRequest" ADD CONSTRAINT "SourcingRequest_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcingRequest" ADD CONSTRAINT "SourcingRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourcingProduct" ADD CONSTRAINT "SourcingProduct_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SourcingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderInvitation" ADD CONSTRAINT "TenderInvitation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SourcingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderInvitation" ADD CONSTRAINT "TenderInvitation_factoryOrgId_fkey" FOREIGN KEY ("factoryOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SourcingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_factoryOrgId_fkey" FOREIGN KEY ("factoryOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SourcingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientOrgId_fkey" FOREIGN KEY ("clientOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_factoryOrgId_fkey" FOREIGN KEY ("factoryOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceProduct" ADD CONSTRAINT "MarketplaceProduct_factoryOrgId_fkey" FOREIGN KEY ("factoryOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_factoryOrgId_fkey" FOREIGN KEY ("factoryOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "EscrowTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_factoryOrgId_fkey" FOREIGN KEY ("factoryOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_sponsorClientOrgId_fkey" FOREIGN KEY ("sponsorClientOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SourcingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
