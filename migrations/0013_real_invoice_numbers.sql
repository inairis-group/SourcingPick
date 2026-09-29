delete from ops_invoices
where number in ('FA-2026-0184', 'FA-2026-0198', 'FA-2026-0212')
   or client_name in ('Atelier Nord SARL', 'Renard Import', 'Maison Delorme', 'Nord Import');

with ranked as (
  select id, row_number() over (
    order by case when id = 'inv_manzini_004' or number = 'SP-FA-2026-004' then 0 else 1 end, number
  ) as n
  from ops_invoices
)
update ops_invoices as invoice
set number = 'SP-FA-2026-' || lpad(ranked.n::text, 3, '0')
from ranked
where invoice.id = ranked.id;
