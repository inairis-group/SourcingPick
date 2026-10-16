alter table ops_orders add column if not exists client_user_id text not null default '';
alter table ops_orders add column if not exists client_email text not null default '';
alter table ops_orders add column if not exists client_phone text not null default '';

create index if not exists ops_orders_client_user_idx on ops_orders (client_user_id) where client_user_id <> '';
