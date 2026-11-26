import { Marked } from "marked";

// Só o build importa este arquivo (entry-server.tsx): o texto dos posts não vai para o navegador.
const FILES = import.meta.glob<string>("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const marked = new Marked({ gfm: true });

// Tabelas largas rolam de lado em vez de esticar a página
const wrapTables = (html: string) =>
  html
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, "</table></div>");

export function postHtml(slug: string): string {
  const markdown = FILES[`./posts/${slug}.md`];
  if (markdown === undefined) throw new Error(`Post sem texto: posts/${slug}.md`);
  return wrapTables(marked.parse(markdown, { async: false }));
}
