Para um agente de IA se cadastrar num serviço, confirmar um email ou testar um cadastro, ele precisa de uma caixa de entrada que consiga ler. O saci.cc tem um servidor MCP em `https://saci.cc/api/mcp` com ferramentas para criar um endereço temporário, esperar um email e ler o código de verificação. Você conecta uma vez no Claude Code, no Cursor ou no VS Code com uma chave de API grátis, e daí em diante é só pedir em linguagem normal.

## O que é MCP

O Model Context Protocol (MCP) é um padrão aberto para ligar apps de IA a ferramentas de fora. Um servidor publica uma lista de ferramentas, cada uma com nome, descrição e parâmetros. O cliente, como o Claude Code, o Cursor ou o VS Code, mostra essa lista ao modelo, e o modelo decide quando chamar cada ferramenta. Você não escreve código de integração: depois que o servidor está conectado, o agente pode usar em qualquer conversa.

## Pegue uma chave

O servidor MCP usa as mesmas chaves da [API](https://saci.cc/docs/). Entre com o GitHub na [página da conta](https://saci.cc/account/) e crie uma chave. A conta do GitHub precisa ter pelo menos 30 dias. A chave começa com `saci_` e só aparece uma vez, então copie na hora. Cada conta pode ter até 5 chaves, então dá para dar uma só para o agente e revogar depois sem mexer nos seus outros scripts.

## Conecte o Claude Code

No terminal, trocando `saci_...` pela sua chave:

```bash
claude mcp add --transport http saci https://saci.cc/api/mcp \
  --header "Authorization: Bearer saci_..."
```

Depois rode `/mcp` dentro do Claude Code para conferir se o `saci` está conectado.

## Conecte o Cursor ou o VS Code

O Cursor lê `~/.cursor/mcp.json`, ou `.cursor/mcp.json` dentro do projeto:

```json
{
  "mcpServers": {
    "saci": {
      "url": "https://saci.cc/api/mcp",
      "headers": {
        "Authorization": "Bearer saci_..."
      }
    }
  }
}
```

O VS Code lê `.vscode/mcp.json`:

```json
{
  "servers": {
    "saci": {
      "type": "http",
      "url": "https://saci.cc/api/mcp",
      "headers": {
        "Authorization": "Bearer saci_..."
      }
    }
  }
}
```

Outros clientes que aceitam configuração em JSON costumam aceitar o formato do Cursor com `"type": "http"` ao lado da `url`. Seja qual for o cliente, o servidor precisa da chave no header `Authorization`. Se o arquivo fica num repositório, não faça commit dele com a chave dentro.

## As ferramentas

- `create_inbox`: cria um endereço. Ele é aleatório, a não ser que você passe `name` (de 3 a 32 letras, números, pontos, hifens ou sublinhados).
- `wait_for_email`: espera chegar um email e devolve o remetente, o assunto, a data e o `message_id`, sem o corpo. Dá para filtrar com `from_contains`, `subject_contains` e `after`, e o `timeout_seconds` vai até 25.
- `get_verification_code`: devolve só o código, como `482913`, esperando o email se ele ainda não chegou.
- `get_verification_link`: devolve o link para confirmar o email, entrar na conta (link mágico), ativar a conta ou trocar a senha, também esperando o email se precisar.
- `get_email`: lê um email em texto, ou em HTML com `format`, com os links, os anexos e o código de verificação.
- `list_emails`: lista os emails da caixa, do mais novo para o mais antigo.
- `get_attachment`: devolve um anexo. Arquivos de texto vêm como texto, imagens como imagem e o resto como um link de download que funciona por alguns minutos.
- `delete_email` e `delete_all_emails`: apagam um email ou todos os emails da caixa. Elas são marcadas como destrutivas, então o seu cliente pode pedir confirmação antes de rodar.

## Um exemplo

Um pedido assim:

```text
Crie um email temporário, faça o cadastro em https://exemplo.com com ele e me diga o código de verificação que chegar.
```

O agente faz o seguinte:

- Chama `create_inbox` e recebe um endereço como `a1b2c3d4e5f60718@saci.cc`.
- Preenche o formulário de cadastro com esse endereço. Para isso ele precisa de uma ferramenta de navegador própria, como um servidor MCP do Playwright; o saci.cc cuida só da parte do email.
- Chama `get_verification_code` com o endereço. Se nenhum código chegar em 25 segundos, a ferramenta avisa e o agente chama de novo.
- Digita o código no formulário, ou só conta para você qual é.

Quando o email traz um link de confirmação em vez de código, o agente chama `get_verification_link` e abre o link. Para outros links do email, ele chama `wait_for_email` e depois `get_email`.

Nem toda tarefa precisa de navegador. Você pode pedir para o agente conferir se o seu servidor de homologação manda o email de boas-vindas e se o link dele aponta para o domínio certo, ou para escrever e rodar um teste de ponta a ponta que usa o saci.cc. Para testes que rodam no CI sem agente, o [guia do Playwright](/blog/playwright-email-verification/) mostra o mesmo fluxo com o pacote do npm.

## Limites

- Cada espera dura no máximo 25 segundos. O agente chama de novo para continuar esperando, e as instruções do servidor dizem para ele fazer isso.
- 120 requisições por minuto por conta, divididas com a API e com todas as chaves da conta.
- As caixas criadas pelo MCP ficam privadas para a sua conta por 7 dias: só as suas chaves conseguem ler, e ninguém mais cria o mesmo nome.
- Os emails são apagados cerca de um dia depois de chegar. Não use essas caixas para contas que você quer manter, nem para nada sensível.
- Os endereços só recebem email. O agente não consegue enviar nem responder pelo saci.cc.
- Os conectores personalizados do Claude, no app e no claude.ai, não conseguem enviar headers, então não passam a chave e não funcionam com o saci.cc. Use o Claude Code ou outro cliente que aceite headers.

Todas as ferramentas e parâmetros estão na [página do MCP](https://saci.cc/mcp/). Se algo não funcionar, ou se precisar de um limite maior, escreva para oi@saci.cc.
