Para testar um cadastro, uma recuperação de senha ou um login por link mágico, o teste precisa ler o email que o app mandou. Há duas formas de fazer isso, e as ferramentas se dividem entre elas:

- **Caixa de entrada de verdade.** O app manda o email para um endereço público, como `teste-123@saci.cc`, e o teste lê pela API. O email passa pelo mesmo caminho que passaria para um usuário.
- **Sandbox SMTP.** Em vez de entregar, o app manda tudo para um servidor SMTP falso, que guarda os emails para você ver. Nada chega a ninguém, o que é ótimo para staging, mas o teste não prova que o email sai do seu provedor de envio.

Esta comparação olha para o caso de testes automatizados (Playwright, Cypress, Selenium) rodando no CI. Os preços são os que as páginas de preço mostravam em 19 de novembro de 2026, em dólares.

## Resumo

|                          | Plano grátis                  | Plano pago mais barato                       | Tipo                   |
| ------------------------ | ----------------------------- | -------------------------------------------- | ---------------------- |
| Mailosaur                | Não, teste de 14 dias         | A partir de US$ 20/mês, cobrado por ano      | Caixas reais           |
| Mailtrap (Email Sandbox) | 50 emails/mês, 1 sandbox      | US$ 17/mês (US$ 14 no anual), 500 emails/mês | Sandbox SMTP           |
| MailSlurp                | 250 emails e 100 caixas/mês   | US$ 19,99/mês, 2.500 emails e 500 caixas/mês | Caixas reais e sandbox |
| saci.cc                  | 1.000 caixas/mês, 120 req/min | US$ 9/mês (R$ 29), caixas sem limite         | Caixas reais           |

## Mailosaur

O Mailosaur é feito para testes automatizados e existe há bastante tempo. Não tem plano grátis permanente, só um teste de 14 dias. O plano Personal começa em US$ 20 por mês, cobrado por ano, com 1 usuário, 15.000 emails recebidos por mês (até 500 por dia) e emails guardados por 3 dias. O Core, a partir de US$ 50 por mês no anual, inclui 5 usuários, várias caixas e acesso por IMAP e POP3.

**Faz sentido** para times que querem um produto maduro, com suporte e retenção mais longa, e podem pagar desde o primeiro dia.

## Mailtrap

O Mailtrap tem dois produtos: envio de email e o Email Sandbox. O Sandbox é o que interessa para testes, e é um sandbox SMTP: o app manda os emails para o Mailtrap em vez de entregar. O plano grátis aceita 50 emails por mês, em 1 sandbox, guardando os 10 últimos. O Basic custa US$ 17 por mês (US$ 14 no anual) e aceita 500 emails por mês, com até 10 emails a cada 10 segundos por sandbox.

**Faz sentido** quando o objetivo é não entregar email nenhum, por exemplo num staging com dados reais, e quando você quer inspecionar HTML e cabeçalhos. Para testes que criam muitas contas, os limites de emails por mês acabam rápido.

## MailSlurp

O MailSlurp cria caixas reais pela API e também tem sandbox, envio de email e domínios próprios (pagos à parte nos planos menores). O plano grátis recebe 250 emails e cria 100 caixas por mês, que são temporárias. O Starter custa US$ 19,99 por mês, com 2.500 emails recebidos e 500 caixas criadas por mês, para 1 usuário. Tem SDKs, e a página diz que dá para usar no Playwright e em tasks do Cypress.

**Faz sentido** quando você precisa de mais do que receber: mandar emails a partir das caixas, usar o seu próprio domínio ou guardar caixas por muito tempo.

## saci.cc

O saci.cc cria caixas reais em `@saci.cc` por uma API simples, com um [cliente para npm](/blog/playwright-email-verification/) e um [servidor MCP](https://saci.cc/mcp/) para agentes de IA. O plano Free não pede cartão: 1.000 caixas criadas por mês, 120 requisições por minuto, 5 chaves, e as caixas criadas com a sua chave ficam privadas por 7 dias. O código e o link de verificação já vêm extraídos de cada email. O Pro custa US$ 9 por mês (R$ 29 no Brasil), sem limite de caixas, com 600 requisições por minuto e webhooks. O Team custa US$ 29 (R$ 99).

O que o saci.cc não faz, e onde outra ferramenta é melhor:

- **Os emails são apagados cerca de um dia depois de chegar.** Ótimo para testes, ruim se você quer guardar histórico.
- **Não há domínio próprio.** Os endereços são sempre `@saci.cc`. Se o seu app bloqueia domínios de email temporário, libere `saci.cc` no ambiente de teste.
- **Não envia email** e não tem sandbox SMTP. Se você não quer que o staging entregue nada, use um sandbox.

**Faz sentido** quando você quer começar de graça no CI, pagar pouco quando a suíte crescer e não ter que contar emails por mês.

## Como escolher

- Quer que nada seja entregue? Um **sandbox SMTP**, como o Mailtrap.
- Quer provar que o email sai e chega, com o código ou o link funcionando? Uma **caixa real**: Mailosaur, MailSlurp ou saci.cc.
- Precisa de domínio próprio, envio ou retenção longa? **MailSlurp** ou **Mailosaur**.
- Quer o menor custo para testes no CI, com plano grátis de verdade? **saci.cc**.

Para ver como fica na prática, o [guia do Playwright](/blog/playwright-email-verification/) mostra um teste de cadastro completo, e o [guia do GitHub Actions](/blog/github-actions-email-tests/) mostra como rodar no CI.
