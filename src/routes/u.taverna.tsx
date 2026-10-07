import { createFileRoute } from "@tanstack/react-router";
import { TavernaPage } from "@/components/TavernaPage";

export const Route = createFileRoute("/u/taverna")({ component: () => <TavernaPage area="user" /> });
