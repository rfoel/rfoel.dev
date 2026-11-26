// Um post do blog: o que listas e cabeçalhos precisam fica em posts.ts (vai para o navegador,
// porque a home mostra os últimos posts); o texto fica em posts/<slug>.md, lido só no build.
export type ProjectId = "saci" | "kaitenmate";

export interface PostMeta {
  /** O endereço: /blog/<slug>/ */
  slug: string;
  /** "2026-11-04" */
  date: string;
  project: ProjectId;
  title: string;
  description: string;
  /** Onde o post saiu primeiro (vira o canonical da página) */
  original: string;
}

export const PROJECTS: Record<ProjectId, { name: string; color: string; blog: string }> = {
  saci: { name: "saci.cc", color: "#16a34a", blog: "no blog do saci.cc" },
  kaitenmate: { name: "Kaitenmate", color: "#c8452f", blog: "no blog do Kaitenmate" },
};

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

// Sem Intl de propósito: o servidor do build e o navegador formatam igual (hidratação da home)
export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}
