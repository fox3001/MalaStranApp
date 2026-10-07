import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { getToken } from "@/lib/api";

export const Route = createFileRoute("/")({ component: Home });

/** La pagina iniziale è direttamente l'accesso degli user (in basso il link per l'admin). */
function Home() {
  const router = useRouter();
  useEffect(() => {
    if (getToken("user")) void router.navigate({ to: "/u" });
  }, [router]);
  return <LoginScreen area="user" onDone={() => void router.navigate({ to: "/u" })} />;
}
