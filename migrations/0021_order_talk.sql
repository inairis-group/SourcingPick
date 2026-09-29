alter table ops_orders add column if not exists client_talk boolean not null default false;
