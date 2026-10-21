# Trajetória — laboratório de interseções

Visualização didática em HTML, CSS e JavaScript puro para comparar o cálculo direto de uma interseção com a aproximação iterativa de Newton–Raphson.

## Como executar

Abra `index.html` em um navegador moderno. Não é necessário instalar dependências nem iniciar um servidor.

## O que observar

- Arraste no plano cartesiano ou use o controle deslizante para alterar a direção do raio.
- Ajuste a velocidade da animação e das partículas.
- Use o controle de raio para aumentar ou reduzir o tamanho das partículas.
- Pause, reinicie ou adicione partículas para explorar outros cenários.
- Compare a raiz calculada diretamente com a aproximação de Newton, o número de iterações e o resíduo.
- Observe no gráfico o perfil da função de contato e as estimativas sucessivas do método numérico.

As interseções são recalculadas a cada quadro usando a posição atual das partículas. Elas refletem nos limites do plano; não há colisões entre partículas.

## Métodos

Para a distância `s` ao longo do raio, a interseção ocorre quando

```text
f(s) = ‖origem + s·d − centro‖² − r² = 0
```

em que `d` é o vetor unitário na direção do raio e `r` é o raio da partícula. A referência resolve a equação quadrática e seleciona a menor raiz não negativa dentro do campo. Newton parte de uma estimativa pela projeção do centro da partícula e aplica `sₙ₊₁ = sₙ − f(sₙ)/f′(sₙ)` até convergir (ou atingir o limite de iterações). O painel mostra a distância, o resíduo e a diferença espacial entre as previsões.

Para a derivação matemática, um exemplo numérico e uma explicação detalhada dos gráficos e das métricas, consulte [ANALISE.md](ANALISE.md).
