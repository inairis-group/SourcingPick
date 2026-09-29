alter table ops_quotes add column if not exists client_siren text not null default '';
alter table ops_quotes add column if not exists client_siret text not null default '';
alter table ops_quotes add column if not exists client_naf text not null default '';
alter table ops_invoices add column if not exists client_siren text not null default '';
alter table ops_invoices add column if not exists client_siret text not null default '';
alter table ops_invoices add column if not exists client_naf text not null default '';

update ops_quotes q set
  client_company = case when q.client_company = '' then u.company else q.client_company end,
  client_address = case when q.client_address = '' then u.address else q.client_address end,
  client_vat = case when q.client_vat = '' then u.vat else q.client_vat end,
  client_country = case when q.client_country = '' then u.country else q.client_country end,
  client_siren = case when q.client_siren = '' then u.siren else q.client_siren end,
  client_siret = case when q.client_siret = '' then u.siret else q.client_siret end,
  client_naf = case when q.client_naf = '' then u.naf else q.client_naf end
from admin_users u
where q.client_user_id <> '' and q.client_user_id = u.id;

update ops_invoices i set
  client_company = case when i.client_company = '' then u.company else i.client_company end,
  client_address = case when i.client_address = '' then u.address else i.client_address end,
  client_vat = case when i.client_vat = '' then u.vat else i.client_vat end,
  client_siren = case when i.client_siren = '' then u.siren else i.client_siren end,
  client_siret = case when i.client_siret = '' then u.siret else i.client_siret end,
  client_naf = case when i.client_naf = '' then u.naf else i.client_naf end
from admin_users u
where i.client_user_id <> '' and i.client_user_id = u.id;
