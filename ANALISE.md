# Análise da interseção: cálculo direto e aproximação de Newton

Este documento explica o modelo matemático da visualização, a comparação entre os métodos e a interpretação das métricas e do gráfico. A simulação é uma ferramenta didática: as posições mudam com o tempo, mas os cálculos de interseção são refeitos para a configuração atual a cada quadro.

## 1. O problema geométrico

O campo contém partículas circulares. A partir de uma origem fixa `o`, é traçado um raio em uma direção escolhida pelo ângulo `θ`. A pergunta é: **em que distância ao longo desse raio ocorre o primeiro contato com uma partícula?**

A direção é representada pelo vetor unitário

```text
d = (cos θ, sen θ)
```

Como `d` tem comprimento 1, o parâmetro `s` mede a distância percorrida no próprio raio. Um ponto qualquer do raio é

```text
p(s) = o + s·d,       0 ≤ s ≤ s_max
```

`s_max` é a distância até a borda do campo na direção escolhida. O campo desenha o vetor de direção como uma seta curta e o raio de busca como uma linha tracejada mais longa.

Para uma partícula de centro `c` e raio `r`, há contato quando a distância entre `p(s)` e `c` é igual a `r`. A condição é escrita como uma função:

```text
f(s) = ‖o + s·d − c‖² − r²
```

Assim:

- `f(s) > 0`: o ponto está fora do círculo;
- `f(s) = 0`: o ponto está na circunferência — há interseção;
- `f(s) < 0`: o ponto está dentro do círculo.

O problema de interseção, portanto, equivale a encontrar uma raiz de `f(s)` dentro do intervalo do raio.

## 2. Método I — cálculo direto

Defina `q = o − c`. Como `d` é unitário, a equação pode ser expandida para uma quadrática:

```text
f(s) = s² + 2(q·d)s + (q·q − r²) = 0
```

Também é possível separar a posição do centro em uma componente paralela e outra perpendicular ao raio. Seja `t = (c − o)·d` a projeção do centro sobre a direção e `h²` a distância perpendicular ao raio ao quadrado. Se `h > r`, o raio passa longe demais e não há interseção. Caso contrário, as raízes são

```text
s = t ± √(r² − h²)
```

O cálculo direto mantém as raízes que pertencem ao raio (`0 ≤ s ≤ s_max`) e escolhe a menor. É a referência analítica da comparação: resolve a equação quadrática diretamente, sem procurar a raiz por tentativas sucessivas.

Se o raio for tangente ao círculo, as duas raízes coincidem. Se a origem estiver dentro de um círculo, a raiz não negativa pode representar a saída do círculo, não uma entrada. Na configuração usual, a origem fica fora das partículas.

## 3. Método II — aproximação de Newton–Raphson

Newton começa com uma estimativa `s₀` e a corrige repetidamente usando a função e sua derivada:

```text
sₙ₊₁ = sₙ − f(sₙ) / f′(sₙ)
```

Para a função de contato deste modelo,

```text
f′(s) = 2(o + s·d − c)·d
```

A estimativa inicial usada pela simulação é a projeção do centro da partícula no raio, menos o raio da partícula, limitada a zero:

```text
s₀ = max(0, (c − o)·d − r)
```

Essa estimativa funciona como ponto de partida; não é, em geral, a raiz exata. A cada iteração, Newton usa a inclinação local de `f` para tentar aproximar a raiz.

### Exemplo numérico

Considere uma partícula de raio `18 px`, cujo centro está projetado a `100 px` da origem, e cuja distância perpendicular ao raio é `5 px`.

O cálculo direto encontra a raiz de entrada:

```text
s = 100 − √(18² − 5²)
  ≈ 82,709 px
```

Newton começa em `s₀ = 100 − 18 = 82 px`. Nesse ponto, `f(82) = 25 px²` e `f′(82) = −36 px`. A primeira correção resulta em aproximadamente `s₁ = 82,694 px`; as seguintes refinam a estimativa até ela ficar muito próxima de `82,709 px`.

Na implementação, o processo tem limite de 20 iterações. Ele para quando o resíduo `|f(s)|` fica abaixo de `0,02 px²`, quando a derivada é muito pequena ou quando o próximo passo sai do intervalo permitido. Se isso ocorrer antes de atingir o critério de parada, Newton é reportado como não convergido para aquela interseção.

## 4. Como ler os resultados

### No campo cartesiano

- **Seta azul `d`**: direção do raio.
- **Linha tracejada**: caminho em que a interseção é procurada.
- **Círculos numerados**: partículas móveis.
- **Marcador verde**: interseção do cálculo direto.
- **Marcador laranja**: resultado da aproximação de Newton.

