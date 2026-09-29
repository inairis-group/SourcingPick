alter table ops_invoices add column if not exists client_user_id text not null default '';
alter table ops_invoices add column if not exists client_email text not null default '';
alter table ops_invoices add column if not exists client_company text not null default '';
alter table ops_invoices add column if not exists client_address text not null default '';
alter table ops_invoices add column if not exists client_vat text not null default '';
