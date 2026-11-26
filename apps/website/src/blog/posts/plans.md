O saci.cc começou como um email temporário no navegador e virou uma ferramenta de testes: hoje a maior parte do uso vem da [API](https://saci.cc/docs/) e do [servidor MCP](https://saci.cc/mcp/), de scripts de CI e agentes de IA que criam uma caixa, fazem um cadastro e leem o código de verificação. Para quem roda isso todo dia, agora existem planos pagos.

## O que continua grátis

O site e a extensão seguem grátis e sem cadastro. Com uma conta do GitHub, o plano Free dá:

- 120 requisições por minuto, somando todas as chaves da conta;
- até 1.000 caixas por mês criadas com as suas chaves, pela API ou pelo MCP;
- caixas privadas para a sua conta por 7 dias;
- até 5 chaves de API.

Dá para usar em CI, sim. Para a maioria dos projetos, isso é mais do que o suficiente.

## Pro e Team

|                        | Free   | Pro           | Team           |
| ---------------------- | ------ | ------------- | -------------- |
| Requisições por minuto | 120    | 600           | 2.000          |
| Caixas por mês         | 1.000  | sem limite    | sem limite     |
| Caixas privadas por    | 7 dias | 30 dias       | 90 dias        |
| Chaves de API          | 5      | 10            | 25             |
| Webhooks               | —      | ✓             | ✓              |
| Preço por mês          | grátis | US$ 9 · R$ 29 | US$ 29 · R$ 99 |

No plano anual, são dois meses de graça. Os preços aparecem em reais no Brasil e em dólares nos outros países. Veja tudo na [página de planos](https://saci.cc/pricing/).

## Webhooks em vez de consultar a caixa

Com `?wait=`, a API já segura a resposta até o email chegar, por até 25 segundos. Mas, numa suíte grande, são muitas conexões abertas esperando. Com um webhook, o saci.cc manda um POST assinado para a sua URL assim que o email chega, com o remetente, o assunto, os links e o código de verificação:

```json
{
  "event": "email.received",
  "address": "cadastro-42@saci.cc",
  "subject": "Seu código de acesso",
  "verificationCode": "481920",
  "verificationLink": null
}
```

A [documentação](https://saci.cc/docs/#webhooks) mostra como conferir a assinatura.

## Assinar e cancelar

Entre com o GitHub, abra [Planos](https://saci.cc/pricing/) e escolha Pro ou Team. O pagamento é pela Stripe; o saci.cc não vê o seu cartão. Para trocar de plano, baixar faturas ou cancelar, vá em Conta → Plano → Gerenciar assinatura. O cancelamento vale no fim do período pago, e na primeira assinatura você pode pedir o reembolso integral em até 7 dias. Os detalhes estão nos [termos de uso](https://saci.cc/terms/).

Dúvidas, ou precisa de algo que os planos não cobrem? Escreva para oi@saci.cc.
