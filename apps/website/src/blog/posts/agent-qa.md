Um agente de IA com um navegador e uma caixa de email consegue fazer o que um QA faz num fluxo de cadastro: abrir a página, preencher o formulário, esperar o email, digitar o código e conferir se tudo deu certo. E, no fim, transformar o que fez num teste automatizado. Este post mostra como montar isso no Claude Code com dois servidores MCP, o do Playwright para o navegador e o do saci.cc para o email, e quais pedidos funcionam bem.

O [post sobre MCP](/blog/email-for-ai-agents/) explica o servidor do saci.cc e as ferramentas dele. Aqui o foco é usar isso para testar o seu próprio app.

## Os dois servidores no projeto

Crie uma chave grátis na [página da conta](https://saci.cc/account/), de preferência uma só para o agente, e coloque na variável `SACI_API_KEY`. Depois, na raiz do projeto, crie o `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "saci": {
      "type": "http",
      "url": "https://saci.cc/api/mcp",
      "headers": {
        "Authorization": "Bearer ${SACI_API_KEY}"
      }
    }
  }
}
```

O Claude Code troca `${SACI_API_KEY}` pelo valor da variável de ambiente, então o arquivo pode ir para o repositório sem a chave, e cada pessoa do time usa a própria. No plano Team, as caixas que o agente de uma pessoa cria ficam visíveis para todo o time.

Abra o Claude Code no projeto, aprove os dois servidores e rode `/mcp` para conferir que estão conectados.

## Um primeiro pedido

Com o app rodando localmente ou em homologação:

```text
Teste o cadastro em http://localhost:3000/signup:
1. Crie uma caixa no saci.cc e faça o cadastro com ela.
2. Pegue o código de verificação que chegar e termine o cadastro.
3. Me diga quanto tempo o email levou, quem mandou, qual era o assunto e se o código funcionou de primeira.
Se algo der errado, tire um screenshot e me mostre o erro.
```

O agente chama `create_inbox`, usa o Playwright para preencher o formulário, chama `get_verification_code` e digita o código. Se o email demorar mais de 25 segundos, a ferramenta avisa e ele espera de novo.

## Peça para ele olhar o que um teste não olha

Um teste automatizado confere o que você mandou conferir. Um agente pode ler o email como uma pessoa lê:

```text
Faça o cadastro de novo com uma caixa nova, mas agora abra o email inteiro com get_email e confira:
- se o assunto e o texto estão em português e sem placeholders como {{name}};
- se todos os links apontam para o nosso domínio, e não para localhost ou homologação;
- se o código no email é o mesmo que a página aceita;
- se o código antigo para de funcionar depois de pedir outro.
Liste o que encontrou, do mais grave para o menos grave.
```

Dá para fazer o mesmo com a recuperação de senha, a troca de email ou o convite de outra pessoa: qualquer fluxo que passe por um email.

## Um comando para repetir

Pedidos que você repete viram comandos do Claude Code. Salve em `.claude/commands/testar-cadastro.md`:

```markdown
Teste o fluxo de cadastro em $ARGUMENTS (padrão: http://localhost:3000/signup).
Use sempre uma caixa nova do saci.cc, nunca um email real.
Faça o cadastro, confirme com o código e confira o email inteiro: idioma,
placeholders, domínio dos links e se o código antigo é recusado.
Termine com uma lista dos problemas encontrados e screenshots dos erros.
```

Depois, `/testar-cadastro https://homologacao.seu-app.com/signup` roda tudo de novo, por exemplo antes de um deploy.

Vale também uma linha no `CLAUDE.md` do projeto, para o agente usar o saci.cc sempre que um fluxo pedir email, inclusive quando você não pedir:

```markdown
Para testar qualquer fluxo que envie email, crie uma caixa com o MCP do saci.cc. Nunca use emails reais.
```

## Do teste exploratório ao teste de regressão

Quando o fluxo funcionar, peça para ele virar código:

```text
Agora escreva um teste do Playwright em tests/signup.spec.ts que faz o mesmo cadastro, usando o pacote saci.cc do npm (createInbox e waitForCode). Rode o teste e corrija até passar.
```

O teste usa a mesma chave, por `SACI_API_KEY`, e roda no CI sem agente. O [guia do Playwright](/blog/playwright-email-verification/) mostra o resultado esperado, e o [do Cypress](/blog/cypress-email/) o equivalente para quem usa Cypress.

## Cuidados

- **Teste em local ou homologação.** Um agente cadastrando contas na produção suja o banco e as métricas.
- **CAPTCHA trava o agente.** Desligue no ambiente de teste ou use as chaves de teste do seu provedor.
- **As caixas são privadas por 7 dias no Free**, e os emails somem cerca de um dia depois de chegar. Não use essas contas para nada que precise durar.
- **O limite é da conta.** O agente divide as 120 requisições por minuto do Free com os seus scripts. Uma chave separada para ele não aumenta o limite, mas deixa fácil ver o uso e revogar.

## Resumindo

- Coloque o MCP do Playwright e o do saci.cc no `.mcp.json` do projeto, com a chave em `${SACI_API_KEY}`.
- Peça o cadastro de ponta a ponta e depois uma leitura crítica do email: idioma, links, placeholders, código antigo.
- Salve os pedidos que se repetem em `.claude/commands/` e uma regra no `CLAUDE.md`.
- Quando estiver bom, peça o teste do Playwright ou do Cypress com o pacote `saci.cc` para rodar no CI.
