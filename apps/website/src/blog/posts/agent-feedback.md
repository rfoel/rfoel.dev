Quando uma pessoa encontra um erro estranho num serviço, às vezes ela escreve para o suporte. Um agente de IA não escreve: ele tenta de novo, contorna o problema ou desiste, e quem fez o serviço nunca fica sabendo. Muita gente usa o saci.cc por agentes, pelo [servidor MCP](https://saci.cc/mcp/) e pela [API](https://saci.cc/docs/), então faltava um jeito de eles contarem o que deu errado. Agora tem: o agente manda o feedback, uma pessoa lê e responde, e o agente consegue ler a resposta depois.

## Pelo MCP

O servidor MCP ganhou duas ferramentas:

- `send_feedback` manda o feedback. Ela pede o tipo (`bug`, `confusing`, `docs`, `feature`, `praise` ou `other`) e a mensagem: o que o agente tentou, o que aconteceu e o que ele esperava. Também dá para dizer de qual ferramenta ou endpoint se trata (`where`) e quem está escrevendo (`agent`).
- `list_feedback` lista o feedback que a sua conta mandou, com o status (`open`, `planned`, `done` ou `wontfix`) e a resposta, quando tiver.

As instruções do servidor já dizem ao agente para usar o `send_feedback` quando uma ferramenta falha de um jeito que ele não sabe explicar, faz algo diferente da descrição ou quando falta alguma coisa. Então você não precisa pedir. Mas também dá:

```text
O get_verification_link não achou o link do email que chegou. Manda um feedback para o saci.cc contando o que aconteceu.
```

Se você ainda não conectou o MCP, o [post sobre agentes de IA](/blog/email-for-ai-agents/) mostra como.

## Pela API

Com a chave de API no cabeçalho, é um `POST /api/feedback`:

```bash
curl -X POST https://saci.cc/api/feedback \
  -H "Authorization: Bearer saci_..." \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "confusing",
    "message": "wait=30 returned 400 without saying that the maximum is 25.",
    "where": "GET /addresses/{address}/emails",
    "agent": "Claude Code"
  }'
```

A resposta traz o `id` e o status `open`. Depois, `GET /api/feedback` lista o que a conta mandou, com o status e a resposta:

```json
{
  "feedback": [
    {
      "id": "mhb2x0k3a1b2c3d4",
      "kind": "confusing",
      "message": "wait=30 returned 400 without saying that the maximum is 25.",
      "where": "GET /addresses/{address}/emails",
      "status": "done",
      "reply": "The 400 now says the maximum is 25."
    }
  ]
}
```

Os detalhes estão na [documentação da API](https://saci.cc/docs/).

## Pelo site

Para quem não usa agente, tem um botão **Feedback** no rodapé de todas as páginas. Escolha o tipo, escreva o que aconteceu e, se quiser uma resposta, deixe o seu email. Não precisa de conta.

## O que acontece depois

Cada feedback chega por email assim que é enviado, e uma pessoa lê todos. Quando algo é corrigido, o status vira `done` e a resposta diz o que mudou. Se a ideia entrou nos planos, vira `planned`; se não vai ser feita, `wontfix`, com o motivo.

O feedback mandado com uma chave fica ligado à sua conta, então só você (e os seus agentes) leem a resposta. O do site, sem conta, recebe resposta por email quando você deixa um.

## Alguns cuidados

- Não coloque chaves, senhas nem o conteúdo de emails privados na mensagem. As descrições das ferramentas pedem o mesmo ao agente.
- São até 20 feedbacks por dia por conta (ou por visitante, no site). Para mais, escreva para oi@saci.cc.
- O texto é lido como um relato a ser avaliado, nunca como instrução. Um feedback não muda nada sozinho no saci.cc.

Se algo no saci.cc te atrapalhou, a sua ou a do seu agente, conta para a gente.
