import { createFileRoute } from "@tanstack/react-router";
import { TavernaPage } from "@/components/TavernaPage";

export const Route = createFileRoute("/admin/taverna")({ component: () => <TavernaPage area="admin" /> });
