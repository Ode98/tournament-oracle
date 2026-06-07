import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@mantine/core/styles.css";
import "./index.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const theme = createTheme({
  fontFamily: "Outfit, Inter, sans-serif",
  primaryColor: "brand",
  colors: {
    brand: [
      "#f3ebff",
      "#e6d5ff",
      "#ccaeff",
      "#af82fe",
      "#965cfd",
      "#8643fa",
      "#7f36fa",
      "#6d2ad3",
      "#6124be",
      "#541ba7"
    ]
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
