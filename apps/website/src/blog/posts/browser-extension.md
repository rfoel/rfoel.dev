O site pede um email para continuar o cadastro. Com a extensão do saci.cc, você clica no ícone, copia um endereço temporário e o email chega no próprio popup, sem abrir outra aba. O código de verificação e o link de confirmação já aparecem prontos para usar, e dá para preencher o campo com o botão direito.

![Popup da extensão do saci.cc com o endereço e a caixa de entrada](/blog/browser-extension/popup-pt.webp)

## Como instalar

- **Chrome, Edge e Brave**: instale pela [Chrome Web Store](https://chromewebstore.google.com/detail/sacicc/ilamfnhbcgmcjlngopdildcbgookdgnl). No Edge, permita extensões de outras lojas quando ele perguntar. Precisa do Chrome 127 ou mais novo.
- **Firefox**: use o botão "Adicionar ao Firefox" na [página inicial](https://saci.cc/). O Firefox pergunta se você permite que o saci.cc instale a extensão; é só confirmar. Ela não está na loja da Mozilla, mas cada versão é assinada pela Mozilla, e o Firefox atualiza sozinho. Precisa do Firefox 140 ou mais novo.

É grátis e não pede cadastro. Ela fala português, inglês e espanhol, conforme o idioma do navegador.

## O que ela faz

### Um endereço a um clique

Ao abrir o popup pela primeira vez, você ganha um endereço aleatório, como `3378845e2627adc8@saci.cc`. O botão vermelho copia o endereço. **Escolher nome** cria um endereço com o nome que você quiser, e **Trocar endereço** gera outro aleatório. O endereço da extensão é separado do que você usa no site.

### A caixa de entrada no popup

Os emails aparecem no popup com remetente, assunto e hora. Clicando num email, ele abre ali mesmo, com o HTML, a versão em texto e os anexos para baixar. Dá para apagar um email ou esvaziar a caixa.

### O código e o link prontos

Quando o email tem um código de verificação ou um link para confirmar o endereço, entrar na conta ou trocar a senha, a linha dele mostra um botão para copiar o código ou abrir o link numa nova aba. Não precisa nem abrir o email. Ao abrir, o código e o link ficam no topo:

![Email aberto no popup, com o código de verificação e o link de confirmação no topo](/blog/browser-extension/email-pt.webp)

### Avisos com o popup fechado

A extensão confere a caixa a cada minuto, mesmo com o popup fechado. Quando chega email, aparece um aviso do sistema com o remetente, o assunto e o código, se tiver. Clicar no aviso copia o código; se o email só tem link, abre o link; se não tem nenhum dos dois, abre o popup. O ícone mostra quantos emails você ainda não abriu. O sino no topo da caixa liga e desliga os avisos.

### Preencher com o botão direito

Clique com o botão direito num campo de texto e escolha **Preencher com um email do saci** para colocar o endereço. Depois que chega um código, aparece também **Preencher o código**, com o código no nome do item. A extensão só mexe na página nessa hora, no campo em que você clicou.

## As permissões

- **Armazenamento**: guarda o endereço, os emails que você já abriu, o último código e se os avisos estão ligados.
- **Alarmes**: confere a caixa a cada minuto com o popup fechado.
- **Notificações**: os avisos de email novo.
- **Menu de contexto**, **aba ativa** e **scripts**: os itens do botão direito, que preenchem só o campo clicado, na aba e no momento em que você escolhe.
- **Área de transferência**: copia o código quando você clica no aviso.
- No Chrome, **documento offscreen**: uma página escondida que copia o código e faz a verificação contra robôs, coisas que o service worker do Chrome não consegue fazer sozinho.

Ela não lê as páginas que você visita nem pede acesso a outros sites.

## Privacidade

Valem as mesmas regras do site. Os emails são apagados cerca de um dia depois de chegar. Não existe senha: quem souber o endereço consegue ver a caixa, por isso os endereços aleatórios são longos. Não use para contas importantes, banco ou qualquer coisa privada. Para separar pessoas de robôs, a extensão usa o Cloudflare Turnstile, uma verificação invisível. Os detalhes estão na [política de privacidade](https://saci.cc/privacy/).

## Perguntas

- **Funciona no Safari?** Não, só nos navegadores acima.
- **E no celular?** Também não. No celular, use o [site](https://saci.cc/), que funciona igual.
- **Dá para usar o mesmo endereço no site e na extensão?** São endereços separados, mas você pode abrir qualquer endereço no site escolhendo o mesmo nome em **Escolher nome**. Lembre que um nome escolhido é fácil de adivinhar.
- **Ela é paga?** Não, e não pede cadastro.

O [post sobre links de confirmação](/blog/verification-links/) conta mais sobre como o saci.cc encontra o código e o link. Se algo não funcionar na extensão, escreva para oi@saci.cc.
