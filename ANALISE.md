# Análise da interseção: referência analítica, preditores temporais e corretor de Newton

Este documento explica o modelo matemático da visualização, a comparação entre os métodos e a interpretação das métricas e dos gráficos. A simulação é uma ferramenta didática: a cada quadro, dois preditores temporais estimam a interseção e Newton corrige as estimativas para a configuração atual; uma solução analítica serve de referência.

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

## 3. Métodos numéricos — preditores e corretor de Newton

Para aproveitar a continuidade temporal, a simulação guarda as últimas raízes corrigidas de cada partícula que cruza o raio. No primeiro quadro (ou quando não há uma raiz anterior válida), os dois métodos começam pela estimativa geométrica da projeção do centro:

```text
s_geom = max(0, (c − o)·d − r)
```

### Preditor de ordem zero

O preditor de ordem zero supõe que a raiz não mudou desde o quadro anterior:

```text
s⁽⁰⁾ₙ₊₁ = sₙ
```

### Preditor de Euler de primeira ordem

O preditor de Euler estima a taxa de variação de `s` usando as duas raízes corrigidas mais recentes e avança essa taxa pelo intervalo atual `Δt`:

```text
ds/dt ≈ (sₙ − sₙ₋₁) / Δtₙ
sᴱₙ₊₁ = sₙ + Δtₙ₊₁ · (sₙ − sₙ₋₁) / Δtₙ
```

Se ainda não há duas raízes anteriores, Euler usa o preditor de ordem zero até que haja histórico suficiente.

### Corretor de Newton

Cada preditor é corrigido separadamente para resolver `f(s)=0` na geometria atual. A correção usa a função e sua derivada:

```text
sₖ₊₁ = sₖ − f(sₖ) / f′(sₖ)
```

Para a função de contato deste modelo, a derivada é

```text
f′(s) = 2(o + s·d − c)·d
```

Newton usa a inclinação local de `f` para refinar cada predição até o resíduo ficar abaixo da tolerância ou até ocorrer uma condição de falha.

### Exemplo numérico

Considere uma partícula de raio `18 px`, cujo centro está projetado a `100 px` da origem, e cuja distância perpendicular ao raio é `5 px`.

O cálculo direto encontra a raiz de entrada:

```text
s = 100 − √(18² − 5²)
  ≈ 82,709 px
```

No primeiro quadro, use a estimativa geométrica `s_geom = 100 − 18 = 82 px`. Como ainda não há histórico, os dois preditores começam nesse valor. Nesse ponto, `f(82) = 25 px²` e `f′(82) = −36 px`; as correções de Newton refinam a estimativa até ela ficar muito próxima da raiz analítica `82,709 px`. Nos quadros seguintes, os preditores partem das raízes corrigidas anteriores.

Na implementação, cada corretor tem limite de 20 iterações. Ele para quando o resíduo `|f(s)|` fica abaixo de `0,02 px²`, quando a derivada é muito pequena ou quando o próximo passo sai do intervalo permitido. Se isso ocorrer antes de atingir o critério de parada, aquele preditor é reportado como não convergido.

## 4. Como ler os resultados

### No campo cartesiano

- **Seta azul `d`**: direção do raio.
- **Linha tracejada**: caminho em que a interseção é procurada.
- **Círculos numerados**: partículas móveis.
- **Marcador verde**: interseção do cálculo direto.
- **Marcadores roxo e azul**: raízes corrigidas por Newton após os preditores de ordem zero e Euler.

Quando os dois marcadores aparecem quase sobrepostos, os métodos encontraram praticamente o mesmo ponto. O ângulo do raio e as posições das partículas podem ser alterados; as interseções são recalculadas durante a animação.

### Nas métricas

| Métrica | Interpretação |
| --- | --- |
| **Cálculo direto** | Valor de `s` para a primeira interseção analítica encontrada no raio. |
| **Preditor ordem 0 + Newton** | Raiz corrigida após manter o último valor de `s` como predição. |
| **Preditor Euler + Newton** | Raiz corrigida após extrapolar a variação temporal de `s`. |

