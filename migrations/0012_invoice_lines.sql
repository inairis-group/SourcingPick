alter table ops_invoices add column if not exists lines_json text not null default '[]';
