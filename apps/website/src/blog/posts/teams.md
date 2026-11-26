Até agora, cada conta do saci.cc era de uma pessoa só. Numa empresa, isso queria dizer escolher entre dividir uma chave entre todo mundo ou pagar uma assinatura por pessoa. Agora o plano Team tem times: quem assina gera um link de convite, e até 10 pessoas entram na mesma conta, cada uma com o próprio GitHub e as próprias chaves.

## O que o time divide

Quem entra no time passa a usar a conta de quem assina:

- **O plano e os limites.** As chaves de todo mundo somam as 2.000 requisições por minuto e as 25 chaves do Team, sem limite de caixas por mês.
- **As caixas privadas.** Uma caixa criada com a chave de qualquer pessoa do time é do time por 90 dias: todo mundo do time lê, e ninguém de fora lê nem pega o mesmo nome. Uma pessoa cria `cadastro-ci@saci.cc` no pipeline, e outra abre os emails dela no próprio script.
- **O webhook.** Os emails que chegam nas caixas do time vão para a URL configurada na conta.

Cada pessoa continua com o próprio login e as próprias chaves. Para tirar alguém, você remove a pessoa do time e as chaves dela deixam de usar a conta em até um minuto, sem trocar a chave de mais ninguém.

## Como convidar

- Assine o Team na [página de planos](https://saci.cc/pricing/).
- Na [página da conta](https://saci.cc/account/), abra a aba **Time** e clique em **Gerar link de convite**.
- Mande o link para quem vai entrar. A pessoa entra com o GitHub e clica em **Entrar no time**.

O link vale por 7 dias e serve para várias pessoas, enquanto houver lugar. Ele só aparece uma vez; gerar outro desativa o anterior, e dá para desativar sem gerar outro. Quando alguém entra ou sai, quem assina recebe um email.

## O que as abas Time e Visão geral mostram

A aba Time lista quem está no time e desde quando. A aba Visão geral soma as caixas e os emails de todo mundo e mostra quem criou cada caixa, então dá para ver qual pipeline ou pessoa está gastando o limite.

Quem entra no time não vê a assinatura nem o webhook: cobrança e configurações ficam com quem assina.

## Algumas regras

- Uma pessoa está em um time por vez. Para entrar em outro, ela sai do atual primeiro.
- Quem já tem um plano pago próprio cancela antes de entrar num time, para não pagar duas vezes.
- As caixas que alguém criou antes de entrar continuam só dessa pessoa até expirar. As que criou dentro do time ficam com o time quando ela sai.
- Ao sair, as chaves continuam funcionando, agora com a conta e os limites da própria pessoa.
- Se a conta sair do Team, por exemplo por cancelamento, todo mundo continua no time com os limites do novo plano e recebe um email avisando.

## 14 dias grátis

A primeira assinatura do Team começa com 14 dias grátis. O cartão é pedido no início, e a primeira cobrança só acontece quando o teste acaba; cancelando antes, em Conta → Plano → Gerenciar assinatura, você não paga nada. Dá tempo de convidar o time, ligar o CI e ver se os limites servem.

Os preços continuam os mesmos: US$ 29 ou R$ 99 por mês, com dois meses de graça no anual. Veja os detalhes na [página de planos](https://saci.cc/pricing/).

## Resumindo

- O Team agora tem até 10 pessoas na mesma conta, cada uma com o próprio GitHub e as próprias chaves.
- O time divide o plano, os limites, o webhook e as caixas privadas.
- O convite é um link na aba Time da [conta](https://saci.cc/account/), que vale por 7 dias.
- A primeira assinatura do Team tem 14 dias grátis.

Dúvidas ou um time maior que 10 pessoas? Escreva para oi@saci.cc.
