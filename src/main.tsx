import ReactDOM from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 10_000 } } });

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
