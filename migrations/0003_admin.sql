create table if not exists admin_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  token_hash text primary key,
  user_id text not null references admin_users (id) on delete cascade,
  expires_at timestamptz not null
);

create index if not exists admin_sessions_user_idx on admin_sessions (user_id);
