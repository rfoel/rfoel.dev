export type Project = {
  slug: string;
  name: string;
  kind: string;
  url: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  links: { label: string; href: string }[];
  image: { src: string; alt: string };
  /** Cores da marca de cada projeto: o painel usa as cores dele, não as do portfolio. */
  theme: { bg: string; fg: string; muted: string; accent: string; line: string };
};

export const projects: Project[] = [
  {
    slug: "saci",
    name: "saci.cc",
    kind: "Ferramenta para devs",
    url: "https://saci.cc",
    tagline: "Email temporário que aparece rápido e some sem deixar rastro.",
    description:
      "Crie uma caixa em um clique e receba o email na hora; em um dia ele some. Para quem testa software, um cliente npm espera o código de verificação dentro do Playwright ou do Cypress, e a mesma caixa está disponível pela API, por webhooks e por MCP.",
    highlights: [
      "Pacote npm para testes end-to-end",
      "Extensão para Chrome e Firefox",
      "Servidor MCP e planos pagos com Stripe",
    ],
    stack: ["SES", "S3", "Lambda", "DynamoDB", "React"],
    links: [
      { label: "saci.cc", href: "https://saci.cc" },
      { label: "npm", href: "https://www.npmjs.com/package/saci.cc" },
    ],
    image: {
      src: "/projects/saci.jpg",
      alt: "Página inicial do saci.cc: “Email temporário, grátis e sem cadastro”, com folhas sobre fundo verde e o botão vermelho “Criar email”.",
    },
    theme: {
      bg: "#0f3b2b",
      fg: "#faf6ea",
      muted: "#b9c9bd",
      accent: "#f5cd47",
      line: "#ffffff26",
    },
  },
  {
    slug: "kaitenmate",
    name: "Kaitenmate",
    kind: "Jogo",
    url: "https://kaitenmate.com",
    tagline: "Xadrez numa esteira de sushi.",
    description:
      "Cada metade do tabuleiro é uma esteira que empurra as peças para o centro, peças novas chegam por uma fila, tipo Tetris, e cada captura vira um pratinho na sua conta. Dá para jogar contra o robô, online com um amigo, ou deixar o seu agente de IA jogar pela API.",
    highlights: [
      "Tabuleiro 3D no navegador",
      "Partidas online em tempo real",
      "Motor determinístico: toda partida vira replay",
    ],
    stack: ["Three.js", "WebSocket", "Lambda", "DynamoDB", "SES"],
    links: [{ label: "kaitenmate.com", href: "https://kaitenmate.com" }],
    image: {
      src: "/projects/kaitenmate.jpg",
      alt: "Tabuleiro 3D do Kaitenmate no começo de uma partida: a faixa do meio é a esteira vermelha, cada peça está num pratinho e há sushis e hashis em volta.",
    },
    theme: {
      bg: "#ecd3a8",
      fg: "#2f2420",
      muted: "#6e5847",
      accent: "#c8452f",
      line: "#2f242026",
    },
  },
  {
    slug: "pegada",
    name: "Pegada",
    kind: "Analytics",
    url: "https://pegada.dev",
    tagline: "A história de cada visita, contada pelo seu assistente de IA.",
    description:
      "Analytics sem cookies e sem guardar IP, para quem tem vários projetos pequenos. Uma linha instala no site, um SDK manda eventos do servidor, e funis e retenção respondem em português pelo MCP. Nada fica ligado quando ninguém usa.",
    highlights: [
      "Visitante anônimo: hash com sal por site",
      "Eventos com propriedades livres, funis e retenção",
      "MCP com login pelo navegador (OAuth)",
    ],
    stack: ["Lambda", "DynamoDB", "CloudFront", "React", "MCP"],
    links: [{ label: "pegada.dev", href: "https://pegada.dev" }],
    image: {
      src: "/projects/pegada.jpg",
      alt: "Conversa no site da Pegada: alguém pergunta por que as pessoas saem na página de preços e a Pegada responde que no celular são 74% e no computador 41%, com um gráfico de barras.",
    },
    theme: {
      bg: "#f4f3ee",
      fg: "#18181b",
      muted: "#5f5f66",
      accent: "#2f45f5",
      line: "#18181b1f",
    },
  },
  {
    slug: "run",
    name: "run",
    kind: "Projeto pessoal",
    url: "https://run.rfoel.dev",
    tagline: "Toda corrida. Todo km.",
    description:
      "Meu diário de corridas e treinador. Cada corrida chega do Garmin com rota, ritmo e frequência cardíaca, e o Claude analisa o treino. Pelo MCP, o Claude também monta o plano, que volta para o relógio como treino estruturado.",
    highlights: [
      "Análise de cada corrida com o Claude",
      "Plano de treino enviado ao Garmin",
      "App iOS com widget",
    ],
    stack: ["Hono", "Lambda", "DynamoDB", "Leaflet", "SwiftUI"],
    links: [
      { label: "run.rfoel.dev", href: "https://run.rfoel.dev" },
      { label: "GitHub", href: "https://github.com/rfoel/run" },
    ],
    image: {
      src: "/projects/run.jpg",
      alt: "Calendário do run em novembro de 2026: cada dia mostra o tipo de treino (tiro, tempo, leve, prova), a distância, o ritmo e o traçado da corrida.",
    },
    theme: {
      bg: "#0a0a0a",
      fg: "#fafafa",
      muted: "#a3a3a3",
      accent: "#d9ff1f",
      line: "#ffffff21",
    },
  },
];
