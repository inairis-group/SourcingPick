alter table ops_quotes add column if not exists signer_name text not null default '';
alter table ops_quotes add column if not exists signed_at text not null default '';
alter table ops_quotes add column if not exists signature_image text not null default '';
