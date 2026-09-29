alter table admin_users add column if not exists role text not null default 'admin';
alter table admin_users add column if not exists active boolean not null default true;
alter table admin_sessions add column if not exists id text not null default '';
alter table admin_sessions add column if not exists created_at timestamptz not null default now();
alter table admin_sessions add column if not exists user_agent text not null default '';
alter table admin_sessions add column if not exists ip text not null default '';
