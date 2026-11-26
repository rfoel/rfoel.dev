Muitos sites não mandam um código: mandam um botão "Confirmar email", um link mágico para entrar ou um link para trocar a senha. Até agora, no saci.cc, você precisava abrir o email e achar o botão. Agora o saci.cc encontra esse link quando o email chega e mostra um botão "Abrir link" direto na caixa de entrada. O mesmo link aparece na extensão, na API, no servidor MCP e no pacote do npm.

## Na caixa de entrada

![Caixa de entrada do saci.cc com os botões do código e "Abrir link" nas linhas dos emails](/blog/verification-links/inbox-pt.webp)

- Quando o email tem um link de confirmação ou de login, a linha dele na caixa de entrada mostra um botão **Abrir link**. Ele abre o link numa nova aba, sem precisar abrir o email.
- O botão do código também ficou melhor: antes ele só aparecia quando o código estava no assunto. Agora aparece também quando o código está só no corpo do email.
- Ao abrir o email, o link aparece no topo, numa caixa com o domínio para onde ele leva, logo abaixo do código, se tiver.
- Copiar o código ou abrir o link pela lista marca o email como lido.
- Com as notificações do navegador ligadas, clicar no aviso de um email que só tem link abre o link.

![Email aberto no saci.cc, com o código de verificação e o link de confirmação no topo](/blog/verification-links/email-pt.webp)

## Que links contam

O saci.cc procura o link em que você clicaria para confirmar o endereço, entrar na conta (link mágico), ativar a conta ou trocar a senha. Um link conta quando:

- o texto do botão diz isso, como "Confirmar email", "Verify", "Entrar", "Ativar conta" ou "Redefinir senha", em português, inglês ou espanhol;
- ou o link é só "clique aqui" (ou a própria URL) e o texto logo antes dele pede uma dessas coisas.

Links de descadastrar, ajuda, privacidade, contato, redes sociais e "não fui eu" ficam de fora. Um link para `/login` sozinho não basta, porque newsletters têm um em todo email.

Muitos serviços de envio trocam o link por um de rastreio, então o domínio mostrado pode ser o do serviço de email, não o do site. Como em qualquer email, confira se ele veio de quem você esperava antes de clicar.

## Na extensão

A versão 1.3.0 da extensão traz o mesmo botão no popup e abre o link quando você clica no aviso de um email sem código. No Firefox ela atualiza sozinha; no Chrome, pela Chrome Web Store. Se ainda não tem, os links estão na [página inicial](https://saci.cc/).

## Na API

Os emails da API agora têm o campo `verificationLink`, com o link ou `null`. Ele aparece ao ler um email, na lista da caixa de entrada e no webhook. A lista também passou a trazer o `verificationCode`, então dá para pegar o código ou o link sem abrir cada email:

```json
{
  "emails": [
    {
      "messageId": "0100019a2b3c4d5e-6f7a8b9c-...",
      "from": "GitHub <noreply@github.com>",
      "subject": "[GitHub] Please verify your email address",
      "receivedAt": "2026-10-20T15:30:00.000Z",
      "verificationCode": null,
      "verificationLink": "https://github.com/users/confirm_verification/7f3e..."
    }
  ]
}
```

Está tudo na [documentação da API](https://saci.cc/docs/).

## No MCP

O servidor MCP ganhou a ferramenta `get_verification_link`. Ela espera o email chegar e devolve só o link, do mesmo jeito que a `get_verification_code` faz com o código. Então um pedido como este funciona mesmo quando o site manda um botão em vez de código:

```text
Crie um email temporário, faça o cadastro em https://exemplo.com com ele e confirme o email.
```

O `get_email` também devolve o `verification_link`. A lista de ferramentas está na [página do MCP](https://saci.cc/mcp/), e o [post sobre agentes de IA](/blog/email-for-ai-agents/) mostra como conectar.

## No pacote do npm

Na versão 1.2.0 do pacote `saci.cc`, o `waitForLink()` sem `match` devolve o link de confirmação ou de login. Antes ele devolvia o primeiro link do email, que muitas vezes era o do logo. Se o email não tem um link de confirmação, ele continua devolvendo o primeiro link. Com `match`, nada muda.

```ts
import { createInbox } from "saci.cc";

const inbox = await createInbox();
// ...cadastro com inbox.address...
const link = await inbox.waitForLink();
await page.goto(link);
```

O `waitForCode()` e o `waitForLink()` também passaram a usar o código e o link que já vêm na lista, então abrem menos emails enquanto esperam. O [guia do Playwright](/blog/playwright-email-verification/) mostra o fluxo inteiro.

Se algum email com link de confirmação não mostrar o botão, ou mostrar o link errado, escreva para oi@saci.cc com o remetente. Isso ajuda a melhorar a detecção.
