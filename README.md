<div align="center">
  <h1>Trabalho de Tópicos Especiais em Linguagens de Programação</h1>
  <p>Simulação de mesa de bilhar com algoritmos numéricos em tempo real</p>
</div>

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Como Usar](#como-usar)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Conceitos Matemáticos e Onde São Aplicados](#conceitos-matemáticos-e-onde-são-aplicados)
   - [Representação de Pontos e Vetores](#1-representação-de-pontos-e-vetores)
   - [Vetores de Direção e Normalização](#2-vetores-de-direção-e-normalização)
   - [Equação Paramétrica da Reta](#3-equação-paramétrica-da-reta)
   - [Equação da Circunferência](#4-equação-da-circunferência)
   - [Interseção Reta–Circunferência](#5-interseção-retacircunferência)
   - [Distância ao Longo da Reta (parâmetro t)](#6-distância-ao-longo-da-reta-parâmetro-t)
   - [Reflexão de Vetores (Matrizes 2×2)](#7-reflexão-de-vetores-matrizes-2×2)
   - [Colisão Elástica Bola–Bola](#8-colisão-elástica-bolabola)
   - [EDO de Atrito Viscoso](#9-edo-de-atrito-viscoso)
   - [Método de Runge-Kutta de 4ª Ordem (RK4)](#10-método-de-runge-kutta-de-4ª-ordem-rk4)
   - [Previsão de Estados Futuros](#11-previsão-de-estados-futuros)
   - [Loop de Simulação e Discretização Temporal](#12-loop-de-simulação-e-discretização-temporal)
5. [Tecnologias](#tecnologias)

---

## Visão Geral

Este projeto é uma simulação interativa de mesa de bilhar desenvolvida como trabalho acadêmico de **Tópicos Especiais em Linguagens de Programação**. O foco não é reproduzir fielmente um jogo de sinuca, mas demonstrar de forma visual e computacional a aplicação de **geometria analítica, álgebra vetorial, EDOs e métodos numéricos** em uma simulação executada em tempo real no navegador.

---

## Como Usar

Abra `index.html` em qualquer navegador moderno (sem necessidade de servidor).

| Entrada | Ação |
|---|---|
| **Mouse** | Aponta a direção do taco |
| **Clique esquerdo** | Aplica tacada na primeira bola atingida |
| **Clique direito** | Reposiciona a base do taco |
| **Scroll** | Ajusta a potência do golpe (100–1500 px/s) |
| **Espaço** | Pausa / continua a simulação |
| **R** | Reinicia com novas bolas aleatórias |
| **D** | Ativa/desativa overlay de debug matemático |

---

## Estrutura do Projeto

```
telp/
├── index.html          # Interface, painel lateral, equações
├── style.css           # Estilos
└── src/
    ├── vector.js       # Primitivas de álgebra vetorial
    ├── collision.js    # Algoritmo de interseção reta–círculo
    ├── physics.js      # EDO, RK4, colisão bola–bola, atrito
    ├── engine.js       # Loop de simulação, previsão de trajetórias
    ├── renderer.js     # Renderização Canvas, overlay de debug
    ├── input.js        # Eventos de teclado/mouse/scroll
    └── main.js         # Inicialização, estado global
```

---

## Conceitos Matemáticos e Onde São Aplicados

### 1. Representação de Pontos e Vetores

**Arquivo:** `src/vector.js`

Todos os objetos da simulação (bolas, taco, trajetórias) são representados como vetores bidimensionais `{ x, y }`. As operações fundamentais — soma, subtração, escala e produto escalar — são implementadas como funções puras:

```js
// vector.js
function addVectors(a, b)       { return { x: a.x + b.x, y: a.y + b.y }; }
function subtractVectors(a, b)  { return { x: a.x - b.x, y: a.y - b.y }; }
function scaleVector(v, scalar) { return { x: v.x * scalar, y: v.y * scalar }; }
function dotProduct(a, b)       { return a.x * b.x + a.y * b.y; }
function magnitude(v)           { return Math.hypot(v.x, v.y); }
```

Essas primitivas são usadas em todos os demais módulos e correspondem diretamente ao modelo de espaço vetorial ℝ².

---

### 2. Vetores de Direção e Normalização

**Arquivo:** `src/vector.js` → `normalize()` | **Uso principal:** `src/input.js`

A direção do taco é determinada pelo vetor entre sua base e o cursor do mouse. Esse vetor é **normalizado** (reduzido ao comprimento unitário) para que represente apenas a direção, independentemente da distância:

```
d̂ = (mouse − taco) / ‖mouse − taco‖
```

```js
// input.js
function updateCueDirection(state) {
  const targetVector = subtractVectors(state.mouse, state.cue.position);
  state.cue.direction = normalize(targetVector);
}
```

O resultado `‖d̂‖ = 1` é exibido no painel lateral e no overlay de debug (`D`), demonstrando o conceito de vetor unitário.

---

### 3. Equação Paramétrica da Reta

**Arquivo:** `src/engine.js` → `updateTrajectoryInfo()` | **Arquivo:** `src/renderer.js`

A trajetória do taco é modelada como uma **reta paramétrica**:

```
P(t) = O + t · d̂,   t ≥ 0
```

onde `O` é a ponta do taco e `d̂` é o vetor de direção normalizado. O parâmetro `t` representa a distância percorrida ao longo da reta.

```js
// engine.js
const origin = addVectors(cue.position, scaleVector(cue.direction, cue.length));
// origin = O;  cue.direction = d̂
// P(t) = origin + t * cue.direction
```

A reta é traçada no canvas até o primeiro impacto ou até a parede, e suas componentes (`O`, `d̂`, `‖d̂‖`) aparecem explicitamente no painel lateral e no overlay de debug.

---

### 4. Equação da Circunferência

**Arquivo:** `src/collision.js` → `lineCircleIntersection()`

Cada bola é um círculo de centro `C` e raio `r`. A equação da circunferência é:

```
‖P − C‖² = r²
```

No algoritmo de interseção, a posição de cada bola é comparada à reta do taco por meio dessa equação, substituindo `P = P(t)`:

```
‖O + t·d̂ − C‖² = r²
```

---

### 5. Interseção Reta–Circunferência

**Arquivo:** `src/collision.js` → `lineCircleIntersection()` e `getAllIntersections()`

Expandindo a equação anterior com `oc = O − C`:

```
(d̂ · d̂)t² + 2(d̂ · oc)t + (oc · oc − r²) = 0
         a·t²  +      b·t  +        c        = 0
```

O discriminante `Δ = b² − 4ac` determina o tipo de interseção:

| Δ | Resultado |
|---|---|
| `< 0` | Reta não intercepta o círculo |
| `= 0` | Reta tangencia o círculo (1 ponto) |
| `> 0` | Reta secciona o círculo (2 pontos) |

O menor valor positivo de `t` fornece o **ponto de primeiro impacto**. O discriminante é armazenado em cada `hit` e exibido no overlay de debug.

```js
// collision.js
const discriminant = b * b - 4 * a * c;
if (discriminant < 0) return null;
const t = Math.min(t1, t2);  // menor t positivo = primeiro impacto
```

`getAllIntersections()` percorre todas as bolas, ordena os impactos por `t` crescente e retorna a lista. Assim, `firstHit` é sempre a bola mais próxima na trajetória.

---

### 6. Distância ao Longo da Reta (parâmetro t)

**Arquivo:** `src/collision.js` → `rayToTableBounds()` | **Arquivo:** `src/engine.js`

O parâmetro `t` da reta paramétrica também é usado para calcular a distância da ponta do taco até a parede mais próxima na direção do disparo:

```js
// collision.js — distância até cada parede
if (direction.x > 0) tCandidates.push((maxX - origin.x) / direction.x);
// ...
return Math.min(...positiveT);
```

Esse `t_parede` limita a trajetória visível e é comparado com o `t` de cada bola para filtrar apenas impactos dentro da mesa. A distância até o primeiro impacto é exibida no painel como **"Distância"**.

---

### 7. Reflexão de Vetores (Matrizes 2×2)

**Arquivo:** `src/vector.js` → `applyMatrix2x2()` | **Arquivo:** `src/physics.js`

Quando uma bola colide com uma parede, sua velocidade é **refletida** pelo eixo correspondente, usando matrizes de reflexão:

```
Parede vertical   (x inverte): M = [[-1, 0], [0, 1]]
Parede horizontal (y inverte): M = [[ 1, 0], [0,-1]]
```

```js
// physics.js
ball.velocity = applyMatrix2x2(REFLECT_VERTICAL, ball.velocity);
```

Essa operação demonstra a aplicação de **transformações lineares** via multiplicação matriz-vetor: `v' = M · v`.

---

### 8. Colisão Elástica Bola–Bola

**Arquivo:** `src/physics.js` → `resolveBallCollisions()`

Quando duas bolas se tocam (`dist < r_a + r_b`), é aplicada uma **colisão perfeitamente elástica com massas iguais**: as componentes normais das velocidades são trocadas.

O vetor normal de colisão é calculado como:

```
n̂ = (C_b − C_a) / ‖C_b − C_a‖
```

A variação da velocidade relativa na direção normal:

```
Δv_n = (v_b − v_a) · n̂
```

Se `Δv_n < 0` (bolas se aproximando), cada bola recebe ou perde `Δv_n · n̂`:

```js
a.velocity.x += dvn * nx;
b.velocity.x -= dvn * nx;
```

Além da resposta de velocidade, as bolas são **separadas** para evitar sobreposição permanente (`overlap / 2` para cada lado).

---

### 9. EDO de Atrito Viscoso

**Arquivo:** `src/physics.js` | **Constante:** `FRICTION_K = 0.65`

O movimento das bolas é governado por uma **Equação Diferencial Ordinária** de primeira ordem:

```
dv/dt = −k · v
```

Essa EDO modela um atrito viscoso proporcional à velocidade. Sua solução analítica é:

```
v(t) = v₀ · e^(−kt)
```

Ao invés de usar a solução analítica diretamente, a EDO é **integrada numericamente frame a frame** pelo método RK4, demonstrando que métodos numéricos conseguem aproximar a solução correta mesmo sem conhecê-la a priori. A constante `k` e a equação são exibidas no overlay de debug (`D`).

---

### 10. Método de Runge-Kutta de 4ª Ordem (RK4)

**Arquivo:** `src/physics.js` → `rk4Step()`

O **RK4** é o método numérico central do projeto. A cada frame, ele integra o sistema de EDOs:

```
dx/dt = v
dv/dt = −k · v
```

O método calcula quatro estimativas de derivada (`k1`–`k4`) e combina com pesos:

```
y_{n+1} = y_n + (h/6) · (k1 + 2k2 + 2k3 + k4)
```

```js
// physics.js
const d1 = deriv(velocity);
const d2 = deriv(addVectors(velocity, scaleVector(d1.dv, dt * 0.5)));
const d3 = deriv(addVectors(velocity, scaleVector(d2.dv, dt * 0.5)));
const d4 = deriv(addVectors(velocity, scaleVector(d3.dv, dt)));

// posição e velocidade atualizados simultaneamente
position = addVectors(position, rk4Combine(d1.dx, d2.dx, d3.dx, d4.dx));
velocity = addVectors(velocity, rk4Combine(d1.dv, d2.dv, d3.dv, d4.dv));
```

O RK4 é de **ordem 4**, ou seja, o erro por passo é `O(h⁵)` — muito mais preciso que Euler (`O(h²)`), com maior estabilidade para sistemas com amortecimento.

---

### 11. Previsão de Estados Futuros

**Arquivo:** `src/physics.js` → `predictPath()` | **Arquivo:** `src/engine.js` → `updateBallPredictions()`

A cada frame, o sistema aplica o RK4 **de forma prospectiva** (sem avançar a simulação real) para cada bola em movimento, calculando 120 passos futuros com `Δt = 0.05 s`:

```js
// engine.js
state.ballPaths[ball.id] = predictPath(ball, state.tableBounds, 120, 0.05);
```

```js
// physics.js — predictPath
for (let i = 0; i < steps; i++) {
  const result = rk4Step(tmp.position, tmp.velocity, stepDt);
  // ...resolve paredes...
  path.push(tmp.position);
  if (magnitude(tmp.velocity) < MIN_SPEED) break;
}
```

As trajetórias previstas aparecem como linhas tracejadas âmbar no canvas, mostrando visualmente como a EDO + RK4 projeta o movimento futuro levando em conta o atrito e as reflexões nas paredes.

---

### 12. Loop de Simulação e Discretização Temporal

**Arquivo:** `src/engine.js` → `createEngine()`

O motor usa `requestAnimationFrame` para sincronizar a simulação com a taxa de atualização do monitor. O intervalo de tempo real entre frames (`dt`) é medido e limitado a `33 ms` para evitar instabilidades numéricas em caso de travamento:

```js
// engine.js
const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.033);
```

Isso é a **discretização temporal**: o tempo contínuo é dividido em pequenos passos `h = dt`, e as EDOs são avançadas em cada passo. O FPS calculado como `1/dt` é exibido no topo da página.

A separação entre atualização matemática (`stepBalls`) e renderização (`render`) demonstra que o modelo físico pode evoluir independentemente da camada gráfica.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura, layout responsivo com Bootstrap 5 |
| **CSS3** | Estilos, variáveis CSS, responsividade |
| **JavaScript (ES2020)** | Todos os algoritmos matemáticos e de simulação |
| **HTML Canvas 2D** | Renderização da mesa, bolas, trajetórias, overlay |
