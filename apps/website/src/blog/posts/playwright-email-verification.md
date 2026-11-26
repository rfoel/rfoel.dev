Para testar um cadastro que manda um código ou um link por email, o teste precisa de uma caixa de entrada de verdade, que ele consiga ler. Com o pacote `saci.cc` do npm, o teste cria um endereço, faz o cadastro com ele, espera o email e recebe o código ou o link como uma string. Basta uma chave de API grátis e poucas linhas de código, e funciona do mesmo jeito no Playwright, no Cypress ou em qualquer script Node.

## Por que uma caixa de verdade

Um atalho comum é trocar o envio de email por um mock nos testes. Isso prova que o seu código chama o serviço de envio, mas não que o email sai, chega numa caixa e traz um código que funciona. Uma caixa de verdade fecha esse buraco: o teste faz exatamente o que o usuário faz, do formulário ao código.

## Pegue uma chave de API

A API pede uma chave, e a chave é grátis:

- Abra a [página da conta](https://saci.cc/account/) e entre com o GitHub. A conta do GitHub precisa ter pelo menos 30 dias.
- Crie uma chave. Ela começa com `saci_` e só aparece uma vez, então copie na hora.
- Cada conta pode ter até 5 chaves, por exemplo uma para o seu computador e outra para o CI. Dá para revogar qualquer uma.

O cliente lê a chave da variável de ambiente `SACI_API_KEY`, então ela não fica no código:

```bash
npm install --save-dev saci.cc
export SACI_API_KEY=saci_...
```

No CI, guarde a chave como secret e passe para o passo dos testes. No GitHub Actions:

```yaml
- run: npx playwright test
  env:
    SACI_API_KEY: ${{ secrets.SACI_API_KEY }}
```

## Um teste de cadastro com código de verificação

`createInbox()` cria um endereço aleatório novo. `inbox.waitForCode()` espera chegar um email com código de verificação e devolve o código:

```ts
import { test, expect } from "@playwright/test";
import { createInbox } from "saci.cc";

test("cadastro com código de verificação", async ({ page }) => {
  test.setTimeout(90_000);

  const inbox = await createInbox();
  await page.goto("https://seu-app.com/cadastro");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByLabel("Senha").fill("cavalo correto bateria grampo");
  await page.getByRole("button", { name: "Criar conta" }).click();

  const code = await inbox.waitForCode({ from: "seu-app.com" });
  await page.getByLabel("Código de verificação").fill(code);
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByText("Boas-vindas")).toBeVisible();
});
```

O filtro `from` é opcional. Ele só aceita emails cujo remetente contém esse texto, sem diferenciar maiúsculas, o que ajuda quando a caixa recebe mais de um email.

## Aumente o timeout do teste

O Playwright dá 30 segundos para cada teste, por padrão. O email costuma chegar em poucos segundos, mas um provedor lento pode demorar mais, e o cliente espera até 60 segundos antes de lançar `SaciTimeoutError`. Chame `test.setTimeout(90_000)` nos testes que esperam email, ou aumente o `timeout` na configuração do Playwright. Para mudar quanto o próprio cliente espera, passe `timeout` em milissegundos: `inbox.waitForCode({ timeout: 30_000 })`.

O cliente não fica consultando a caixa sem parar. Ele pede para a API segurar a requisição aberta até chegar um email, por até 25 segundos de cada vez, então uma espera gasta só algumas chamadas. Isso importa porque o limite é de 120 requisições por minuto por conta, somando todas as chaves. Se passar disso, o cliente espera e tenta de novo.

## Links de confirmação e outros emails

Se o seu app manda um link em vez de código, use `waitForLink`. Sem opções, ele devolve o primeiro link do email; `match` escolhe o link que contém um texto ou bate com uma RegExp:

```ts
const requestedAt = new Date();
await page.getByRole("button", { name: "Enviar link" }).click();

const link = await inbox.waitForLink({ match: "/redefinir-senha", after: requestedAt });
await page.goto(link);
```

`after` ignora os emails que já estavam na caixa, como o de boas-vindas que chegou antes no mesmo teste. Para o resto, `waitForEmail` devolve o email inteiro, com `subject`, `text`, `html`, `links`, `attachments` e `verificationCode`:

```ts
const email = await inbox.waitForEmail({
  from: "cobranca@",
  subject: "Seu recibo",
  after: requestedAt,
});
expect(email.text).toContain("Total");
```

## Cypress

Os testes do Cypress rodam no navegador, então chame o cliente pelo Node, com tasks no `cypress.config.ts`:

```ts
import { defineConfig } from "cypress";
import { Saci } from "saci.cc";

const saci = new Saci();

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on("task", {
        createInbox: async () => (await saci.createInbox()).address,
        waitForCode: (address: string) => saci.inbox(address).waitForCode(),
      });
    },
  },
});
```

No teste, chame `cy.task("waitForCode", address, { timeout: 90_000 })`. Sem essa opção, o `cy.task` desiste depois de 60 segundos.

## As suas caixas são privadas

As caixas criadas no site do saci.cc são públicas: quem souber o endereço consegue ler. As caixas criadas com a sua chave são diferentes. Por 7 dias elas ficam com a sua conta: só as chaves da sua conta conseguem ler, e ninguém mais consegue criar um endereço com o mesmo nome. É isso que você quer nos testes, em que os emails muitas vezes trazem links que fazem login.

Para um endereço fixo, passe um nome: `createInbox({ name: "teste-cadastro" })` cria `teste-cadastro@saci.cc`. Se outra conta já tiver esse nome, vem um `SaciError` com status 409. Os emails continuam sendo apagados cerca de um dia depois de chegar, então não conte com eles de uma execução para outra.

## Webhooks em vez de esperar

Se preferir ser avisado quando um email chega, configure um webhook na [página da conta](https://saci.cc/account/). Cada email que chega numa caixa da sua conta é enviado para a sua URL num POST, com o endereço, o remetente, o assunto, os links e o código de verificação, assinado com um segredo para você conferir que veio do saci.cc. A URL precisa ser HTTPS e pública, então localhost não serve; para testes na sua máquina, esperar com o cliente é mais simples. A [documentação da API](https://saci.cc/docs/#webhooks) mostra o formato e como conferir a assinatura em Node.

## Resumindo

- Crie uma chave grátis na [página da conta](https://saci.cc/account/) e coloque em `SACI_API_KEY`, na sua máquina e como secret no CI.
- Chame `createInbox()`, faça o cadastro com `inbox.address` e depois `waitForCode()` ou `waitForLink()`.
- Dê 90 segundos aos testes que esperam email.
- Dúvidas, problemas ou um limite maior: escreva para oi@saci.cc.