O gráfico de erro exibe, para a primeira interseção analítica de cada quadro, o erro absoluto `|s_pred − s_direto|` antes da correção e `|s_corrigido − s_direto|` depois dela. Como `d` é unitário, esses erros em `s` também são erros espaciais em pixels. Linhas tracejadas são as predições; linhas contínuas são os resultados corrigidos. O histórico mostra até 240 quadros recentes. Se não houver interseção analítica ou um método não convergir, a série correspondente fica interrompida.

Os cartões de ordem zero e Euler selecionam sua primeira interseção numérica independentemente; ela pode ser uma partícula diferente da primeira raiz analítica. O gráfico de erro evita essa comparação entre alvos: ambos os métodos são avaliados contra a mesma partícula selecionada pela referência analítica.

### No gráfico de convergência

O gráfico mostra a função de contato `f(s)` para uma partícula e para a configuração atual da simulação:

- **Eixo horizontal**: distância `s` ao longo do raio, em pixels do campo.
- **Eixo vertical**: valor de `f(s)`, em unidades de pixel ao quadrado (`px²`).
- **Curva azul**: valor da função conforme `s` aumenta. A curva é quadrática.
- **Linha horizontal `f(s) = 0`**: nível em que ocorre contato com a circunferência.
- **Linha e ponto verdes**: primeira raiz direta daquela partícula, quando existe.
- **Marcadores roxos e azuis**: predições e correções sucessivas de Newton para os dois métodos; o preenchido é a última estimativa.

O cruzamento da curva com `f(s) = 0` representa uma interseção. Em uma passagem completa pelo círculo, a parábola pode cruzar esse nível duas vezes: entrada e saída. O marcador verde destaca a primeira raiz válida no sentido do raio.

O gráfico é atualizado com a posição atual das partículas; **não é um histórico ao longo do tempo**. Se nenhuma partícula tiver interseção analítica, ele seleciona uma partícula próxima ao raio para ainda mostrar seu perfil de contato. Nesse caso, a curva pode não cruzar `f(s) = 0` e não haverá marcador verde.

## 5. Hipóteses e limitações

1. **Partículas circulares e raio retilíneo.** A forma e o caminho são simplificados para permitir uma equação quadrática.
2. **Sem colisões entre partículas.** Cada partícula se move e rebate nos limites do campo, mas não interage com as demais.
3. **Unidades da visualização.** O campo é desenhado em coordenadas de canvas; as distâncias de contato aparecem em pixels. Os rótulos dos eixos do campo são uma escala visual simplificada.
4. **Newton não é garantido em todos os casos.** Tangências, derivadas próximas de zero, passos fora do raio ou predições temporais inadequadas podem impedir a convergência.
5. **Tolerância numérica.** O resíduo é medido em `px²`, enquanto as distâncias e os erros são exibidos em `px`; são grandezas diferentes.
6. **Raio configurável.** O slider altera o raio geométrico das partículas existentes e das adicionadas. Mudar o raio também altera a própria equação de contato e, portanto, os resultados dos dois métodos.

## 6. Roteiro de exploração

1. Pause a animação para observar uma configuração fixa.
2. Use o ângulo do raio até encontrar uma partícula e observe os marcadores no campo.
3. Compare o cálculo direto com as raízes corrigidas dos preditores de ordem zero e Euler.
4. Nos gráficos, acompanhe as correções de Newton em direção a `f(s) = 0` e compare o erro antes e depois da correção.
5. Aumente ou reduza o raio da partícula. Observe como mudam a curva, a interseção e o resultado numérico.
6. Experimente uma tangência ou uma direção sem interseção para observar quando Newton deixa de convergir.

## 7. Resumo

O cálculo direto fornece uma solução analítica da interseção reta–círculo e serve como referência. Os preditores de ordem zero e Euler estimam a raiz a partir do histórico temporal; Newton corrige cada estimativa para a geometria atual. A visualização compara os resultados e plota os erros antes e depois da correção.
