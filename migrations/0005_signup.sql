alter table admin_users add column if not exists kind text not null default 'pro';
alter table admin_users add column if not exists company text not null default '';
alter table admin_users add column if not exists vat text not null default '';
alter table admin_users add column if not exists country text not null default '';
alter table admin_users add column if not exists email_verified boolean not null default true;
alter table admin_users add column if not exists verify_code_hash text not null default '';
alter table admin_users add column if not exists verify_token_hash text not null default '';
alter table admin_users add column if not exists verify_expires timestamptz;
