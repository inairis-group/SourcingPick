import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import raw from "@/site/cgv.body.txt?raw";

export const Route = createFileRoute("/cgv")({ component: () => <LegalPage title="Conditions générales de vente" raw={raw} /> });
