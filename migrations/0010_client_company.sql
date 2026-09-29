alter table admin_users add column if not exists siren text not null default '';
alter table admin_users add column if not exists siret text not null default '';
alter table admin_users add column if not exists naf text not null default '';
