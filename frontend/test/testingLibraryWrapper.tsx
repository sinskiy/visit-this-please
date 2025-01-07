import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";
import { BrowserRouter } from "react-router";

const queryClient = new QueryClient();
// eslint-disable-next-line react-refresh/only-export-components
function Wrapper({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
}

export default function customRender(ui: ReactNode, options?: RenderOptions) {
  render(ui, { wrapper: Wrapper, ...options });
}
