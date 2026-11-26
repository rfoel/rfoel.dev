// Pegada (analytics sem cookies): o script p.js, no index.html, conta as visitas sozinho e
// expõe window.pegada.track para os eventos. O contato usa a caixa de entrada de feedback
// do site no Pegada: chega lá, avisa por e-mail e dá para responder pelo painel.
export const PEGADA_SITE = "pplzowlv";
const PEGADA_API = "https://pegada.dev";

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    pegada?: { track(name: string, props?: Props): void };
  }
}

// Nunca mande dados pessoais (e-mail, nome) nas props
export function track(name: string, props?: Props) {
  window.pegada?.track(name, props);
}

export async function sendContact(message: string, contact: string) {
  // Texto puro, como o widget do Pegada: sem preflight de CORS
  const response = await fetch(`${PEGADA_API}/api/f`, {
    method: "POST",
    body: JSON.stringify({
      site: PEGADA_SITE,
      url: location.href,
      kind: "outro",
      message,
      contact,
    }),
  });
  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      response.status === 429
        ? "Muitas mensagens em pouco tempo. Tenta de novo daqui a pouco."
        : error || "Não deu para enviar agora. Tenta de novo?",
    );
  }
}
