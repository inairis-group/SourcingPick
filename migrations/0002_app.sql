create table if not exists leads (
  id text primary key,
  kind text not null,
  name text not null,
  email text not null,
  subject text not null,
  body text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);

create table if not exists atelier_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
