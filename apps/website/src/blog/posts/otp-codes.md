Todo teste de cadastro com código de verificação chega no mesmo ponto: o email chegou, e agora é preciso tirar o `482913` de dentro dele. A primeira tentativa costuma ser esta:

```ts
const code = email.text.match(/\d{6}/)?.[0];
```

Ela funciona no primeiro email e quebra no décimo. Este post mostra por que, como fazer uma versão mais confiável, e como o saci.cc entrega o código já extraído para você não precisar de nenhuma.

## Por que /\d{6}/ falha

Um email de verdade tem muitos números além do código:

- **Números de pedido e protocolo:** "Pedido nº 120394 · Seu código é 482913". A regex pega o pedido, que vem antes.
- **Preços, datas e horários:** "R$ 149,90", "22/11/2026", "válido até 14:30". Com `\d{4,8}`, o ano 2026 já vira código.
- **Links:** o HTML tem URLs como `/confirm?token=839201&uid=1002931`. Rodando no HTML, a regex acha números dentro dos links.
- **CSS e cores:** `#120394` num `style` tem seis dígitos.
- **Formatos diferentes:** "482-913", "482 913" ou "K7P2QX". A regex de seis dígitos seguidos não pega nenhum desses.
- **Telefones e CEPs** no rodapé.

E quando ela erra, erra em silêncio: o teste digita o número errado, o app recusa, e a falha parece um bug no cadastro.

## Procure a palavra, não só o número

O que diferencia o código dos outros números é o texto em volta: "código", "code", "verificação", "senha", "OTP". Uma estratégia mais confiável:

- Use o texto do email, não o HTML, e apague os links antes de procurar.
- Encontre os candidatos: de 4 a 8 dígitos, ou `123-456` e `123 456`, que não estejam colados em outras letras, `#`, `$` ou barras.
- Descarte anos e números logo depois de "pedido", "nº", "R$", "CPF" e parecidos.
- Fique com o candidato mais próximo de uma palavra como "código", até umas 60 letras antes ou 40 depois.

Em TypeScript, uma versão enxuta:

```ts
// As palavras que costumam vir perto do código, em português e inglês
const KEYWORDS = /(c[oó]digo|code|otp|pin|verifica\w*|confirma\w*|senha|password|token)/gi;
// Números logo depois disso são pedidos, faturas ou preços
const NOT_A_CODE_BEFORE = /(#|n[ºo°.]\s*|pedido|order|invoice|fatura|r\$|\$)\s*:?\s*$/i;
const CANDIDATE = /(?<![\w#$.\/-])(\d{3}[- ]\d{3}|\d{4,8})(?![\w\/%-])/g;

function findCode(text: string): string | null {
  const clean = text.replace(/https?:\/\/\S+/g, " ");
  let best: { code: string; distance: number } | null = null;
  for (const match of clean.matchAll(CANDIDATE)) {
    const start = match.index;
    const end = start + match[1].length;
    const before = clean.slice(Math.max(0, start - 60), start);
    const after = clean.slice(end, end + 40);
    if (/^(19|20)\d{2}$/.test(match[1]) || NOT_A_CODE_BEFORE.test(before)) continue;

    const last = [...before.matchAll(KEYWORDS)].at(-1);
    const next = after.search(KEYWORDS);
    const distance = Math.min(
      last ? before.length - (last.index + last[0].length) : Infinity,
      next >= 0 ? next : Infinity,
    );
    if (distance === Infinity) continue;
    if (!best || distance < best.distance) best = { code: match[1].replace(/[- ]/g, ""), distance };
  }
  // null quando não há número perto de nenhuma palavra: melhor falhar que digitar o número errado
  return best?.code ?? null;
}
```

Ela já resolve a maior parte dos casos, mas vale saber o que fica de fora: códigos com letras, palavras em outras línguas, acentos e emails que dizem "use o número abaixo" com o código três linhas depois.

## No saci.cc, o código já vem pronto

O saci.cc faz essa busca quando o email chega, com uma lista maior de palavras em português, inglês e espanhol, códigos com letras como `K7P2QX`, prefixos como o `G-482913` do Google, e as exceções de pedidos, preços, telefones e anos. Se o código estiver no assunto, ele já é encontrado ali. O resultado aparece em todos os lugares:

- **Na API:** o campo `verificationCode` vem na lista da caixa e em cada email, com o código ou `null`. "482-913" vem como `482913`, pronto para digitar.
- **No pacote do npm:** `waitForCode()` espera o email e devolve só o código.
- **No MCP:** a ferramenta `get_verification_code` faz o mesmo para agentes de IA.
- **No site e na extensão:** um botão copia o código sem abrir o email.

```ts
import { createInbox } from "saci.cc";

const inbox = await createInbox();
// ...
// Espera o email e devolve só o código
const code = await inbox.waitForCode({ from: "your-app.com" });
// Ou o email inteiro, com o código e o link já extraídos
const email = await inbox.waitForEmail({ subject: /code|código/i });
console.log(email.verificationCode, email.verificationLink);
```

Se o seu app manda um botão "Confirmar email" em vez de código, o campo `verificationLink` e o `waitForLink()` fazem o mesmo com o link. O [post sobre links de confirmação](/blog/verification-links/) explica quais links contam.

## Quando o código não é encontrado

Se `verificationCode` vier `null` num email que tem código, normalmente é porque não há nenhuma palavra perto dele. Duas saídas:

- Melhore o email: "Seu código de verificação é 482913" ajuda o saci.cc e também quem lê o email num leitor de tela.
- Leia o `text` do email com `inbox.waitForEmail()` e use a sua própria regex, ancorada no texto fixo do seu template.

E mande um feedback para oi@saci.cc ou pela [API](https://saci.cc/docs/) com o texto do email: casos assim viram testes e melhoram a busca para todo mundo.

## Resumindo

- `/\d{6}/` pega pedidos, anos, preços e números de links, e erra sem avisar.
- Procure o número mais perto de uma palavra como "código", no texto sem links, e descarte anos e pedidos.
- No saci.cc, use `verificationCode`, `waitForCode()` ou `get_verification_code` e pule essa parte.
