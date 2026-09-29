alter table ops_quotes add column if not exists client_user_id text not null default '';
alter table ops_quotes add column if not exists client_company text not null default '';
alter table ops_quotes add column if not exists client_address text not null default '';
alter table ops_quotes add column if not exists client_vat text not null default '';
alter table ops_quotes add column if not exists client_country text not null default '';
alter table admin_users add column if not exists address text not null default '';
