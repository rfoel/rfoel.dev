import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./app.tsx";
import { postHtml } from "./blog/bodies.ts";
import { BlogIndex, PostPage } from "./blog/pages.tsx";
import { POSTS } from "./blog/posts.ts";
import { PROJECTS } from "./blog/types.ts";
import { NotFound } from "./not-found.tsx";

// Render das páginas no build (ver prerender.mjs), para o conteúdo já vir no HTML:
// aparece antes do JavaScript e chega a robôs que não rodam JavaScript.
// A home é hidratada no navegador (main.tsx); as páginas do blog ficam só em HTML.
export { POSTS, PROJECTS };
export { formatDate } from "./blog/types.ts";

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export const renderBlogIndex = (): string => renderToString(<BlogIndex />);

export const renderNotFound = (): string => renderToString(<NotFound />);

export function renderPost(slug: string): string {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Post desconhecido: ${slug}`);
  return renderToString(<PostPage post={post} html={postHtml(slug)} />);
}
