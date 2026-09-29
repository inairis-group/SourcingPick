alter table ops_invoices add column if not exists issued_on text not null default '';
update ops_invoices
set issued_on = case when received_on <> '' then received_on else to_char(current_date, 'YYYY-MM-DD') end
where issued_on = '';

alter table ops_documents add column if not exists file_name text not null default '';
alter table ops_documents add column if not exists mime text not null default '';
alter table ops_documents add column if not exists byte_size integer not null default 0;
