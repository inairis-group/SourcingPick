alter table ops_quotes add column if not exists client_email text not null default '';
alter table ops_quotes add column if not exists public_token text not null default '';
alter table ops_quotes add column if not exists otp_hash text not null default '';
alter table ops_quotes add column if not exists otp_expires text not null default '';
alter table ops_quotes add column if not exists sign_meta text not null default '';
alter table ops_quotes add column if not exists deposit_invoice_id text not null default '';

create table if not exists ops_outbox (
  id text primary key,
  quote_id text not null default '',
  to_email text not null default '',
  subject text not null default '',
  body text not null default '',
  sent boolean not null default false,
  created_at timestamptz not null default now()
);
