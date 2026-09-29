create index if not exists ops_quotes_issued_idx on ops_quotes (issued_on desc);
create index if not exists ops_quotes_order_idx on ops_quotes (order_ref);
create index if not exists ops_invoices_order_idx on ops_invoices (order_ref);
create index if not exists ops_messages_order_idx on ops_messages (order_id, created_at);
create index if not exists ops_journal_ref_idx on ops_journal (object_ref, created_at desc);
