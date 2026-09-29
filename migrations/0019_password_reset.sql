alter table admin_users add column if not exists reset_code_hash text not null default '';
alter table admin_users add column if not exists reset_expires timestamptz;
