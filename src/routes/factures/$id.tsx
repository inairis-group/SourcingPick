import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Editor } from "@/components/editor";

export const Route = createFileRoute("/factures/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  return (
    <Shell>
      <Editor key={id} id={id} />
    </Shell>
  );
}
