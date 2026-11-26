// Gera o site pronto a partir do render do build (src/entry-server.tsx), igual ao saci.cc.
// Roda depois de `vp build` e `vp build --ssr`: a home (hidratada no navegador), o blog e a 404
// em HTML, a og-image de cada post (og.mjs), o RSS, o sitemap e o robots.txt.
// O CloudFront do SST completa /blog/x e /blog/x/ com /blog/x/index.html.
import fs from "node:fs";
import path from "node:path";
import { postOgImage } from "./og.mjs";

const SSR_DIR = "dist-ssr";
const DIST = "dist";
const SITE = "https://rfoel.dev";
const ROOT = '<div id="root"></div>';
const ssr = await import(`./${SSR_DIR}/entry-server.js`);
const { POSTS, PROJECTS } = ssr;

const esc = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

// Pré-carrega as fontes do primeiro desenho (latin): o título na Bricolage e o texto na Geist
function withFontPreloads(html) {
  const fonts = fs
    .readdirSync(`${DIST}/assets`)
    .filter((f) => /^(bricolage-grotesque-latin-opsz|geist-latin-wght)-normal-.*\.woff2$/.test(f));
  if (fonts.length !== 2)
    throw new Error(`Expected 2 fonts to preload, found: ${fonts.join(", ")}`);
  const links = fonts.map(
    (f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`,
  );
  return html.replace("</head>", `    ${links.join("\n    ")}\n  </head>`);
}

const template = withFontPreloads(fs.readFileSync(`${DIST}/index.html`, "utf8"));
if (!template.includes(ROOT)) throw new Error(`No empty root in ${DIST}/index.html`);

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`No meta ${key} in the template`);
  return html.replace(re, `$1${esc(value)}$2`);
};

// Uma página só de HTML: título, descrição, endereço e imagem próprios, sem o JavaScript da home
function page({ body, title, description, url, type = "website", published, image, noindex }) {
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/\s*<script type="module"[^>]*><\/script>/g, "")
    .replace(/\s*<link rel="modulepreload"[^>]*>/g, "")
    .replace(ROOT, `<div id="root">${body}</div>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:type", type);
  if (url) html = setMeta(html, "property", "og:url", url);
  if (image) {
    html = setMeta(html, "property", "og:image", image.url);
    html = setMeta(html, "name", "twitter:image", image.url);
    html = setMeta(html, "property", "og:image:alt", image.alt);
  }
  const extra = [];
  if (url) extra.push(`<link rel="canonical" href="${esc(url)}" />`);
  if (published) extra.push(`<meta property="article:published_time" content="${published}" />`);
  if (noindex) extra.push(`<meta name="robots" content="noindex" />`);
  return html.replace("</head>", `    ${extra.join("\n    ")}\n  </head>`);
}

function write(file, content) {
  fs.mkdirSync(path.dirname(path.join(DIST, file)), { recursive: true });
  fs.writeFileSync(path.join(DIST, file), content);
  console.log(`wrote /${file}`);
}

// Home: hidratada no navegador (main.tsx)
write("index.html", template.replace(ROOT, `<div id="root">${ssr.render()}</div>`));

write(
  "404.html",
  page({
    body: ssr.renderNotFound(),
    title: "Página não encontrada — Rafael Franco",
    description: "Essa página não existe, ou mudou de lugar.",
    noindex: true,
  }),
);

write(
  "blog/index.html",
  page({
    body: ssr.renderBlogIndex(),
    title: "Blog — Rafael Franco",
    description:
      "O que Rafael Franco anda aprendendo construindo o saci.cc, o Kaitenmate e outros projetos.",
    url: `${SITE}/blog/`,
  }),
);

for (const post of POSTS) {
  const project = PROJECTS[post.project];
  write(
    `blog/${post.slug}/og.png`,
    await postOgImage({ title: post.title, project, date: ssr.formatDate(post.date) }),
  );
  write(
    `blog/${post.slug}/index.html`,
    page({
      body: ssr.renderPost(post.slug),
      title: `${post.title} — Rafael Franco`,
      description: post.description,
      url: `${SITE}/blog/${post.slug}/`,
      type: "article",
      published: post.date,
      image: { url: `${SITE}/blog/${post.slug}/og.png`, alt: `${post.title} (${project.name})` },
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
write(
  "blog/feed.xml",
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

// Sitemap: a home, o blog e os posts (a data do post mais novo vale para a home e o blog)
const urls = [
  { loc: `${SITE}/`, lastmod: POSTS[0].date },
  { loc: `${SITE}/blog/`, lastmod: POSTS[0].date },
  ...POSTS.map((p) => ({ loc: `${SITE}/blog/${p.slug}/`, lastmod: p.date })),
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}
</urlset>
`,
);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

fs.rmSync(SSR_DIR, { recursive: true, force: true });
