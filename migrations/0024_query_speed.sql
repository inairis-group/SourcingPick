create index if not exists ops_quotes_client_user_idx on ops_quotes (client_user_id) where client_user_id <> '';
create index if not exists ops_quotes_email_idx on ops_quotes (lower(client_email)) where client_email <> '';
create index if not exists ops_invoices_client_user_idx on ops_invoices (client_user_id) where client_user_id <> '';
create index if not exists ops_invoices_kind_status_idx on ops_invoices (kind, status);
create index if not exists ops_journal_ref_action_idx on ops_journal (object_ref, action, created_at desc);
create index if not exists admin_users_email_idx on admin_users (lower(email));
create index if not exists ops_documents_client_idx on ops_documents (client_name);
