Um email temporário (ou descartável) é um endereço que você usa por pouco tempo e depois esquece. Ele serve bem para cadastros em que você não confia, downloads que pedem email e testes, porque o spam e as newsletters vão parar num lugar que você nunca mais vai abrir. Ele não serve para contas que você pode precisar recuperar, para banco ou para nada privado: os emails somem depois de um tempo e, na maioria dos serviços, quem souber o endereço consegue ler a caixa.

## O que é um email temporário

Você pode ter visto com outros nomes: email descartável, email anônimo, email fake. A ideia é a mesma: você ganha um endereço que funciona na hora, sem cadastro e sem senha. Os emails que chegam aparecem numa página por um tempo e depois são apagados. Normalmente dá só para receber, não para enviar.

Não é a mesma coisa que um alias do seu provedor de email. O alias encaminha para a sua caixa de verdade e dura o quanto você quiser. O endereço temporário é separado do seu email e não dura.

## Quando vale a pena

- Cadastros em que você não quer deixar o seu email: um fórum que vai visitar uma vez, um período de teste grátis, o wifi de um lugar, um cupom, um PDF que pede email antes do download.
- Fugir de newsletters e spam. Muitos sites colocam você numa lista de emails assim que você se cadastra, e alguns passam essa lista adiante. O endereço temporário segura isso no lugar da sua caixa.
- Ver o que um site manda antes de confiar o seu email de verdade a ele.
- Testes. Quem desenvolve ou testa software precisa de endereços novos o tempo todo para testar cadastro, código de verificação e recuperação de senha.

## Quando não vale

- Contas que você quer manter. Se esquecer a senha, o email de recuperação vai para um endereço que você não tem mais. No saci.cc, os emails são apagados cerca de um dia depois de chegar, então um link de recuperação mandado no mês que vem não chega a ninguém que você conheça.
- Banco, serviços do governo, saúde, trabalho ou qualquer coisa com dados pessoais ou financeiros.
- Qualquer coisa privada. No site do saci.cc não tem senha: quem souber o endereço consegue abrir a caixa. Endereços aleatórios são difíceis de adivinhar, mas difícil de adivinhar não é o mesmo que protegido.
- Compras em que você vai querer o recibo, a garantia ou os emails de rastreio depois.
- Sites que bloqueiam domínios temporários. Alguns têm uma lista e recusam esses endereços no cadastro. A decisão é deles, e a saída é usar um endereço de verdade ali.

Uma regra simples: se perder a conta, ou alguém ler o email, for um problema, use o seu email de verdade ou um alias.

## Como o saci.cc funciona

Na [página inicial](https://saci.cc/) você ganha um endereço na hora, sem cadastro. Fique com o aleatório, como `a1b2c3d4e5f60718@saci.cc`, ou escolha um nome, como `maria.teste@saci.cc`. Um nome escolhido é fácil de adivinhar, então quem tentar consegue ler aquela caixa. O aleatório é mais seguro.

Os emails aparecem na página sozinhos; ela procura novos a cada 5 segundos e pode avisar com uma notificação do navegador. Quando o email traz um código de verificação, o saci.cc encontra e mostra o código para você copiar com um clique. Quando traz um botão para confirmar o email ou entrar na conta, aparece um "Abrir link" na lista, sem precisar abrir o email. Dá para baixar os anexos. Você pode apagar um email ou esvaziar a caixa quando quiser, e tudo é apagado cerca de um dia depois de chegar de qualquer jeito.

Os endereços só recebem email. Não dá para enviar nem responder pelo saci.cc.

## A extensão para o navegador

Existe uma extensão para Firefox e Chrome; no Edge e no Brave, a versão do Chrome funciona. Ela deixa o seu endereço do saci.cc a um clique enquanto você se cadastra em outro site. Com o botão direito, ela preenche o endereço ou o código, avisa quando chega um email com o código, e o ícone mostra quantos emails você ainda não abriu. Como o site, não pede cadastro. Os links para instalar estão na [página inicial](https://saci.cc/).

## Para quem desenvolve e para agentes de IA

Se você testa cadastros de forma automática, a [API HTTP](https://saci.cc/docs/) e o [servidor MCP](https://saci.cc/mcp/) deixam um script ou um agente de IA criar caixas e ler códigos. Eles pedem uma chave grátis, criada entrando com o GitHub. As caixas criadas com chave ficam privadas para a sua conta por 7 dias, o que não acontece com as do site. Tem um passo a passo para [testes com Playwright](/blog/playwright-email-verification/) e outro para [agentes de IA](/blog/email-for-ai-agents/).

## Perguntas frequentes

### É seguro usar um email temporário?

Para cadastros sem importância, sim. Ele tira o seu endereço de verdade das listas de email e do próximo vazamento de dados. Não é seguro para nada privado, porque as caixas criadas no site do saci.cc podem ser lidas por quem tiver o endereço.

### Quanto tempo os emails ficam no saci.cc?

Cerca de um dia depois de chegar. Depois disso são apagados de vez, junto com os anexos. Você pode apagar antes, se quiser.

### Dá para enviar email pelo saci.cc?

Não. Os endereços só recebem.

### Por que um site recusou o meu endereço do saci.cc?

Alguns sites têm uma lista de domínios de email temporário e recusam esses endereços no cadastro. O saci.cc não tem como mudar isso. Use outro endereço nesse site.

### Preciso de conta? É grátis?

O site e a extensão são grátis e não pedem conta. A API e o servidor MCP pedem uma chave, também grátis, que você cria entrando com o GitHub. Dúvidas: oi@saci.cc.
