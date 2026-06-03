-- QC + shipment photo proofs on Order. Per partner feedback #15, the
-- factory uploads photos in each phase so the buyer (and admin during
-- disputes) can see the goods actually exist + actually shipped.

ALTER TYPE "AttachmentContext" ADD VALUE 'ORDER_QC_PROOF';
ALTER TYPE "AttachmentContext" ADD VALUE 'ORDER_SHIPMENT_PROOF';
