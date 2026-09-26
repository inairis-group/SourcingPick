import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import raw from "@/site/mentions.body.txt?raw";

export const Route = createFileRoute("/mentions")({ component: () => <LegalPage title="Mentions légales" raw={raw} /> });
