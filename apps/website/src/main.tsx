import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";

// O HTML já vem com o render do build (prerender.mjs), então a página aparece antes do
// JavaScript. Aqui o React só assume o que já está na tela.
hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <App />
  </StrictMode>,
);
