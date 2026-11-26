<p class="lede">Kaitenmate é xadrez no sushi de esteira. Cada metade do tabuleiro é uma esteira que empurra as peças para uma bandeja fixa no meio. Até a versão 0.10.0, o momento desse empurrão dava, sem ninguém perceber, a maioria das partidas às brancas. Quem notou primeiro não foi uma pessoa.</p>

## A regra antiga

A cada duas rodadas, a esteira inteira andava, sempre logo depois do lance das pretas. As duas metades avançavam uma casa para o meio ao mesmo tempo. Aí as brancas jogavam.

Parece inofensivo, mas significa que as brancas sempre veem primeiro o tabuleiro empurrado. As brancas reagem ao empurrão; as pretas precisam prever. Se o empurrão deixa o seu rei numa casa ruim, quem pode punir são as brancas.

## O relato

O Kaitenmate tem uma API e um servidor MCP para agentes de IA jogarem. Um deles, o Claude Opus jogando pelo MCP, mandou isto pelo botão de feedback depois de seis partidas contra o robô médio:

- Ganhou as 4 partidas de brancas e perdeu as 2 de pretas.
- As duas derrotas tiveram o mesmo padrão: o rei estava na fileira 6, o empurrão o levou para a bandeja fixa e ele caiu num ataque.

Ele mesmo disse que a amostra era pequena demais para provar algo e propôs um teste: jogar algumas centenas de partidas de robô contra robô, no mesmo nível, e ver a taxa de vitória por cor. Se as brancas ganhassem bem mais que 55%, a culpa era da regra, não do acaso.

Também sugeriu quatro correções, nesta ordem:

1. **Split:** cada metade anda logo antes da vez do seu lado. A metade das pretas anda depois do lance das brancas, a das brancas depois do lance das pretas.
2. **Alternar:** a esteira inteira anda uma vez depois do lance das brancas e na seguinte depois do lance das pretas.
3. **Empurrão que protege o rei:** mantém o momento antigo, mas o empurrão nunca leva um rei para uma casa atacada.
4. Compensar as pretas de outro jeito.

## O experimento

Pedi ao Claude Code para montar o teste que o agente descreveu. O simulador põe o robô para jogar contra ele mesmo, então os dois lados têm exatamente a mesma força. Ele usa os mesmos seeds em todas as regras: cada regra joga as mesmas aberturas com as mesmas peças chegando, e a comparação fica justa.

Rodou nos dois estilos do jogo. No aleatório, peças sorteadas chegam sem parar pela fila de cada lado. No competitivo, o estilo das partidas ranqueadas, os dois lados recebem as mesmas 12 peças na mesma ordem.

O número que importa é **a fatia das brancas nas partidas decididas**: as vitórias das brancas divididas por todas as partidas que alguém ganhou. 50% é justo.

### Robô médio: 2.400 partidas

O robô médio enxerga 2 lances: o dele e a resposta. Jogou 300 partidas por regra e estilo.

| Regra                      | Aleatório | Competitivo |
| -------------------------- | --------- | ----------- |
| Regra antiga               | **72,5%** | **83,0%**   |
| Split                      | 44,0%     | 41,4%       |
| Alternar                   | 49,5%     | 46,7%       |
| Empurrão que protege o rei | 64,9%     | 78,3%       |

O agente tinha razão. Na regra antiga, as brancas ganhavam quase três de cada quatro partidas decididas no aleatório e mais de quatro de cada cinco no competitivo. Os intervalos de confiança de 95% ficavam bem acima de 55%.

O empurrão que protege o rei quase não ajudou, como o próprio agente previu. Alternar parecia o vencedor, e o split parecia corrigir demais, a favor das pretas.

### Robô difícil: mais 600 partidas

O robô médio não vê o empurrão chegando, então parte do desequilíbrio podia vir de ele cair no empurrão sem querer. O robô difícil enxerga 4 lances e vê o empurrão. Ele é bem mais lento, então jogou 100 partidas por regra e estilo.

| Regra        | Médio, aleatório | Médio, competitivo | Difícil, aleatório | Difícil, competitivo |
| ------------ | ---------------- | ------------------ | ------------------ | -------------------- |
| Regra antiga | 72,5%            | 83,0%              | 60,0%              | **78,8%**            |
| Split        | 44,0%            | 41,4%              | 45,0%              | **53,4%**            |
| Alternar     | 49,5%            | 46,7%              | 58,0%              | 41,6%                |

O robô difícil mudou a resposta:

- **A regra antiga** continuou favorecendo as brancas. No competitivo, as brancas ganharam 67% de todas as partidas e as pretas só 18%, mesmo com um robô que vê o empurrão chegando.
- **Alternar** ficou instável: 58% no aleatório, 42% no competitivo. Ganha quem pega o empurrão no momento crítico, justamente o risco que o agente tinha apontado.
- **O split** foi a única regra que ficou perto do equilíbrio nos quatro cenários, entre 41% e 53%.

## A regra nova

A versão 0.10.0 passou para o split. A cada duas rodadas, a metade do seu lado anda logo antes da sua vez: a das pretas depois do lance das brancas, a das brancas depois do lance das pretas. Cada jogador vê primeiro o empurrão das próprias peças.

Alguns detalhes que vieram junto:

- Partidas em andamento e replays de partidas antigas continuam com as regras com que foram jogadas. Toda partida salva guarda a versão das regras.
- O contador da esteira no jogo diz que lado anda em seguida, e só aquela metade da esteira roda.
- Os agentes ganharam o campo `conveyor_next`, e a prévia do empurrão mostra só a metade que anda.

Com a regra no ar, o agente recebeu uma resposta com os números.

O mesmo agente tinha mandado um segundo relato, de uma partida em que o empurrão deixou o rei dele sem nenhuma casa segura. A versão 0.11.0 trouxe um aviso para os agentes: quando a esteira anda logo depois do lance deles, o jogo confere cada lance legal com o empurrão e diz quantos deixam o rei seguro.

## O que ainda não sabemos

- **Robô não é gente.** O simulador mede a regra, não como as pessoas jogam com ela. Vou acompanhar as partidas ranqueadas.
- **Amostras pequenas no difícil.** 100 partidas por cenário dão intervalos largos. O split com 45% no aleatório pode ser uma leve vantagem das pretas, ou nada. Uma rodada maior diria.

Se você joga Kaitenmate, na mão ou por um agente, e algo parecer injusto, use o botão de feedback. Essa mudança toda começou ali.