Quando os dois marcadores aparecem quase sobrepostos, os métodos encontraram praticamente o mesmo ponto. O ângulo do raio e as posições das partículas podem ser alterados; as interseções são recalculadas durante a animação.

### Nas métricas

| Métrica | Interpretação |
| --- | --- |
| **Cálculo direto** | Valor de `s` para a primeira interseção analítica encontrada no raio. |
| **Aproximação** | Valor de `s` produzido por Newton para a primeira interseção numérica encontrada. O detalhe também informa a partícula, a contagem reportada de iterações e o resíduo. |
| **Diferença entre métodos** | Distância entre os pontos de contato calculados, exibida apenas quando os métodos identificam a mesma partícula. |

Como os pontos comparados estão na mesma direção e `d` é unitário, essa distância é equivalente a `|s_direto − s_Newton|`. Os valores são arredondados na tela; por isso, uma diferença exibida como `0,00 px` pode ser pequena, mas não necessariamente zero exato.

Os métodos escolhem suas primeiras interseções de forma independente. Em alguns casos, um método pode não convergir ou pode selecionar outra partícula. Nessa situação, a diferença entre pontos não é apresentada, pois comparar alvos diferentes não seria uma medida válida do erro de aproximação.

### No gráfico de convergência

O gráfico mostra a função de contato `f(s)` para uma partícula e para a configuração atual da simulação:

- **Eixo horizontal**: distância `s` ao longo do raio, em pixels do campo.
- **Eixo vertical**: valor de `f(s)`, em unidades de pixel ao quadrado (`px²`).
- **Curva azul**: valor da função conforme `s` aumenta. A curva é quadrática.
- **Linha horizontal `f(s) = 0`**: nível em que ocorre contato com a circunferência.
- **Linha e ponto verdes**: primeira raiz direta daquela partícula, quando existe.
- **Marcadores laranja**: posições sucessivas avaliadas por Newton sobre a curva; o preenchido é a última estimativa.

O cruzamento da curva com `f(s) = 0` representa uma interseção. Em uma passagem completa pelo círculo, a parábola pode cruzar esse nível duas vezes: entrada e saída. O marcador verde destaca a primeira raiz válida no sentido do raio.

O gráfico é atualizado com a posição atual das partículas; **não é um histórico ao longo do tempo**. Se nenhuma partícula tiver interseção analítica, ele seleciona uma partícula próxima ao raio para ainda mostrar seu perfil de contato. Nesse caso, a curva pode não cruzar `f(s) = 0` e não haverá marcador verde.

## 5. Hipóteses e limitações

1. **Partículas circulares e raio retilíneo.** A forma e o caminho são simplificados para permitir uma equação quadrática.
2. **Sem colisões entre partículas.** Cada partícula se move e rebate nos limites do campo, mas não interage com as demais.
3. **Unidades da visualização.** O campo é desenhado em coordenadas de canvas; as distâncias de contato aparecem em pixels. Os rótulos dos eixos do campo são uma escala visual simplificada.
4. **Newton não é garantido em todos os casos.** Tangências, derivadas próximas de zero, passos fora do raio ou estimativas iniciais inadequadas podem impedir a convergência.
5. **Tolerância numérica.** O resíduo é medido em `px²`, enquanto as distâncias e a diferença entre pontos são exibidas em `px`; são grandezas diferentes.
6. **Raio configurável.** O slider altera o raio geométrico das partículas existentes e das adicionadas. Mudar o raio também altera a própria equação de contato e, portanto, os resultados dos dois métodos.

## 6. Roteiro de exploração

1. Pause a animação para observar uma configuração fixa.
2. Use o ângulo do raio até encontrar uma partícula e observe os marcadores no campo.
3. Compare os valores de `s` do cálculo direto e de Newton e confira o resíduo e a diferença.
4. No gráfico, acompanhe os marcadores laranja em direção ao nível `f(s) = 0` e compare a estimativa final com a raiz verde.
5. Aumente ou reduza o raio da partícula. Observe como mudam a curva, a interseção e o resultado numérico.
6. Experimente uma tangência ou uma direção sem interseção para observar quando Newton deixa de convergir.

## 7. Resumo

O cálculo direto fornece uma solução analítica da interseção reta–círculo e serve como referência. Newton–Raphson aproxima uma raiz por correções sucessivas. A visualização compara ambos para a mesma geometria e apresenta três sinais complementares: a distância de contato, o resíduo do método numérico e a diferença espacial entre os pontos previstos.
