Um teste que espera um email de verificação roda na sua máquina sem drama. No CI aparecem perguntas novas: onde fica a chave, o que acontece em PRs de forks, quantos testes podem esperar email ao mesmo tempo e o que fazer quando um falha. Este guia responde cada uma, com o GitHub Actions, o Playwright e o pacote `saci.cc` do npm.

Se você ainda não tem um teste assim, comece pelo [guia do Playwright](/blog/playwright-email-verification/).

## A chave como secret

Crie uma chave na [página da conta](https://saci.cc/account/), só para o CI. Uma chave por ambiente (a sua máquina, o CI, o staging) deixa você revogar uma sem parar as outras.

No repositório, abra **Settings → Secrets and variables → Actions** e crie o secret `SACI_API_KEY`. O cliente lê dessa variável, então basta passá-la ao passo dos testes:

```yaml
# .github/workflows/e2e.yml
name: e2e
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          SACI_API_KEY: ${{ secrets.SACI_API_KEY }}
```

## PRs de forks e do Dependabot não têm o secret

O GitHub não passa secrets para workflows disparados por um pull request vindo de um fork, nem para os PRs do Dependabot. Nesses casos `SACI_API_KEY` chega vazia e todo teste que cria uma caixa falha. Pule esses testes quando não houver chave, em vez de deixar o PR vermelho:

```ts
import { test } from "@playwright/test";

test.skip(!process.env.SACI_API_KEY, "Sem SACI_API_KEY (PR de fork?)");
```

Coloque essa linha no topo dos arquivos que esperam email. Os outros testes continuam rodando, e os de email rodam de novo quando o PR é mesclado.

## Uma caixa por teste

Em paralelo, dois testes que usam a mesma caixa leem o email um do outro. Crie a caixa dentro do teste, com `createInbox()` sem nome, e cada teste, cada worker e cada retry ganha um endereço novo. Nomes fixos, como `createInbox({ name: "cadastro" })`, só servem para testes que nunca rodam ao mesmo tempo.

Se a mesma caixa for usada em vários passos, uma fixture deixa o teste limpo:

```ts
import { test as base } from "@playwright/test";
import { createInbox, type Inbox } from "saci.cc";

export const test = base.extend<{ inbox: Inbox }>({
  inbox: async ({}, use, testInfo) => {
    const inbox = await createInbox();
    // O endereço aparece no relatório, para investigar uma falha
    testInfo.annotations.push({ type: "inbox", description: inbox.address });
    await use(inbox);
  },
});
```

## Shards e workers em paralelo

O Playwright divide a suíte entre máquinas com `--shard`. Com uma matrix, quatro jobs rodam ao mesmo tempo:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]
steps:
  # ...os mesmos passos de antes...
  - run: npx playwright test --shard=${{ matrix.shard }}
    env:
      SACI_API_KEY: ${{ secrets.SACI_API_KEY }}
```

Todas as chaves da conta dividem o mesmo limite de requisições por minuto: 120 no Free, 600 no Pro e 2.000 no Team. Esperar um email gasta pouco, porque o cliente pede para a API segurar a requisição até 25 segundos, então cada teste esperando gasta umas 3 requisições por minuto. Na prática, umas 30 esperas ao mesmo tempo cabem no Free. Se passar do limite, a API responde 429 e o cliente espera e tenta de novo, então o teste fica mais lento, mas não quebra.

## Quantas caixas a suíte cria por mês

No Free, as chaves de uma conta criam até 1.000 caixas por mês. Faça a conta: 20 testes com email rodando em 10 pushes por dia, 22 dias úteis, dão 4.400 caixas, e a partir da milésima criar uma caixa responde 402 até o mês virar. Se a sua conta passar disso, os [planos Pro e Team](https://saci.cc/pricing/) não têm limite de caixas. Antes de assinar, dá para economizar:

- Rode os testes de email só em `pull_request` e no branch principal, não em todo push.
- Junte cadastro, confirmação e login num teste só, com uma caixa.
- Separe os testes de email com uma tag (`@email`) e rode com `--grep @email` num job que não roda a cada commit.

## Timeouts e retries

O Playwright dá 30 segundos por teste, e um email pode levar mais. Use `test.setTimeout(90_000)` nos testes que esperam email. O cliente espera até 60 segundos por padrão e então lança `SaciTimeoutError`, com uma mensagem que diz o que ele esperava.

No CI, ligue retries na configuração do Playwright:

```ts
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html"]] : "list",
});
```

Como a caixa nasce dentro do teste, cada retry começa com uma caixa vazia e não lê o email da tentativa anterior.

## Quando um teste falha

O endereço anotado pela fixture aparece no relatório HTML. As caixas criadas com a sua chave ficam com a sua conta por 7 dias no Free (30 no Pro, 90 no Team), e os emails ficam cerca de um dia. Então dá para abrir o email logo depois da falha e ver se ele chegou com outro assunto, de outro remetente ou sem o código:

```bash
curl "https://saci.cc/api/addresses/ENDERECO/emails" \
  -H "Authorization: Bearer $SACI_API_KEY"
```

## Resumindo

- `SACI_API_KEY` como secret, uma chave só para o CI.
- `test.skip` quando a chave não existe, para PRs de forks e do Dependabot.
- Uma caixa por teste, criada dentro dele, e o endereço anotado no relatório.
- Timeout de 90 segundos, retries no CI e atenção ao número de caixas por mês.
