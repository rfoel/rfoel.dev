import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./app.tsx";

// Render da página no build (ver prerender.mjs), para o conteúdo já vir no HTML:
// aparece antes do JavaScript e chega a robôs que não rodam JavaScript.
// No navegador, main.tsx hidrata em cima dele.
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
