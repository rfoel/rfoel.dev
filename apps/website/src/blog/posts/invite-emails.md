Em todo app com times, alguém convida alguém. O convite é o primeiro contato da pessoa com o produto, e ele passa por três lugares: a tela de quem convida, uma caixa de email e o navegador de quem foi convidado. Por isso ele costuma ficar sem teste, e quebra sem ninguém ver: o email não sai, o link cai na página errada, ou a pessoa entra num time que não é o dela.

Com uma caixa de verdade que o teste consegue ler, o fluxo inteiro vira um teste comum. Este guia usa o Playwright e o pacote `saci.cc` do npm, mas as ideias valem para qualquer ferramenta.

## O que vale testar

Ver o email chegar não basta. Um bom teste de convite confere:

- **O convite chega no endereço digitado**, dizendo quem convidou e para qual time. Ninguém clica num email de um remetente que não conhece.
- **O link abre a página de aceitar** com o email já preenchido, e a conta criada por ali entra no time certo, com o papel certo.
- **O link só funciona uma vez.**
- **Um convite reenviado ou cancelado desativa o link antigo.**
- **Um convite para um endereço não serve para uma conta com outro endereço.** Esse é o que vira falha de segurança: um link encaminhado ou vazado não pode deixar um estranho entrar no time.

## Prepare a chave e as caixas

Crie uma chave grátis na [página da conta](https://saci.cc/account/), coloque na variável `SACI_API_KEY` e instale o cliente:

```bash
npm install --save-dev saci.cc
```

Cada pessoa convidada é uma caixa nova, criada com `createInbox()`. Assim cada caixa recebe um convite só, e os testes não se atrapalham rodando em paralelo. As caixas criadas com a sua chave são privadas, o que importa aqui: um link de convite dá acesso a um time.

Quem convida já está logado. No Playwright, isso costuma ser um `storageState` salvo num projeto de setup, então o `page` do teste já é a conta dona do time.

## O teste completo

Primeiro, uma função que manda o convite pela tela do app e devolve o link. Ela marca a hora antes de clicar, para ignorar emails que já estavam na caixa:

```ts
import { test, expect, type Page } from "@playwright/test";
import { createInbox, type Inbox } from "saci.cc";

async function invite(page: Page, inbox: Inbox) {
  const invitedAt = new Date();
  await page.goto("/configuracoes/time");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByRole("button", { name: "Convidar" }).click();
  return inbox.waitForEmail({ subject: "convidou você", after: invitedAt });
}
```

O teste convida um endereço novo, confere o email, abre o link num navegador sem sessão e cria a conta:

```ts
test("quem foi convidado entra no time", async ({ page, browser }) => {
  test.setTimeout(90_000);
  const inbox = await createInbox();

  const email = await invite(page, inbox);
  expect(email.text).toContain("Ana Souza"); // quem convidou
  expect(email.text).toContain("Acme"); // o time
  const link = email.links.find((url) => url.includes("/convite/"));
  expect(link).toMatch(/^https:/);

  // Outra pessoa, noutro navegador, sem login
  const guest = await (await browser.newContext()).newPage();
  await guest.goto(link!);
  await expect(guest.getByLabel("Email")).toHaveValue(inbox.address);
  await guest.getByLabel("Senha").fill("senha-do-convidado-123");
  await guest.getByRole("button", { name: "Entrar na Acme" }).click();
  await expect(guest.getByRole("heading", { name: "Acme" })).toBeVisible();

  // Quem convidou vê a pessoa no time
  await page.reload();
  await expect(page.getByRole("row", { name: inbox.address })).toContainText("Membro");
});
```

O `browser.newContext()` é o que faz o teste valer: sem ele, o link abriria com a sessão de quem convidou, e o teste passaria mesmo com o aceite quebrado.

## Escolha o link pelo caminho

O saci.cc reconhece sozinho o link de confirmar o endereço, de entrar e de redefinir a senha, e entrega no campo `verificationLink`. Um botão como "Aceitar convite" ou "Entrar no time" não é nenhum desses, então não conte com esse campo para convites. Escolha o link pelo caminho, como no teste acima, ou com `waitForLink` dentro de `invite()`:

```ts
const link = await inbox.waitForLink({ match: "/convite/", after: invitedAt });
```

Emails de convite costumam ter outros links, como o logo, a política de privacidade e "não conheço essa pessoa". Sem `match`, `waitForLink` devolve o `verificationLink` ou, sem ele, o primeiro link do email, que quase nunca é o do convite.

## O link só funciona uma vez

No fim do teste anterior, abra o mesmo link numa sessão nova. O app deve recusar:

```ts
const again = await (await browser.newContext()).newPage();
await again.goto(link!);
await expect(again.getByText("Este convite já foi usado")).toBeVisible();
```

## Reenviar e cancelar

Quando o convite é reenviado, o link antigo deveria parar de funcionar. Senão, cada reenvio deixa mais um link válido circulando:

```ts
const first = (await invite(page, inbox)).links.find((url) => url.includes("/convite/"))!;

const resentAt = new Date();
await page
  .getByRole("row", { name: inbox.address })
  .getByRole("button", { name: "Reenviar" })
  .click();
const second = await inbox.waitForLink({ match: "/convite/", after: resentAt });
expect(second).not.toBe(first);

const guest = await (await browser.newContext()).newPage();
await guest.goto(first);
await expect(guest.getByText("Este convite não é mais válido")).toBeVisible();
```

Cancelar o convite é o mesmo teste com o botão "Cancelar" e sem o segundo email.

## O convite de outra pessoa

Aqui o teste precisa de duas caixas: a de quem foi convidado e a de alguém que conseguiu o link. Essa segunda pessoa cria a própria conta e tenta usar o convite:

```ts
test("o convite só vale para o endereço convidado", async ({ page, browser }) => {
  test.setTimeout(120_000);
  const [invited, other] = await Promise.all([createInbox(), createInbox()]);

  const link = (await invite(page, invited)).links.find((url) => url.includes("/convite/"))!;

  const intruder = await (await browser.newContext()).newPage();
  await signUp(intruder, other.address, "outra-senha-456"); // o seu cadastro
  await intruder.goto(link);
  await expect(intruder.getByText("Este convite é para outro email")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("row", { name: other.address })).toHaveCount(0);
});
```

Se o seu cadastro manda código de verificação, o `signUp` usa `other.waitForCode()` no meio, como no [guia do Playwright](/blog/playwright-email-verification/).

Alguns apps convidam por um link aberto, que qualquer pessoa usa até acabarem as vagas. O convite do [plano Team do saci.cc](/blog/teams/) funciona assim. Nesse caso, o teste é outro: o link vence no prazo, para de funcionar quando o time enche e é desativado quando um novo é gerado.

## Resumindo

- Uma caixa por pessoa convidada, criada com `createInbox()` e a sua chave.
- Abra o link num `browser.newContext()`, para não aceitar com a sessão de quem convidou.
- Escolha o link pelo caminho, com `links.find` ou `waitForLink({ match })`: `verificationLink` não cobre convites.
- Teste também o que não pode acontecer: link reutilizado, link antigo depois de reenviar, convite aceito por outro endereço.
