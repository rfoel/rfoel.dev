// og-image de cada post do blog (1200×630), gerada no build pelo prerender.mjs: o satori monta o
// SVG a partir de uma árvore de elementos e o resvg transforma em PNG. Sem navegador.
// As fontes são as mesmas do site, em .woff estático (o satori não lê .woff2 nem fonte variável).
import fs from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const font = (pkg, file) => fs.readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`);
const FONTS = [
  {
    name: "Bricolage",
    data: font("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"),
    weight: 800,
  },
  { name: "Geist", data: font("geist", "geist-latin-500-normal.woff"), weight: 500 },
  { name: "Geist Mono", data: font("geist-mono", "geist-mono-latin-400-normal.woff"), weight: 400 },
];

const INK = "#0c0a09";
const MUTED = "#57534e";
const BG = "#fafaf9";

// Árvore no formato que o satori entende (o mesmo de um elemento do React)
const h = (type, style, ...children) => ({
  type,
  props: {
    style: { display: "flex", ...style },
    children: children.length === 1 ? children[0] : children,
  },
});

// Títulos longos descem de tamanho para caber em até 4 linhas
const titleSize = (title) => (title.length <= 40 ? 84 : title.length <= 64 ? 72 : 60);

export async function postOgImage({ title, project, date }) {
  const tree = h(
    "div",
    { width: 1200, height: 630, background: BG, flexDirection: "column" },
    // faixa na cor do projeto
    h("div", { height: 14, background: project.color }),
    h(
      "div",
      {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px 60px",
      },
      h(
        "div",
        { alignItems: "center", gap: 16, fontFamily: "Geist Mono", fontSize: 26, color: MUTED },
        h("div", { width: 16, height: 16, borderRadius: 8, background: project.color }),
        `${project.name}  ·  ${date}`,
      ),
      h(
        "div",
        {
          fontFamily: "Bricolage",
          fontSize: titleSize(title),
          lineHeight: 1.04,
          letterSpacing: -1.5,
          color: INK,
          maxWidth: 1040,
        },
        title,
      ),
      h(
        "div",
        { justifyContent: "space-between", alignItems: "flex-end" },
        h(
          "div",
          { fontFamily: "Bricolage", fontSize: 36, color: INK, letterSpacing: -0.5 },
          "Rafael Franco",
        ),
        h("div", { fontFamily: "Geist Mono", fontSize: 26, color: MUTED }, "rfoel.dev/blog"),
      ),
    ),
  );
  const svg = await satori(tree, { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
