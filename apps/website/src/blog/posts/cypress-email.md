O Cypress roda os testes dentro do navegador, e isso muda como se lê um email: o código do teste não pode guardar a chave de API nem segurar uma requisição aberta por 25 segundos sem atrapalhar o resto. A saída é rodar o cliente do saci.cc no processo do Node que o Cypress já tem, com `cy.task`. O teste pede "crie uma caixa" e "espere o código", e recebe strings de volta.

## A chave e o pacote

Entre com o GitHub na [página da conta](https://saci.cc/account/), crie uma chave grátis e instale o cliente:

```bash
npm install --save-dev saci.cc
export SACI_API_KEY=saci_...
```

O cliente lê `SACI_API_KEY` do ambiente do processo do Cypress, não do navegador. Por isso não use `Cypress.env` para a chave: o que está lá fica visível para o código que roda na página.

## As tasks

As tasks rodam no Node, no `setupNodeEvents`:

```ts
// cypress.config.ts
import { defineConfig } from "cypress";
import { Saci } from "saci.cc";

// Lê a chave de SACI_API_KEY
const saci = new Saci();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    // Uma task pode esperar até 60 s por padrão; o email às vezes demora mais
    taskTimeout: 90_000,
    setupNodeEvents(on) {
      on("task", {
        async createInbox() {
          return (await saci.createInbox()).address;
        },
        // after: só emails recebidos depois desse momento
        waitForCode({ address, after }: { address: string; after: string }) {
          return saci.inbox(address).waitForCode({ after, timeout: 80_000 });
        },
        waitForLink({ address, after, match }: { address: string; after: string; match?: string }) {
          return saci.inbox(address).waitForLink({ after, match, timeout: 80_000 });
        },
      });
    },
  },
});
```

Dois detalhes evitam testes instáveis. O `taskTimeout` maior que o `timeout` do cliente faz o erro vir do saci.cc (`No verification code arrived at ... within 80000 ms`), que diz o que aconteceu, e não de um timeout genérico do Cypress. E o `after` garante que um email antigo, de uma tentativa anterior do mesmo teste, não seja lido como o novo.

## Comandos para o teste ler bem

Em vez de chamar `cy.task` com strings por todo lado, crie comandos:

```ts
// cypress/support/commands.ts
Cypress.Commands.add("createInbox", () => cy.task<string>("createInbox"));

Cypress.Commands.add("waitForCode", (address: string, after: Date) =>
  cy.task<string>("waitForCode", { address, after: after.toISOString() }),
);

Cypress.Commands.add("waitForLink", (address: string, after: Date, match?: string) =>
  cy.task<string>("waitForLink", { address, after: after.toISOString(), match }),
);

// Tipos para o TypeScript conhecer os comandos
declare global {
  namespace Cypress {
    interface Chainable {
      createInbox(): Chainable<string>;
      waitForCode(address: string, after: Date): Chainable<string>;
      waitForLink(address: string, after: Date, match?: string): Chainable<string>;
    }
  }
}

export {};
```

## O teste do cadastro

```ts
// cypress/e2e/signup.cy.ts
describe("cadastro", () => {
  it("confirma o email com o código", () => {
    cy.createInbox().then((address) => {
      // Marque a hora antes de enviar o formulário
      const started = new Date();

      cy.visit("/signup");
      cy.get("input[name=email]").type(address);
      cy.get("input[name=password]").type("correct horse battery staple");
      cy.get("button[type=submit]").click();

      cy.waitForCode(address, started).then((code) => {
        cy.get("input[name=code]").type(code);
        cy.get("button[type=submit]").click();
      });

      cy.contains("Bem-vindo").should("be.visible");
    });
  });
});
```

O saci.cc tira o código do email quando ele chega, então o teste não precisa de regex. Cada execução cria uma caixa nova, com endereço aleatório, e testes em paralelo não leem o email um do outro.

## Links de confirmação e de login

Se o seu app manda um link em vez de código, use `waitForLink`. O terceiro argumento escolhe o link certo quando o email tem vários:

```ts
it("entra com o link mágico", () => {
  cy.createInbox().then((address) => {
    const requested = new Date();
    cy.visit("/login");
    cy.get("input[name=email]").type(address);
    cy.get("button[type=submit]").click();

    cy.waitForLink(address, requested, "/auth/callback").then((link) => cy.visit(link));
    cy.url().should("include", "/dashboard");
  });
});
```

O `cy.visit` funciona direto quando o link é do mesmo domínio do `baseUrl`. Se o seu provedor de email reescreve os links para rastrear cliques, o link aponta para outro domínio e o Cypress reclama. Nesse caso, desligue o rastreamento de cliques no ambiente de teste, que é o mais simples, ou use `cy.origin`.

## No CI

Guarde a chave como secret e passe para o passo do Cypress. No GitHub Actions, com a action oficial:

```yaml
- uses: cypress-io/github-action@v6
  with:
    start: npm start
  env:
    SACI_API_KEY: ${{ secrets.SACI_API_KEY }}
```

Cada espera usa poucas requisições, porque a API segura a resposta até o email chegar. Com o plano Free, de 120 requisições por minuto, dá para rodar dezenas de testes de email em paralelo. O [post sobre GitHub Actions](/blog/github-actions-email-tests/) fala de shards e limites com mais detalhe.

## Resumindo

- Rode o cliente do saci.cc no Node, com `cy.task`, e deixe a chave em `SACI_API_KEY`, fora do navegador.
- Aumente o `taskTimeout` para 90 segundos e passe `after` com a hora de antes da ação.
- Use `waitForCode` para códigos e `waitForLink` para links de confirmação e de login.
- Usa Playwright, Selenium ou Puppeteer? Veja o [guia do Playwright](/blog/playwright-email-verification/) e o [do Selenium e Puppeteer](/blog/selenium-puppeteer-email/).
