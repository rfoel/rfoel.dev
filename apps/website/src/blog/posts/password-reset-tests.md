A recuperação de senha é um dos fluxos mais importantes de um app e um dos menos testados. Quando quebra, o usuário fica trancado para fora e só descobre quando precisa. O motivo de ficar sem teste é quase sempre o mesmo: o passo do meio acontece numa caixa de email. Com uma caixa de verdade que o teste consegue ler, o fluxo inteiro vira um teste comum.

Este guia usa o Playwright e o pacote `saci.cc` do npm, mas as ideias valem para qualquer ferramenta.

## O que vale testar

Não basta ver o email chegar. Um teste de recuperação de senha que pega problemas reais confere:

- **O link chega e abre a página certa**, no domínio certo e com HTTPS.
- **A senha nova funciona e a antiga não.**
- **O link só funciona uma vez.** Um link reutilizável é uma falha de segurança.
- **Um email sem conta não revela nada.** A tela diz a mesma coisa para quem tem e para quem não tem conta, e nenhum email sai.
- **O email não traz a senha**, nem a antiga nem a nova.

## Prepare a chave e a caixa

Crie uma chave grátis na [página da conta](https://saci.cc/account/) e coloque na variável `SACI_API_KEY`. No CI, guarde como secret. Depois instale o cliente:

```bash
npm install --save-dev saci.cc
```

Cada teste cria a própria caixa com `createInbox()`. Assim os testes não se atrapalham, mesmo rodando em paralelo. As caixas criadas com a sua chave são privadas: só a sua conta lê os emails, o que importa aqui, porque um link de recuperação dá acesso à conta.

## O teste completo

O teste cria uma conta com o endereço da caixa, pede um link de recuperação, abre o link, troca a senha e entra com a senha nova:

```ts
import { test, expect } from "@playwright/test";
import { createInbox } from "saci.cc";

test("recupera a senha pelo email", async ({ page }) => {
  test.setTimeout(90_000);
  const inbox = await createInbox();
  await signUp(page, inbox.address, "senha-antiga-123"); // o seu cadastro

  const requestedAt = new Date();
  await page.goto("/esqueci-a-senha");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByRole("button", { name: "Enviar link" }).click();

  const link = await inbox.waitForLink({ match: "/redefinir-senha", after: requestedAt });
  expect(link).toMatch(/^https:\/\/seu-app\.com\//);

  await page.goto(link);
  await page.getByLabel("Nova senha").fill("senha-nova-456");
  await page.getByRole("button", { name: "Salvar" }).click();

  await logIn(page, inbox.address, "senha-nova-456");
  await expect(page.getByText("Minha conta")).toBeVisible();
});
```

Dois detalhes fazem diferença:

- `after: requestedAt` ignora os emails que já estavam na caixa. Sem isso, o email de boas-vindas do cadastro poderia ser lido no lugar do email de recuperação.
- `match` escolhe o link certo. Emails de recuperação costumam ter outros links, como o logo, a central de ajuda ou o descadastro.

## O link só funciona uma vez

Depois de trocar a senha, abra o mesmo link de novo. O app deve recusar:

```ts
await page.goto(link);
await expect(page.getByText("Este link expirou")).toBeVisible();
```

No mesmo teste, confira também que a senha antiga parou de funcionar. É comum o app gravar a senha nova sem invalidar as sessões e os tokens antigos.

## Email sem conta: a mesma resposta, nenhum email

Se a tela disser "não encontramos essa conta", qualquer um descobre quem é cliente. A resposta precisa ser igual nos dois casos. Para provar que nenhum email saiu, espere um pouco e confira que nada chegou:

```ts
import { createInbox, SaciTimeoutError } from "saci.cc";

test("não revela se o email tem conta", async ({ page }) => {
  test.setTimeout(60_000);
  const inbox = await createInbox(); // ninguém se cadastrou com ele

  await page.goto("/esqueci-a-senha");
  await page.getByLabel("Email").fill(inbox.address);
  await page.getByRole("button", { name: "Enviar link" }).click();
  await expect(page.getByText("Se houver uma conta, enviamos um link")).toBeVisible();

  await expect(inbox.waitForEmail({ timeout: 20_000 })).rejects.toBeInstanceOf(SaciTimeoutError);
});
```

Vinte segundos bastam para a maioria dos provedores de envio. O teste fica um pouco mais lento, então vale rodá-lo só no CI, e não a cada alteração local.

## Confira o conteúdo do email

`waitForEmail` devolve o email inteiro, com o texto, o HTML e todos os links. Use isso para pegar regressões no próprio email:

```ts
const email = await inbox.waitForEmail({ subject: "Redefina sua senha", after: requestedAt });
expect(email.text).not.toContain("senha-antiga-123");
expect(email.links.every((url) => url.startsWith("https://"))).toBe(true);
expect(email.verificationLink).toContain("/redefinir-senha");
```

`verificationLink` é o link que o saci.cc reconheceu como o de confirmar o endereço, entrar ou redefinir a senha. Ele ajuda quando o seu app muda o caminho do link e você não quer quebrar o teste.

## No Cypress

O Cypress roda os testes no navegador, então o cliente fica numa task no `cypress.config.ts`:

```ts
on("task", {
  createInbox: async () => (await saci.createInbox()).address,
  waitForResetLink: ({ address, after }: { address: string; after: string }) =>
    saci.inbox(address).waitForLink({ match: "/redefinir-senha", after }),
});
```

Passe `after` como texto ISO (`new Date().toISOString()`), porque as tasks só recebem valores serializáveis, e chame com `{ timeout: 90_000 }` no `cy.task`.

## Resumindo

- Uma caixa por teste, criada com `createInbox()` e a sua chave.
- `waitForLink({ match, after })` pega o link certo e ignora os emails antigos.
- Teste também o que não pode acontecer: link reutilizado, senha antiga aceita, email para quem não tem conta.
- Para o resto do fluxo de cadastro, veja o [guia do Playwright](/blog/playwright-email-verification/).
