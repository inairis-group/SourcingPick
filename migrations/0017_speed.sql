create index if not exists ops_quotes_order_ref_idx on ops_quotes (order_ref);
create index if not exists ops_invoices_order_ref_idx on ops_invoices (order_ref);
create index if not exists ops_documents_order_ref_idx on ops_documents (order_ref);
create index if not exists ops_messages_order_idx on ops_messages (order_id);
create index if not exists ops_journal_created_idx on ops_journal (created_at desc);
create index if not exists ops_orders_client_idx on ops_orders (client_name);
