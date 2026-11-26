Nos planos Pro e Team, o saci.cc pode avisar você quando um email chega, em vez de você perguntar. Cada email que chega numa caixa da sua conta vira um POST para a sua URL, com o remetente, o assunto, os links e o código de verificação já extraídos. Este post mostra quando isso vale a pena, como conferir que o POST veio mesmo do saci.cc e um exemplo que manda os códigos para um canal do Slack.

## Esperar com a API ou receber um webhook

Para um teste automatizado, esperar com a API costuma ser o melhor caminho. O teste cria a caixa, faz a ação e chama `GET /addresses/{address}/emails?wait=25`, e a API segura a resposta até o email chegar. Não precisa de servidor, e funciona no CI, onde nada é acessível pela internet. O pacote `saci.cc` do npm faz isso por você com `waitForCode()`.

O webhook é melhor quando quem precisa do email não é o processo que fez a ação:

- **QA manual.** Uma pessoa testa o cadastro no celular e o código aparece num canal do Slack ou do Teams, sem abrir o saci.cc.
- **Monitoramento.** Um job agendado se cadastra na produção de hora em hora, e o seu servidor confere se o email chegou e em quanto tempo.
- **Volume.** Uma suíte com centenas de testes simultâneos deixa centenas de conexões abertas esperando. Com o webhook, o seu servidor recebe tudo e os testes leem de um banco ou de uma fila.
- **Arquivo.** Os emails são apagados cerca de um dia depois de chegar. Se você quer guardar o que o seu app mandou, o webhook entrega cada um assim que chega.

## Configurar

Na [página da conta](https://saci.cc/account/), abra a aba **Webhook**, coloque a URL e salve. A URL precisa ser HTTPS e estar na internet pública: localhost e IPs privados são recusados. Ao salvar, aparece o segredo, que começa com `whsec_`. Guarde no seu servidor, por exemplo como `SACI_WEBHOOK_SECRET`.

O botão **Mandar um teste** envia um POST com `"event": "test"` e valores de mentira, para você conferir a URL e a assinatura antes de mandar emails de verdade. A mesma aba mostra o resultado da última entrega.

No plano Team, o webhook é da conta: os emails das caixas criadas por qualquer pessoa do time vão para a mesma URL.

## O que chega

```json
{
  "event": "email.received",
  "address": "qa-checkout@saci.cc",
  "messageId": "0100019a...",
  "from": "Loja <no-reply@loja.example>",
  "subject": "Seu código de acesso",
  "receivedAt": "2026-11-22T14:03:11.402Z",
  "verificationCode": "481920",
  "verificationLink": null,
  "links": ["https://loja.example/ajuda"]
}
```

O `verificationCode` e o `verificationLink` são `null` quando o email não tem código nem link de confirmação. O corpo do email não vem no POST; se precisar do HTML ou do texto, peça `GET /addresses/{address}/emails/{messageId}` com a sua chave.

## Conferir a assinatura

Qualquer um que descubra a sua URL consegue mandar um POST para ela. Por isso cada envio vem com o header `Saci-Signature: t=<segundos>,v1=<hmac>`, em que `v1` é um HMAC-SHA256 de `"<t>.<corpo>"` feito com o seu segredo. Três cuidados:

- Calcule o HMAC com o corpo **exatamente como chegou**, antes de fazer `JSON.parse`. Reformatar o JSON muda os bytes e a assinatura não bate.
- Compare com `timingSafeEqual`, não com `===`.
- Recuse envios com `t` de mais de 5 minutos atrás, para que um POST antigo capturado não possa ser reenviado.

## Um exemplo: códigos no Slack

Este handler usa a API padrão de `Request` e `Response`, então funciona como route handler do Next.js, no Bun, no Deno ou num Cloudflare Worker com compatibilidade com Node:

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.SACI_WEBHOOK_SECRET!; // whsec_...
const SLACK = process.env.SLACK_WEBHOOK_URL!;
const seen = new Set<string>();

// Confere que o POST veio do saci.cc
function verify(header: string, body: string): boolean {
  const { t, v1 } = Object.fromEntries(header.split(",").map((part) => part.split("=")));
  // Recusa envios assinados há mais de 5 minutos
  if (!t || !v1 || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = createHmac("sha256", SECRET).update(`${t}.${body}`).digest("hex");
  return v1.length === expected.length && timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}

export async function POST(request: Request): Promise<Response> {
  // O corpo como chegou, antes de ler o JSON
  const body = await request.text();
  if (!verify(request.headers.get("saci-signature") ?? "", body))
    return new Response("bad signature", { status: 400 });

  const email = JSON.parse(body);
  // Se a primeira tentativa demorou, o mesmo email pode chegar duas vezes
  if (email.event !== "email.received" || seen.has(email.messageId)) return new Response("ok");
  seen.add(email.messageId);

  const detail = email.verificationCode ?? email.verificationLink ?? email.subject;
  // Um incoming webhook do Slack
  await fetch(SLACK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `${email.address}: ${detail}` }),
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});

  // Responda rápido: o saci.cc espera no máximo 5 segundos
  return new Response("ok");
}
```

O `Set` em memória serve para um exemplo; num servidor com várias instâncias, guarde o `messageId` no banco.

## Como a entrega funciona

- A sua URL tem 5 segundos para responder com um status 2xx. Se falhar ou demorar, o saci.cc tenta mais uma vez, e só. Faça o trabalho pesado depois de responder, ou numa fila.
- Redirecionamentos não são seguidos: use a URL final.
- Como pode haver uma segunda tentativa, o mesmo `messageId` pode chegar duas vezes. Ignore os repetidos.
- Se o webhook ficar fora do ar, os emails continuam na caixa por cerca de um dia e podem ser lidos pela API.

## Resumindo

- Para testes no CI, espere com a API ou com o pacote do npm. Para QA manual, monitoramento, volume e arquivo, use o webhook.
- Configure a URL na aba Webhook da [conta](https://saci.cc/account/) e guarde o segredo `whsec_`.
- Confira o `Saci-Signature` com o corpo cru, compare em tempo constante e recuse envios antigos.
- Responda em menos de 5 segundos e ignore `messageId` repetido.

Os webhooks fazem parte dos planos [Pro e Team](https://saci.cc/pricing/). O formato completo está na [documentação](https://saci.cc/docs/#webhooks).
