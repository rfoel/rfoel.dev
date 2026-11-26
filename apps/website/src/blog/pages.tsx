import type { ReactNode } from "react";
import { POSTS } from "./posts.ts";
import { formatDate, PROJECTS, type PostMeta } from "./types.ts";

// Páginas do blog (e a 404): saem prontas do build (prerender.mjs) e não carregam o JavaScript do site.

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <header className="py-8">
        <a href="/" className="font-display text-xl font-extrabold tracking-tight">
          Rafael Franco
        </a>
      </header>
      {children}
      <footer className="mt-24 flex flex-col gap-2 border-t border-(--line) py-8 text-sm text-(--muted) sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Rafael Franco</span>
        <span className="flex gap-5">
          <a href="/blog/feed.xml" className="hover:text-(--fg)">
            RSS
          </a>
          <a href="https://github.com/rfoel" className="hover:text-(--fg)">
            github.com/rfoel
          </a>
        </span>
      </footer>
    </div>
  );
}

export function ProjectTag({ project }: { project: PostMeta["project"] }) {
  const { name, color } = PROJECTS[project];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-(--muted)">
      <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
      {name}
    </span>
  );
}

export function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ol className="divide-y divide-(--line) border-y border-(--line)">
      {posts.map((post) => (
        <li key={post.slug}>
          <a
            href={`/blog/${post.slug}/`}
            className="group grid gap-2 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
          >
            <span className="flex flex-col gap-1 pt-1.5">
              <time dateTime={post.date} className="font-mono text-xs text-(--muted)">
                {formatDate(post.date)}
              </time>
              <ProjectTag project={post.project} />
            </span>
            <span>
              <span className="font-display text-2xl font-extrabold tracking-tight text-balance group-hover:underline sm:text-3xl">
                {post.title}
              </span>
              <span className="mt-2 block text-pretty text-(--muted)">{post.description}</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function BlogIndex() {
  return (
    <Layout>
      <main className="pt-10 sm:pt-16">
        <h1 className="font-display text-6xl leading-[0.9] font-extrabold tracking-tight sm:text-8xl">
          Blog
        </h1>
        <p className="mt-6 mb-12 max-w-2xl text-lg text-pretty text-(--muted)">
          O que eu ando aprendendo enquanto construo o saci.cc, o Kaitenmate e o que mais aparecer:
          testes de e-mail, agentes de IA e um xadrez que anda sozinho.
        </p>
        <PostList posts={POSTS} />
      </main>
    </Layout>
  );
}

export function PostPage({ post, html }: { post: PostMeta; html: string }) {
  const index = POSTS.indexOf(post);
  const newer = POSTS[index - 1];
  const older = POSTS[index + 1];
  const project = PROJECTS[post.project];

  return (
    <Layout>
      <main className="mx-auto max-w-3xl pt-6 sm:pt-10">
        <a href="/blog/" className="text-sm text-(--muted) hover:text-(--fg)">
          ← Todos os posts
        </a>
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1">
          <time dateTime={post.date} className="font-mono text-xs text-(--muted)">
            {formatDate(post.date)}
          </time>
          <ProjectTag project={post.project} />
        </div>
        <h1 className="mt-4 font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-6 text-xl text-pretty text-(--muted)">{post.description}</p>

        <article
          className="post prose mt-12 max-w-none prose-neutral sm:prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.original ? (
          <p className="mt-16 rounded-2xl p-5 text-sm text-(--muted) ring-1 ring-(--line)">
            Publicado originalmente{" "}
            <a
              href={post.original}
              className="font-medium text-(--fg) underline decoration-2 underline-offset-4"
              style={{ textDecorationColor: project.color }}
            >
              {project.blog} ↗
            </a>
            .
          </p>
        ) : null}

        <nav className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="Outros posts">
          {older ? <Neighbor post={older} label="← Anterior" /> : <span />}
          {newer ? <Neighbor post={newer} label="Próximo →" align="right" /> : null}
        </nav>
      </main>
    </Layout>
  );
}

function Neighbor({ post, label, align }: { post: PostMeta; label: string; align?: "right" }) {
  return (
    <a
      href={`/blog/${post.slug}/`}
      className={`flex flex-col gap-2 rounded-2xl p-5 ring-1 ring-(--line) transition hover:ring-(--muted) ${align === "right" ? "sm:text-right" : ""}`}
    >
      <span className="text-xs text-(--muted)">{label}</span>
      <span className="font-display text-lg leading-snug font-extrabold tracking-tight">
        {post.title}
      </span>
    </a>
  );
}
