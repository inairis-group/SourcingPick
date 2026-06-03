-- Standalone messaging tab + voice notes (partner feedback #9). Schema-
-- only scaffold: a DIRECT thread context (not anchored to an entity) +
-- an AUDIO attachment kind. UI lands in a follow-up.

ALTER TYPE "ThreadContextType" ADD VALUE 'DIRECT';
ALTER TYPE "AttachmentKind" ADD VALUE 'AUDIO';
