-- The product now speaks the site's full twelve languages rather than four.
-- See src/lib/i18n/config.ts: the fr/en/zh/ar split existed only because the
-- other eight had no application copy, and they have dictionaries now.
--
-- Inserted in the language menu's own order rather than appended, so that
-- `ORDER BY locale` sorts the way the menu lists them. Postgres fixes an
-- enum's sort order at the moment a label is added and there is no way to
-- reorder one afterwards short of rebuilding the type, so getting this right
-- here is cheaper than regretting it later.
--
-- Safe in one migration on PostgreSQL 12+ (this database is 17): ADD VALUE is
-- transactional there. The restriction that remains — a value cannot be USED
-- in the transaction that adds it — does not apply, because nothing below
-- writes one.

ALTER TYPE "Locale" ADD VALUE 'es' BEFORE 'ar';
ALTER TYPE "Locale" ADD VALUE 'de' BEFORE 'ar';
ALTER TYPE "Locale" ADD VALUE 'it' BEFORE 'ar';
ALTER TYPE "Locale" ADD VALUE 'pt' BEFORE 'ar';
ALTER TYPE "Locale" ADD VALUE 'nl' BEFORE 'ar';
ALTER TYPE "Locale" ADD VALUE 'ru' AFTER 'ar';
ALTER TYPE "Locale" ADD VALUE 'tr' AFTER 'ru';
ALTER TYPE "Locale" ADD VALUE 'pl' AFTER 'tr';
