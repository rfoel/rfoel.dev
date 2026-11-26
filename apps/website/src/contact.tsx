import { type FormEvent, useState } from "react";
import { sendContact, track } from "./pegada.ts";

type State = { status: "idle" | "sending" | "sent" } | { status: "error"; message: string };

export function Contact() {
  const [state, setState] = useState<State>({ status: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const field = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const message = field("message");
    const contact = field("contact");
    if (!message) return;
    setState({ status: "sending" });
    try {
      await sendContact(message, contact);
      track("contato_enviado", { com_email: Boolean(contact) });
      form.reset();
      setState({ status: "sent" });
    } catch (error) {
      setState({ status: "error", message: (error as Error).message });
    }
  };

  return (
    <section
      id="contato"
      className="grid scroll-mt-6 gap-8 border-t border-(--line) py-16 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12"
    >
      <div>
        <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
          Bora conversar?
        </h2>
        <p className="mt-4 max-w-md text-lg text-pretty text-(--muted)">
          Uma ideia, um projeto, uma vaga ou só um oi. Escreve aqui que a mensagem chega direto para
          mim.
        </p>
      </div>

      {state.status === "sent" ? (
        <div className="flex flex-col items-start justify-center gap-4 rounded-3xl p-8 ring-1 ring-(--line)">
          <p className="font-display text-2xl font-extrabold tracking-tight">Recebido!</p>
          <p className="text-(--muted)">
            Valeu pela mensagem! Se você deixou um e-mail, eu respondo por lá.
          </p>
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            className="rounded-full select-none px-5 py-2.5 text-sm font-medium ring-1 ring-(--line) transition hover:ring-(--muted)"
          >
            Escrever outra
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Mensagem</span>
            <textarea
              name="message"
              required
              maxLength={4000}
              rows={6}
              placeholder="Oi, Rafael! Eu queria falar sobre…"
              className="resize-y rounded-2xl bg-transparent px-4 py-3 text-base ring-1 ring-(--line) outline-none placeholder:text-(--muted)/70 focus:ring-2 focus:ring-(--fg)"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Seu e-mail{" "}
              <span className="font-normal text-(--muted)">(para eu poder responder)</span>
            </span>
            <input
              name="contact"
              type="email"
              maxLength={200}
              autoComplete="email"
              placeholder="voce@exemplo.com"
              className="rounded-2xl bg-transparent px-4 py-3 text-base ring-1 ring-(--line) outline-none placeholder:text-(--muted)/70 focus:ring-2 focus:ring-(--fg)"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={state.status === "sending"}
              className="rounded-full select-none bg-(--fg) px-6 py-3 text-sm font-medium text-(--bg) transition hover:opacity-85 disabled:opacity-60"
            >
              {state.status === "sending" ? "Enviando…" : "Enviar mensagem"}
            </button>
            <p role="status" className="text-sm text-red-600 dark:text-red-400">
              {state.status === "error" ? state.message : ""}
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
