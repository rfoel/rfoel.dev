// Gera as páginas prontas a partir do render do build (src/entry-server.tsx), igual ao saci.cc.
// Roda depois de `vp build` e `vp build --ssr`. Cada página sai em dois arquivos, porque o
// CloudFront do SST completa /pasta/ com index.html e /pasta com .html.
import fs from "node:fs";
import path from "node:path";

const SSR_DIR = "dist-ssr";
const DIST = "dist";
const SITE = "https://rfoel.dev";
const ROOT = '<div id="root"></div>';
const { render, renderBlogIndex, renderPost, POSTS } = await import(`./${SSR_DIR}/entry-server.js`);

const template = fs.readFileSync(`${DIST}/index.html`, "utf8");
if (!template.includes(ROOT)) throw new Error(`No empty root in ${DIST}/index.html`);

const esc = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`No meta ${key} in the template`);
  return html.replace(re, `$1${esc(value)}$2`);
};

// Uma página do blog: título, descrição e endereço próprios, sem o JavaScript da home
function page({ body, title, description, url, type = "website", published }) {
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/\s*<script type="module"[^>]*><\/script>/g, "")
    .replace(/\s*<link rel="modulepreload"[^>]*>/g, "")
    .replace(ROOT, `<div id="root">${body}</div>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:type", type);
  const extra = [`<link rel="canonical" href="${esc(url)}" />`];
  if (published) extra.push(`<meta property="article:published_time" content="${published}" />`);
  return html.replace("</head>", `    ${extra.join("\n    ")}\n  </head>`);
}

function write(urlPath, html) {
  // "/blog/x/" -> dist/blog/x/index.html e dist/blog/x.html
  const dir = path.join(DIST, urlPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  fs.writeFileSync(`${dir.replace(/\/$/, "")}.html`, html);
  console.log(`prerendered ${urlPath}`);
}

// Home: hidratada no navegador (main.tsx)
fs.writeFileSync(`${DIST}/index.html`, template.replace(ROOT, `<div id="root">${render()}</div>`));
console.log("prerendered /");

write(
  "/blog/",
  page({
    body: renderBlogIndex(),
    title: "Blog — Rafael Franco",
    description:
      "O que Rafael Franco anda aprendendo construindo o saci.cc, o Kaitenmate e outros projetos.",
    url: `${SITE}/blog/`,
  }),
);

for (const post of POSTS) {
  write(
    `/blog/${post.slug}/`,
    page({
      body: renderPost(post.slug),
      title: `${post.title} — Rafael Franco`,
      description: post.description,
      url: `${SITE}/blog/${post.slug}/`,
      type: "article",
      published: post.date,
    }),
  );
}

// RSS
const rssDate = (iso) => new Date(`${iso}T12:00:00Z`).toUTCString();
const items = POSTS.map(
  (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}/</link>
      <guid>${SITE}/blog/${p.slug}/</guid>
      <pubDate>${rssDate(p.date)}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`,
).join("\n");
fs.writeFileSync(
  `${DIST}/blog/feed.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog do Rafael Franco</title>
    <link>${SITE}/blog/</link>
    <description>O que eu ando aprendendo construindo o saci.cc, o Kaitenmate e outros projetos.</description>
    <language>pt-BR</language>
${items}
  </channel>
</rss>
`,
);
console.log("wrote /blog/feed.xml");

fs.rmSync(SSR_DIR, { recursive: true, force: true });
