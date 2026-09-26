import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import raw from "@/site/confidentialite.body.txt?raw";

export const Route = createFileRoute("/confidentialite")({ component: () => <LegalPage title="Politique de confidentialité" raw={raw} /> });
