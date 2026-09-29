alter table ops_invoices add column if not exists kind text not null default 'standard';
alter table ops_invoices add column if not exists due_on text not null default '';
alter table ops_invoices add column if not exists reminders_on boolean not null default false;
alter table ops_invoices add column if not exists reminder_level integer not null default 0;
alter table ops_invoices add column if not exists reminder_on text not null default '';
alter table ops_invoices add column if not exists series_id text not null default '';

create table if not exists ops_series (
  id text primary key,
  label text not null default '',
  client_user_id text not null default '',
  client_name text not null default '',
  client_email text not null default '',
  client_company text not null default '',
  client_address text not null default '',
  client_vat text not null default '',
  order_ref text not null default '',
  lines_json text not null default '[]',
  cadence text not null default 'month',
  next_on text not null,
  end_on text not null default '',
  active boolean not null default true,
  last_number text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists ops_charges (
  id text primary key,
  supplier text not null default '',
  nature text not null,
  description text not null default '',
  cost_cents integer not null,
  markup_bps integer not null default 0,
  client_user_id text not null default '',
  client_name text not null default '',
  client_email text not null default '',
  client_company text not null default '',
  client_address text not null default '',
  client_vat text not null default '',
  order_ref text not null default '',
  invoice_id text not null default '',
  invoice_number text not null default '',
  status text not null default 'À refacturer',
  incurred_on text not null,
  created_at timestamptz not null default now()
);
