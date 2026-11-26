No [post sobre o `/\d{6}/`](/blog/otp-codes/) o problema era tirar o código de verificação de um email que tem pedidos, preços, anos e links. A solução era procurar o número mais perto de uma palavra como "código". Funciona na maioria dos emails, mas continua sendo adivinhação.

Em setembro de 2026, duas pessoas do Google publicaram no IETF um rascunho que acaba com essa adivinhação: o header `OTP-Token`. O app que manda o email declara o código num header, e quem lê o email não precisa procurar nada no texto. A Appwrite já envia esse header desde novembro, e o saci.cc passou a ler ele.

## Como é o header

```
OTP-Token: "482913"; origin="https://your-app.com"
```

São duas partes:

- **O código**, entre aspas. É o mesmo que aparece no corpo do email, do jeito que a pessoa digitaria.
- **O `origin`**, o site que pediu o código. É o mesmo formato do `location.origin` no navegador: esquema, domínio e porta, sem caminho nem barra no final.

O [rascunho](https://www.ietf.org/archive/id/draft-goto-otp-token-01.html) define algumas regras que importam para quem lê o header:

- O `origin` é obrigatório e tem que ser `https://`, ou `http://localhost` em desenvolvimento.
- Só vale um `OTP-Token` por email. Com dois ou mais, nenhum conta.
- O header tem que estar no cabeçalho do email, não dentro de uma parte MIME.

## Por que isso importa

Para quem recebe, a ideia é o mesmo que o WebOTP faz com SMS: o cliente de email ou o navegador encontra o código e oferece para preencher, sem a pessoa abrir o email. Ainda é proposta: o rascunho não foi adotado por nenhum grupo do IETF, e a parte de segurança (por exemplo, se o `origin` precisa bater com a assinatura DKIM do email) ainda está em aberto.

Para testes e agentes, o ganho já existe hoje:

- **Nada de adivinhação.** O código vem declarado. Um número de pedido no assunto ou um ano no rodapé não atrapalham mais.
- **O código certo do app certo.** Com o `origin`, o teste pode exigir que o código seja do site que ele está testando, e não de outro email que caiu na mesma caixa.

## Mandando o header no seu app

Basta um header a mais no envio. Com Nodemailer:

```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport(process.env.SMTP_URL);

await transporter.sendMail({
  from: "Your App <no-reply@your-app.com>",
  to: user.email,
  subject: "Your verification code",
  text: `Your verification code is ${code}. It expires in 10 minutes.`,
  // O mesmo código do texto, declarado para quem lê o email
  headers: { "OTP-Token": `"${code}"; origin="https://your-app.com"` },
});
```

O Resend, o SES e a maioria dos serviços de envio aceitam um campo `headers` parecido. Algumas dicas:

- Mantenha o código no texto também. O header é para máquinas; quem lê o email ainda precisa ver o código.
- Use no `origin` o endereço onde a pessoa digita o código: `https://staging.your-app.com` em staging, `http://localhost:3000` em desenvolvimento.
- Não ponha nada além do código e do `origin`. Parâmetros desconhecidos são ignorados, mas não ajudam ninguém.

## Lendo o header no saci.cc

Quando um email chega com um `OTP-Token` válido, o saci.cc usa o código do header em vez de procurar no texto, e guarda o `origin` junto. Sem o header, continua valendo a busca de antes.

- **Na API:** a lista da caixa e cada email trazem o `verificationCodeOrigin`, ao lado do `verificationCode`. Ele é `null` quando o código veio do texto. O webhook manda o mesmo campo.
- **No npm:** `waitForCode({ origin })` só aceita códigos que o remetente ligou a esse site.
- **No MCP:** `get_verification_code` devolve o `origin` e aceita o mesmo filtro, para agentes que fazem cadastro em vários sites.

```json
{
  "messageId": "0100019a2b3c4d5e-6f7a8b9c-...",
  "from": "Your App <no-reply@your-app.com>",
  "subject": "Your verification code",
  "verificationCode": "482913",
  "verificationCodeOrigin": "https://your-app.com",
  ...
}
```

Num teste com Playwright:

```ts
import { createInbox } from "saci.cc";

const inbox = await createInbox();
await page.getByLabel("Email").fill(inbox.address);
// Marque a hora antes do clique que envia o email
const sentAt = new Date();
await page.getByRole("button", { name: "Send code" }).click();

// Só um código que o seu app ligou ao próprio site
const code = await inbox.waitForCode({ origin: "https://your-app.com", after: sentAt });
await page.getByLabel("Verification code").fill(code);
```

O `origin` aceita `"your-app.com"` ou `"https://your-app.com/login"` também; o saci.cc reduz ao formato do header. Atenção: com `origin`, emails sem o header não contam. Use só quando o seu app já manda o header, senão o teste espera até o tempo acabar.

## Resumindo

- O `OTP-Token` declara o código e o site dele num header: `OTP-Token: "482913"; origin="https://your-app.com"`.
- Mandar ele custa uma linha no envio do email, e o código continua no texto.
- No saci.cc, o código do header tem prioridade, e `verificationCodeOrigin`, `waitForCode({ origin })` e o `origin` do MCP deixam você exigir que o código seja do app certo.
