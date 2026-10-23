# Métodos numéricos usados na interseção

## Resumo

A simulação calcula, a cada quadro, onde o raio encontra as partículas circulares. Para cada partícula, compara uma referência analítica com duas estimativas preditoras — **ordem zero** e **Euler de primeira ordem** —, e aplica o **corretor de Newton** a cada predição.

A implementação principal está em `app.js`.

O parâmetro `s` é a distância ao longo do raio. A função cuja raiz representa o contato é

```text
f(s) = ‖o + s·d − c‖² − r²
```

em que `o` é a origem, `d` é a direção unitária, `c` é o centro da partícula e `r` é seu raio.

## Onde cada método é usado

### Referência analítica

`exactIntersection` resolve diretamente a interseção reta–círculo e escolhe a menor raiz não negativa que ainda está dentro do campo. Ela não é um preditor: serve como referência para comparar os resultados numéricos e medir seus erros.

### Preditor de ordem zero

Em quadros sucessivos, o preditor de ordem zero mantém o último valor corrigido de `s` para aquela partícula:

```text
s⁽⁰⁾ₙ₊₁ = sₙ
```

Ele é usado como ponto de partida do corretor de Newton. No primeiro quadro — ou quando não existe histórico válido —, usa-se uma estimativa geométrica baseada na projeção do centro da partícula sobre o raio.

### Preditor de Euler de primeira ordem

Quando já há histórico suficiente, Euler estima a taxa de variação de `s` a partir das duas últimas raízes corrigidas e a extrapola para o quadro atual:

```text
ds/dt ≈ (sₙ − sₙ₋₁) / Δtₙ
sᴱₙ₊₁ = sₙ + Δtₙ₊₁ · (sₙ − sₙ₋₁) / Δtₙ
```

Essa previsão também é enviada ao corretor de Newton. Sem duas raízes anteriores, Euler começa com a mesma estimativa do preditor de ordem zero.

### Corretor de Newton

Newton corrige separadamente cada predição para a configuração atual da partícula e do raio:

```text
sₖ₊₁ = sₖ − f(sₖ) / f′(sₖ)
f′(s) = 2(o + s·d − c)·d
```

O processo aceita no máximo 20 correções e considera convergido quando `|f(s)| < 0,02 px²`. Derivada quase nula, passo inválido ou falta de convergência impedem que a estimativa seja apresentada como interseção válida.

## Principais funções no código

| Função ou variável | Responsabilidade |
| --- | --- |
| `exactIntersection(ball, d, maxS)` | Calcula a raiz analítica de referência no raio limitado pelo campo. |
| `initialGuess(ball, d)` | Gera a estimativa geométrica inicial quando ainda não há histórico temporal válido. |
| `newtonCorrector(ball, d, maxS, predictor, predictorKind)` | Aplica Newton a um preditor e guarda os pontos avaliados para o gráfico de convergência. |
| `calculatePredictions(dt, advanceHistory)` | Calcula, para cada partícula, as referências e os dois pares preditor–corretor; também atualiza o histórico e os erros. |
| `rootHistory` | Guarda, por partícula, as raízes corrigidas anteriores usadas pelos preditores temporais. |
| `firstHit(method)` | Seleciona a interseção válida mais próxima para um dos métodos. |
| `updateMetrics()` | Atualiza os valores de `s` exibidos para a referência e para os dois métodos corrigidos. |
| `drawFunctionPlot()` | Desenha `f(s)`, a raiz analítica e os caminhos de predição e correção de Newton. |
| `drawErrorPlot()` | Desenha o erro absoluto temporal das predições e dos resultados corrigidos. |
| `frame(now)` | Avança a simulação e chama o cálculo das interseções com o intervalo de tempo do quadro. |

O `update(dt)` também usa avanço explícito por Euler para mover as partículas com velocidade constante. Esse avanço da animação é separado do **preditor de Euler usado para estimar a interseção**; os dois têm funções distintas no programa.

## Como interpretar os erros

O gráfico temporal acompanha a primeira interseção escolhida pela referência analítica e mostra quatro séries:

- **O(0) preditor**: erro absoluto entre a previsão constante e a raiz analítica;
- **O(0) + Newton**: erro da raiz depois das correções de Newton;
- **Euler preditor**: erro absoluto da extrapolação de primeira ordem;
- **Euler + Newton**: erro da raiz depois das correções de Newton.

As linhas tracejadas são as predições; as contínuas, os resultados corrigidos. Se não houver interseção ou um método não convergir, a série correspondente é interrompida. O gráfico mantém os 240 quadros mais recentes.

Os cartões de resultados escolhem a primeira interseção válida de cada método de forma independente. Já o gráfico de erro compara os dois métodos contra a **mesma partícula da primeira interseção analítica**, para não misturar erros de alvos diferentes.

## O que se pode concluir

1. O preditor de ordem zero é simples e não precisa estimar a velocidade de mudança da raiz, mas pode ficar defasado quando a interseção se desloca entre quadros.
2. Euler de primeira ordem usa essa tendência temporal. Quando o movimento é suave e há histórico válido, tende a fornecer um ponto de partida melhor; mudanças bruscas ou troca da partícula atingida podem degradar a previsão.
3. Se os dois corretores convergirem para a mesma raiz, os resultados finais devem ficar próximos, pois ambos resolvem a mesma equação `f(s)=0`. A principal diferença esperada aparece no erro **antes** da correção e na quantidade de iterações de Newton.
4. Newton melhora as previsões, mas não tem convergência garantida: tangências, derivadas pequenas e estimativas inadequadas podem causar falha. O cálculo analítico permanece como referência para verificar o erro.
