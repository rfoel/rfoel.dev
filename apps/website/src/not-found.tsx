import { Layout } from "./blog/pages.tsx";

// A página de qualquer endereço que não existe (sst.config.ts: errorPage), com status 404
export function NotFound() {
  return (
    <Layout>
      <main className="flex min-h-[60vh] flex-col justify-center pt-10">
        <p className="font-mono text-sm text-(--muted)">Erro 404</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] font-extrabold tracking-tight sm:text-8xl">
          Sumiu sem deixar rastro.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-pretty text-(--muted)">
          Essa página não existe, ou mudou de lugar. Tenta começar de novo pelo início ou pelo blog.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/"
            className="rounded-full select-none bg-(--fg) px-5 py-2.5 text-sm font-medium text-(--bg) transition hover:opacity-85"
          >
            Voltar ao início
          </a>
          <a
            href="/blog/"
            className="rounded-full select-none px-5 py-2.5 text-sm font-medium ring-1 ring-(--line) transition hover:ring-(--muted)"
          >
            Ver o blog
          </a>
        </div>
      </main>
    </Layout>
  );
}
