import type { CSSProperties } from "react";
import { PostList } from "./blog/pages.tsx";
import { POSTS } from "./blog/posts.ts";
import { Contact } from "./contact.tsx";
import { Monogram } from "./monogram.tsx";
import { track } from "./pegada.ts";
import { type Project, projects } from "./projects.ts";
import { Rotator } from "./rotator.tsx";

// Para o evento projeto_aberto: para onde o link leva
const destination = (href: string) =>
  href.includes("github.com") ? "github" : href.includes("npmjs.com") ? "npm" : "site";

export function App() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <section className="grid items-center gap-8 pt-16 pb-16 sm:pt-24 lg:min-h-[88vh] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12 lg:py-12">
        <div>
          <p className="font-mono text-sm text-(--muted)">Oi, eu sou</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.9] font-extrabold tracking-tight sm:text-8xl">
            Rafael Franco
          </h1>
          <p className="mt-8 text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
            Eu faço software <br />
            <Rotator
              phrases={[
                "que dá gosto de usar.",
                "do pixel ao servidor.",
                "que conversa com IA.",
                "que cabe no bolso.",
                "só pra ver se dá certo.",
              ]}
            />
          </p>
          <p className="mt-6 max-w-xl text-lg text-pretty text-(--muted)">
            Interface, código e infraestrutura: gosto de cuidar de tudo, e de ver gente usando no
            fim. Aqui embaixo tem uma amostra.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#projetos"
              className="rounded-full bg-(--fg) px-5 py-2.5 text-sm font-medium text-(--bg) transition hover:opacity-85"
            >
              Ver trabalhos ↓
            </a>
            <a
              href="#contato"
              className="rounded-full px-5 py-2.5 text-sm font-medium ring-1 ring-(--line) transition hover:ring-(--muted)"
            >
              Contato
            </a>
            <a
              href="/blog/"
              className="rounded-full px-5 py-2.5 text-sm font-medium ring-1 ring-(--line) transition hover:ring-(--muted)"
            >
              Blog
            </a>
            <a
              href="https://github.com/rfoel"
              onClick={() => track("github_aberto", { origem: "topo" })}
              className="rounded-full px-5 py-2.5 text-sm font-medium ring-1 ring-(--line) transition hover:ring-(--muted)"
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[460px] lg:max-w-none">
          <Monogram className="w-full" />
        </div>
      </section>

      <div className="mb-8 flex items-end justify-between gap-6 border-t border-(--line) pt-10">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Uma amostra
        </h2>
        <p className="hidden max-w-xs text-right text-sm text-(--muted) sm:block">
          Projetos que eu criei sozinho e que estão no ar. Dá para abrir e usar.
        </p>
      </div>

      <main id="projetos" className="flex scroll-mt-6 flex-col gap-6 pb-24 sm:gap-8">
        {projects.map((project, index) => (
          <ProjectPanel key={project.slug} project={project} index={index} />
        ))}
      </main>

      <section className="border-t border-(--line) py-16 sm:py-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Do blog
          </h2>
          <a href="/blog/" className="text-sm font-medium text-(--muted) hover:text-(--fg)">
            Todos os posts →
          </a>
        </div>
        <PostList posts={POSTS.slice(0, 3)} />
      </section>

      <Contact />

      <footer className="flex flex-col gap-2 border-t border-(--line) py-8 text-sm text-(--muted) sm:flex-row sm:justify-between">
        <span suppressHydrationWarning>© {new Date().getFullYear()} Rafael Franco</span>
        <a
          href="https://github.com/rfoel"
          onClick={() => track("github_aberto", { origem: "rodape" })}
          className="hover:text-(--fg)"
        >
          github.com/rfoel
        </a>
      </footer>
    </div>
  );
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  const { theme } = project;
  const style = {
    "--p-bg": theme.bg,
    "--p-fg": theme.fg,
    "--p-muted": theme.muted,
    "--p-accent": theme.accent,
    "--p-line": theme.line,
  } as CSSProperties;

  return (
    <article
      id={project.slug}
      style={style}
      className="group grid scroll-mt-6 overflow-hidden rounded-3xl bg-(--p-bg) text-(--p-fg) ring-1 ring-(--p-line) lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <div className="flex flex-col gap-6 p-6 sm:p-10">
        <div className="flex items-center gap-3 font-mono text-xs tracking-wide text-(--p-muted) uppercase">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-6 bg-(--p-line)" />
          <span>{project.kind}</span>
        </div>

        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            <a
              href={project.url}
              onClick={() => track("projeto_aberto", { projeto: project.slug, destino: "site" })}
              className="hover:text-(--p-accent)"
            >
              {project.name}
            </a>
          </h2>
          <p className="mt-2 text-lg font-medium text-pretty">{project.tagline}</p>
        </div>

        <p className="text-pretty text-(--p-muted)">{project.description}</p>

        <ul className="flex flex-col gap-2">
          {project.highlights.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-(--p-accent)" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap gap-2" aria-label="Tecnologias">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full px-3 py-1 font-mono text-xs ring-1 ring-(--p-line)"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-2">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() =>
                track("projeto_aberto", { projeto: project.slug, destino: destination(link.href) })
              }
              className="inline-flex items-center gap-1 font-medium underline decoration-(--p-accent) decoration-2 underline-offset-4 hover:text-(--p-accent)"
            >
              {link.label}
              <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      </div>

      <div className="order-first flex items-center p-4 pb-0 sm:p-8 sm:pb-0 lg:order-none lg:p-8 lg:pl-0">
        <figure className="w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 shadow-black/25 ring-(--p-line) transition duration-500 ease-out group-hover:-translate-y-1">
          <div className="flex h-7 items-center gap-1.5 border-b border-black/10 bg-neutral-100 px-3 sm:h-8">
            <span className="size-2.5 rounded-full bg-neutral-300" />
            <span className="size-2.5 rounded-full bg-neutral-300" />
            <span className="size-2.5 rounded-full bg-neutral-300" />
            <span className="mx-auto rounded-md bg-white px-3 font-mono text-[11px] text-neutral-500 ring-1 ring-black/5">
              {new URL(project.url).host}
            </span>
            <span className="w-[42px]" />
          </div>
          <img
            src={project.image.src}
            alt={project.image.alt}
            width={1200}
            height={800}
            loading={index === 0 ? "eager" : "lazy"}
            className="block w-full"
          />
        </figure>
      </div>
    </article>
  );
}
