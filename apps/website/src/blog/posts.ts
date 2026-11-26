// Gerado a partir dos blogs do saci.cc e do Kaitenmate. Datas: cada post sai depois do recurso
// que apresenta e dos posts que linka. O texto de cada post fica em posts/<slug>.md, lido só no build.
import type { PostMeta } from "./types.ts";

// Mais novo primeiro; no mesmo dia, vale a ordem da lista
export const POSTS: PostMeta[] = [
  {
    slug: "deploy-github-actions-oidc",
    date: "2026-11-26",
    project: "rfoel",
    title: "Deploy na AWS pelo GitHub Actions com OIDC, sem nenhuma chave",
    description:
      "Passo a passo para o GitHub Actions fazer deploy na AWS sem access key: o provedor OIDC, o papel que só confia no environment de produção, o sujeito imutável e o workflow. Com exemplos em SST.",
  },
  {
    slug: "fairer-conveyor",
    date: "2026-11-26",
    project: "kaitenmate",
    title: "A esteira favorecia as brancas, e quem percebeu primeiro foi um agente de IA",
    description:
      "Um agente de IA que jogava Kaitenmate desconfiou que a esteira dava vantagem às brancas. 3.000 partidas de robô contra robô deram razão a ele e escolheram a regra nova.",
    original: "https://kaitenmate.com/blog/pt/fairer-conveyor",
  },
  {
    slug: "otp-token",
    date: "2026-11-25",
    project: "saci",
    title: "O header OTP-Token: o código de verificação sem adivinhação",
    description:
      "O que é o header OTP-Token, proposto pelo Google no IETF, como mandar ele nos emails do seu app e como seus testes e agentes leem o código e o site dele no saci.cc.",
    original: "https://saci.cc/blog/otp-token/",
  },
  {
    slug: "invite-emails",
    date: "2026-11-24",
    project: "saci",
    title: "Como testar convites por email de ponta a ponta",
    description:
      "Teste o convite para um time com emails de verdade: o convite chega, o link cria a conta no time certo, só funciona uma vez e não serve para outra pessoa.",
    original: "https://saci.cc/blog/invite-emails/",
  },
  {
    slug: "agent-qa",
    date: "2026-11-23",
    project: "saci",
    title: "Claude Code testando o cadastro do seu app, com email",
    description:
      "Com o MCP do Playwright e o do saci.cc, o Claude Code faz o cadastro, lê o código, confere os emails e depois escreve o teste de regressão. Configuração e prompts.",
    original: "https://saci.cc/blog/agent-qa/",
  },
  {
    slug: "webhooks",
    date: "2026-11-23",
    project: "saci",
    title: "Webhooks do saci.cc: receba cada email num POST",
    description:
      "Quando usar webhook e quando esperar com a API, como conferir a assinatura Saci-Signature e um exemplo que manda o código de verificação para o Slack.",
    original: "https://saci.cc/blog/webhooks/",
  },
  {
    slug: "email-testing-tools",
    date: "2026-11-22",
    project: "saci",
    title: "Mailosaur, Mailtrap, MailSlurp ou saci.cc para testar email",
    description:
      "Comparação de ferramentas para testar email em testes automatizados: plano grátis, preço, caixas reais ou sandbox SMTP, SDK e quando cada uma faz sentido.",
    original: "https://saci.cc/blog/email-testing-tools/",
  },
  {
    slug: "cypress-email",
    date: "2026-11-22",
    project: "saci",
    title: "Verificação de email no Cypress com cy.task",
    description:
      "Como testar cadastro, código de verificação e link de confirmação no Cypress: o cliente do saci.cc roda no Node, por cy.task, e o teste recebe o código como string.",
    original: "https://saci.cc/blog/cypress-email/",
  },
  {
    slug: "selenium-puppeteer-email",
    date: "2026-11-21",
    project: "saci",
    title: "Verificação de email no Selenium e no Puppeteer",
    description:
      "Teste cadastros com código ou link de verificação no Selenium (Python) e no Puppeteer: crie uma caixa de verdade, espere o email e leia o código.",
    original: "https://saci.cc/blog/selenium-puppeteer-email/",
  },
  {
    slug: "teams",
    date: "2026-11-21",
    project: "saci",
    title: "Times no plano Team: convide até 10 pessoas",
    description:
      "Com um link de convite, até 10 pessoas dividem a mesma conta do saci.cc: o plano, os limites, o webhook e as caixas privadas. E o Team agora tem 14 dias grátis.",
    original: "https://saci.cc/blog/teams/",
  },
  {
    slug: "github-actions-email-tests",
    date: "2026-11-20",
    project: "saci",
    title: "Testes de email no GitHub Actions: secrets, shards e limites",
    description:
      "Rode testes que esperam email de verificação no GitHub Actions: a chave como secret, PRs de forks, shards em paralelo, retries e limites de requisições.",
    original: "https://saci.cc/blog/github-actions-email-tests/",
  },
  {
    slug: "plans",
    date: "2026-11-19",
    project: "saci",
    title: "Planos Pro e Team: mais limites e webhooks para o seu CI",
    description:
      "O saci.cc continua grátis. Para pipelines maiores, Pro e Team trazem mais requisições por minuto, caixas sem limite mensal, privadas por mais tempo, e webhooks.",
    original: "https://saci.cc/blog/plans/",
  },
  {
    slug: "otp-codes",
    date: "2026-11-14",
    project: "saci",
    title: "Como extrair o código de verificação de um email",
    description:
      "Por que /\\d{6}/ falha em testes de email, como encontrar o código pela palavra perto dele, e como pegar o código pronto na API, no npm e no MCP do saci.cc.",
    original: "https://saci.cc/blog/otp-codes/",
  },
  {
    slug: "agent-feedback",
    date: "2026-11-12",
    project: "saci",
    title: "Agentes de IA agora mandam feedback para o saci.cc",
    description:
      "Agentes de IA contam o que não funcionou pela API e pelo MCP, e pessoas pelo site. Uma pessoa lê e responde cada um, e o agente lê a resposta depois.",
    original: "https://saci.cc/blog/agent-feedback/",
  },
  {
    slug: "browser-extension",
    date: "2026-11-11",
    project: "saci",
    title: "Extensão do saci.cc para Chrome e Firefox",
    description:
      "Email temporário sem trocar de aba: crie um endereço, receba o email no popup, copie o código ou abra o link de confirmação e preencha formulários com o botão direito.",
    original: "https://saci.cc/blog/browser-extension/",
  },
  {
    slug: "verification-links",
    date: "2026-11-10",
    project: "saci",
    title: "Links de confirmação e de login sem abrir o email",
    description:
      "O saci.cc agora encontra o link para confirmar o email, entrar na conta ou trocar a senha e mostra um botão para abrir, no site, na extensão, na API, no MCP e no npm.",
    original: "https://saci.cc/blog/verification-links/",
  },
  {
    slug: "password-reset-tests",
    date: "2026-11-07",
    project: "saci",
    title: "Como testar a recuperação de senha de ponta a ponta",
    description:
      "Teste o fluxo de esqueci minha senha com um email de verdade: o link chega, troca a senha, só funciona uma vez e não revela quem tem conta.",
    original: "https://saci.cc/blog/password-reset-tests/",
  },
  {
    slug: "disposable-email-guide",
    date: "2026-11-06",
    project: "saci",
    title: "Email temporário: quando usar e quando não usar",
    description:
      "O que é um email temporário, quando ele protege o seu email de verdade, quando é má ideia e como o saci.cc funciona: sem cadastro, emails somem em um dia.",
    original: "https://saci.cc/blog/disposable-email-guide/",
  },
  {
    slug: "email-for-ai-agents",
    date: "2026-11-05",
    project: "saci",
    title: "Dê uma caixa de email ao seu agente de IA com MCP",
    description:
      "Conecte o servidor MCP do saci.cc ao Claude Code, Cursor ou VS Code para o agente de IA criar emails, esperar mensagens e ler códigos de verificação.",
    original: "https://saci.cc/blog/email-for-ai-agents/",
  },
  {
    slug: "playwright-email-verification",
    date: "2026-11-04",
    project: "saci",
    title: "Teste a verificação de email no Playwright com o saci.cc",
    description:
      "Teste cadastros que mandam código ou link de verificação: crie uma caixa de verdade no Playwright, espere o email e leia o código com o pacote saci.cc.",
    original: "https://saci.cc/blog/playwright-email-verification/",
  },
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);
