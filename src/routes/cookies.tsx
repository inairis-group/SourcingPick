import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import raw from "@/site/cookies.body.txt?raw";

export const Route = createFileRoute("/cookies")({ component: () => <LegalPage title="Politique de cookies" raw={raw} /> });
