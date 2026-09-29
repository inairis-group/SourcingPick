create table if not exists ops_orders (
  id text primary key,
  ref text not null unique,
  client_name text not null,
  product text not null,
  agent_name text not null,
  state text not null,
  substate text not null,
  internal_only boolean not null default false,
  note text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists ops_suppliers (
  id text primary key,
  order_id text not null references ops_orders (id) on delete cascade,
  name text not null,
  price text not null,
  qty text not null,
  lead text not null,
  status text not null
);

create table if not exists ops_quotes (
  id text primary key,
  number text not null,
  order_ref text not null default '',
  client_name text not null,
  amount_cents integer not null default 0,
  issued_on text not null,
  status text not null,
  lang text not null default 'fr',
  currency text not null default 'EUR',
  incoterm text not null default 'DAP',
  port text not null default '',
  validity_days integer not null default 15,
  deposit_bps integer not null default 4000,
  goods_bps integer not null default 200,
  freight_bps integer not null default 300,
  lines_json text not null default '[]',
  email_subject text not null default '',
  email_body text not null default ''
);

create table if not exists ops_invoices (
  id text primary key,
  number text not null,
  order_ref text not null default '',
  client_name text not null,
  amount_cents integer not null,
  method text not null default '',
  received_on text not null default '',
  status text not null,
  received_cents integer,
  fees_cents integer not null default 0
);

create table if not exists ops_documents (
  id text primary key,
  client_name text not null,
  category text not null,
  title text not null,
  order_ref text not null default '',
  issued_on text not null
);

create table if not exists ops_emails (
  id text primary key,
  name text not null,
  category text not null,
  trigger_label text not null,
  subject text not null default '',
  body text not null default ''
);

create table if not exists ops_messages (
  id text primary key,
  order_id text not null references ops_orders (id) on delete cascade,
  author text not null,
  body text not null,
  at_label text not null,
  kind text not null default 'message',
  internal_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists ops_journal (
  id text primary key,
  at_label text not null,
  actor text not null,
  action text not null,
  object_ref text not null,
  created_at timestamptz not null default now()
);

create table if not exists ops_settings (
  id text primary key,
  legal_name text not null,
  chinese_name text not null,
  usci text not null,
  address text not null,
  representative text not null,
  goods_bps integer not null,
  freight_bps integer not null,
  deposit_bps integer not null,
  validity_days integer not null,
  beneficiary text not null,
  iban text not null,
  swift text not null,
  bank text not null,
  month_cents integer not null default 0,
  prev_month_cents integer not null default 0
);

alter table admin_users add column if not exists company text not null default '';
alter table admin_users add column if not exists last_seen text not null default '';
alter table admin_users add column if not exists verification text not null default 'Vérifié';
