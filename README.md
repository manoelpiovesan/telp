# Trajetória — laboratório de interseções

Visualização didática em HTML, CSS e JavaScript puro para comparar a referência analítica de uma interseção com dois preditores temporais — ordem zero e Euler de primeira ordem — corrigidos por Newton–Raphson.

## Como executar

Abra `index.html` em um navegador moderno. Não é necessário instalar dependências nem iniciar um servidor.

## O que observar

- Arraste no plano cartesiano ou use o controle deslizante para alterar a direção do raio.
- Ajuste a velocidade da animação e das partículas.
- Use o controle de raio para aumentar ou reduzir o tamanho das partículas.
- Pause, reinicie ou adicione partículas para explorar outros cenários.
- Compare as raízes corrigidas pelos preditores de ordem zero e Euler com a solução analítica.
- Observe no gráfico de convergência os passos de Newton e, no gráfico temporal, os erros dos preditores e das soluções corrigidas.

As interseções são recalculadas a cada quadro usando a posição atual das partículas. Elas refletem nos limites do plano; não há colisões entre partículas.

## Métodos

Para a distância `s` ao longo do raio, a interseção ocorre quando

```text
f(s) = ‖origem + s·d − centro‖² − r² = 0
```

em que `d` é o vetor unitário na direção do raio e `r` é o raio da partícula. A referência resolve a equação quadrática e seleciona a menor raiz não negativa dentro do campo. Em cada quadro, o preditor de ordem zero mantém o último `s` corrigido; o preditor de Euler extrapola a variação de `s` entre os quadros. Newton corrige ambos para a geometria atual. No primeiro quadro, ambos partem de uma estimativa geométrica. O painel compara as raízes corrigidas e o gráfico temporal mostra o erro absoluto de cada predição e correção em relação à referência analítica.

Para a derivação matemática, um exemplo numérico e uma explicação detalhada dos gráficos e das métricas, consulte [ANALISE.md](ANALISE.md). Para um resumo dos preditores, do corretor de Newton e das funções de código relacionadas, consulte [METODOS_NUMERICOS.md](METODOS_NUMERICOS.md).
