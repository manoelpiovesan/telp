# Projeto — Simulação Visual de Álgebra Linear

## Objetivo

Criar uma pequena simulação visual inspirada em uma mesa de sinuca, utilizando exclusivamente:

- HTML
- CSS
- JavaScript

Não utilizar frameworks ou bibliotecas externas.

A aplicação deve funcionar diretamente no navegador, idealmente abrindo o `index.html`.

O objetivo principal não é criar um jogo completo, mas uma **game engine 2D simples**, capaz de manter o estado dos objetos, atualizar suas posições ao longo do tempo e visualizar operações relacionadas à Álgebra Linear.

A simulação deve ser visualmente agradável e, ao mesmo tempo, deixar evidente a aplicação de conceitos matemáticos.

---

# Conceito da aplicação

A aplicação representa uma mesa retangular contendo diversos círculos que se movimentam continuamente.

Existe também um taco controlável pelo usuário.

O taco possui uma ponta e uma direção.

A partir da ponta do taco deve ser projetada uma linha na direção em que o taco está apontando.

Essa linha deve detectar os círculos que estão em sua trajetória e indicar visualmente os pontos em que ocorreria uma interseção.

Exemplo conceitual:

┌────────────────────────────────────────────────────┐
│                                                    │
│             ○                                      │
│                                                    │
│                              ○                     │
│                         ╱                          │
│                       ╱                            │
│                     ╱                              │
│                   ╱                                │
│                 ╱                                  │
│               ●────────────────────────○           │
│              taco                       impacto    │
│                                                    │
│      ○                                             │
│                                                    │
└────────────────────────────────────────────────────┘
Requisitos funcionais
1. Mesa

Criar uma área retangular representando a mesa.

A mesa deve:

ocupar a maior parte da tela;
possuir bordas claramente visíveis;
possuir uma área interna onde os círculos possam se movimentar;
impedir que os círculos ultrapassem seus limites.

A mesa deve ser responsiva.

A simulação deve funcionar em diferentes tamanhos de janela.

2. Círculos

Criar inicialmente entre 8 e 15 círculos.

Cada círculo deve possuir pelo menos:

{
    position: {
        x,
        y
    },

    velocity: {
        x,
        y
    },

    radius
}

As posições iniciais devem ser geradas aleatoriamente.

As velocidades também devem ser aleatórias.

Cada círculo deve possuir uma velocidade diferente.

Os círculos devem se movimentar continuamente.

3. Movimento

Implementar um game loop utilizando:

requestAnimationFrame()

O movimento deve ser baseado em deltaTime.

Não utilizar uma quantidade fixa de pixels por frame.

O movimento deve seguir aproximadamente:

posição_nova = posição_atual + velocidade × deltaTime

Matematicamente:

p(t + Δt) = p(t) + vΔt

Onde:

p é o vetor posição;
v é o vetor velocidade;
dt é o intervalo de tempo entre frames.

Isso deve ser refletido claramente na implementação.

4. Colisão com as paredes

Os círculos devem permanecer dentro da mesa.

Quando um círculo atingir uma parede vertical:

vx = -vx

Quando atingir uma parede horizontal:

vy = -vy

A implementação deve considerar o raio do círculo para que ele não atravesse a parede.

Conceitualmente:

Parede vertical:

[ -1   0 ]
[  0   1 ]

Parede horizontal:

[ 1   0 ]
[ 0  -1 ]

Sempre que possível, representar essa reflexão através de operações vetoriais/matriciais em vez de simplesmente alterar valores isolados.

5. Taco

Criar um taco localizado próximo à parte inferior da mesa.

O taco deve possuir:

{
    position: {
        x,
        y
    },

    direction: {
        x,
        y
    },

    length
}

O taco deve ser visualmente representado por uma haste.

A ponta do taco deve ser claramente identificável.

6. Controle do taco

O usuário deve conseguir controlar a direção do taco utilizando o mouse.

Comportamento desejado:

o taco fica ancorado em uma posição;
o cursor do mouse determina a direção;
o taco gira apontando para o cursor;
a linha de projeção acompanha o movimento do mouse em tempo real.

Exemplo:

                    mouse
                      ↓
                      ○
                     /
                    /
                   /
                  /
                 ●
                taco

A direção deve ser calculada utilizando um vetor:

direction = mousePosition - cuePosition

Depois, esse vetor deve ser normalizado:

d̂ = d / ||d||

7. Linha de projeção

A partir da ponta do taco, desenhar uma linha na direção do taco.

A linha deve ser representada matematicamente como:

L(t) = p + td

onde:

p é a posição da ponta do taco;
d é o vetor direção normalizado;
t >= 0.

A linha deve inicialmente se estender até a borda da mesa.

Porém, caso encontre um círculo, deve destacar o ponto de interseção.

8. Detecção linha-círculo

Esta é uma das partes mais importantes da aplicação.

Para cada círculo:

centro = C
raio = r

e para a linha:

L(t) = P + tD

calcular matematicamente se existe interseção.

Utilizar:

||P + tD - C||² = r²

Isso deve resultar em uma equação quadrática:

at² + bt + c = 0

Como D é normalizado:

a = D · D = 1

Calcular o discriminante:

Δ = b² - 4ac

Casos:

Δ < 0
    Não existe interseção.

Δ = 0
    Existe uma interseção tangencial.

Δ > 0
    Existem duas interseções.

Considerar somente valores de t >= 0, pois a linha deve existir apenas na direção para a qual o taco aponta.

9. Primeiro objeto atingido

A linha pode eventualmente atravessar vários círculos.

Exemplo:

Taco
  ●────────────────○────────────○────────────○
                   1            2            3

A aplicação deve identificar todos os círculos atingidos, mas destacar principalmente o primeiro círculo atingido.

O primeiro círculo é aquele cujo ponto de interseção possui o menor valor positivo de t.

Exemplo:

intersections.sort((a, b) => a.distance - b.distance)

const firstHit = intersections[0]

A linha deve terminar visualmente no primeiro impacto ou, alternativamente, utilizar uma diferença visual clara entre:

trecho até o primeiro impacto;
possíveis impactos posteriores.
10. Visualização dos impactos

Quando a linha atingir um círculo:

destacar o círculo atingido;
desenhar um pequeno marcador no ponto exato de interseção;
mostrar a distância entre o taco e o ponto de impacto;
opcionalmente desenhar uma pequena linha normal ao círculo.

Exemplo:

                         ○
                        /
                       /
                      /
                     ● ← ponto de impacto
                    ╱
                   ╱
                  ╱
                 ●
                taco

O ponto de impacto deve ser calculado matematicamente, não estimado visualmente.

11. Informações matemáticas

Adicionar um painel lateral ou superior mostrando informações da simulação.

Exemplo:

SIMULAÇÃO

Objetos: 12
FPS: 60

TACO
Posição:
[ 420.50, 520.20 ]

Direção:
[ 0.83, -0.55 ]

Primeiro impacto:
Bola #7

Distância:
284.32

Interseções:
3

Também pode mostrar:

Vetor velocidade da bola selecionada:

v = [ 32.42, -17.81 ]

|v| = 37.00

O objetivo é tornar visível a relação entre a simulação e os conceitos de Álgebra Linear.

12. Conceitos de Álgebra Linear que devem aparecer

A implementação deve utilizar explicitamente:

Vetores

Representar:

posição;
velocidade;
direção;
deslocamento.

Exemplo:

const position = { x, y };
const velocity = { x, y };

ou utilizando arrays:

const position = [x, y];
const velocity = [vx, vy];

Escolher a abordagem que deixar o código mais claro.

Norma de vetor

Implementar:

||v|| = √(x² + y²)

Por exemplo:

function magnitude(v) {
    return Math.sqrt(
        v.x * v.x +
        v.y * v.y
    );
}
Normalização

Implementar:

v̂ = v / ||v||

Produto escalar

Implementar:

a · b = axbx + ayby

Utilizar o produto escalar na detecção de interseções.

Matrizes

Quando fizer sentido, utilizar matrizes para representar transformações.

Por exemplo, reflexão em uma parede vertical:

Rx =

[ -1 0 ]
[ 0 1 ]

Reflexão em uma parede horizontal:

Ry =

[ 1 0 ]
[ 0 -1 ]

Aplicar a matriz ao vetor velocidade.

13. Renderização

Utilizar:

canvas

para desenhar a simulação.

Não utilizar elementos HTML individuais para cada círculo.

A renderização deve acontecer dentro do canvas.

Criar funções organizadas, por exemplo:

renderTable()
renderBalls()
renderCue()
renderTrajectory()
renderImpactPoints()
renderDebugInfo()
14. Arquitetura do projeto

Organizar o projeto desta forma:

/
├── index.html
├── style.css
└── src/
    ├── main.js
    ├── engine.js
    ├── physics.js
    ├── renderer.js
    ├── input.js
    ├── vector.js
    └── collision.js

Responsabilidades:

main.js

Inicialização da aplicação.

engine.js

Game loop e gerenciamento do estado.

physics.js

Atualização dos objetos e física.

renderer.js

Renderização do canvas.

input.js

Mouse e interação do usuário.

vector.js

Operações de Álgebra Linear:

soma;
subtração;
multiplicação por escalar;
norma;
normalização;
produto escalar;
transformação por matriz.
collision.js

Detecção:

círculo-parede;
linha-círculo;
determinação do primeiro impacto.
15. Interface

Criar uma interface moderna e limpa.

A página deve possuir:

┌─────────────────────────────────────────────────────────────┐
│ Simulação de Álgebra Linear                    FPS: 60      │
├───────────────────────────────────────────┬─────────────────┤
│                                           │                 │
│                                           │  SIMULAÇÃO      │
│                                           │                 │
│              MESA                         │  Bolas: 12      │
│                                           │                 │
│              ○                            │  Taco           │
│         ○              ○                  │                 │
│                                           │  Direção:       │
│                    ╲                      │  [0.82,-0.57]  │
│                     ╲                     │                 │
│                      ╲                    │  Impactos: 2   │
│                       ●                   │                 │
│                                           │                 │
│                                           │                 │
└───────────────────────────────────────────┴─────────────────┘

A interface deve ser responsiva.

Em telas pequenas, o painel de informações pode ficar abaixo da mesa.

16. Controles

Adicionar uma pequena seção:

CONTROLES

Mova o mouse
    Aponta o taco

Space
    Pausa / continua

R
    Reinicia a simulação

+ / -
    Aumenta / diminui a quantidade de bolas

Implementar pelo menos:

mouse para controlar o taco;
Space para pausar;
R para reiniciar.
17. Pausa

Ao pressionar Space:

congelar posições;
congelar velocidades;
continuar renderizando;
permitir movimentar o taco;
atualizar a linha de projeção.

Mostrar:

PAUSADO

na tela.

18. Reinicialização

Ao pressionar R:

remover as bolas existentes;
gerar novas posições;
gerar novas velocidades;
restaurar a simulação.

Evitar que duas bolas sejam criadas inicialmente sobrepostas.

19. Performance

A aplicação deve ser suficientemente leve para funcionar em navegador comum.

Evitar:

criação excessiva de objetos dentro do loop;
manipulação constante do DOM;
cálculos desnecessários;
múltiplos setInterval.

Utilizar um único:

requestAnimationFrame()

como loop principal.

20. Separação entre estado, física e renderização

Não misturar lógica de física diretamente com código de desenho.

A arquitetura conceitual deve ser:

              ┌──────────────┐
              │    INPUT     │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │    STATE     │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │   PHYSICS    │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │ COLLISIONS   │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │   RENDERER   │
              └──────────────┘
21. Visualização matemática opcional

Adicionar um modo "Debug Matemático".

Quando ativado, mostrar:

Vetor direção
───────────────>

d = [0.87, -0.49]

Norma:
||d|| = 1.00

Primeiro impacto:
t = 284.32

Ponto:
P = [421.2, 182.7]

Também pode desenhar:

vetor velocidade de cada bola;
vetor direção do taco;
centro dos círculos;
ponto de impacto;
normal no ponto de impacto.

Esse modo é importante para demonstrar ao professor a parte matemática da implementação.

22. Requisitos de código

O código deve ser:

simples;
legível;
modular;
bem comentado;
sem dependências externas;
sem frameworks;
sem TypeScript.

Utilizar JavaScript moderno.

Evitar abstrações excessivamente complexas.

Priorizar clareza acadêmica.

As funções matemáticas devem possuir nomes claros, como:

addVectors()
subtractVectors()
scaleVector()
dotProduct()
magnitude()
normalize()
reflectVector()
lineCircleIntersection()
23. Critérios de aceitação

A implementação será considerada concluída quando:

 A página abre diretamente no navegador.
 Existe uma mesa retangular.
 Existem pelo menos 8 círculos.
 Os círculos possuem posições e velocidades.
 Os círculos se movimentam continuamente.
 Os círculos não atravessam as paredes.
 As colisões com as paredes refletem a velocidade.
 Existe um taco.
 O taco acompanha a direção do mouse.
 Existe uma linha partindo da ponta do taco.
 A linha é calculada usando um vetor direção normalizado.
 A linha detecta interseções com círculos.
 O ponto de interseção é calculado matematicamente.
 O primeiro círculo atingido é identificado.
 O ponto de impacto é visualmente destacado.
 A distância até o impacto é exibida.
 Existe um painel com informações da simulação.
 Existe controle de pausa.
 Existe controle de reinicialização.
 A aplicação é responsiva.
 Não existem dependências externas.
 O código está dividido em módulos de responsabilidade clara.
24. Entrega esperada

Criar todos os arquivos necessários para executar a aplicação.

A estrutura final deve ser:

projeto/
├── index.html
├── style.css
└── src/
    ├── main.js
    ├── engine.js
    ├── physics.js
    ├── renderer.js
    ├── input.js
    ├── vector.js
    └── collision.js

O projeto deve ser executável simplesmente abrindo:

index.html

Não exigir Node.js, npm, servidor local ou instalação de dependências.

25. Prioridade

Priorizar nesta ordem:

Simulação funcionando corretamente.
Matemática correta.
Detecção precisa de interseção linha-círculo.
Separação entre física e renderização.
Visualização clara dos conceitos de Álgebra Linear.
Interface visual agradável.
Recursos adicionais.

Não sacrificar a correção matemática em favor de efeitos visuais.

Resultado esperado

O resultado final deve parecer uma pequena ferramenta interativa de demonstração matemática, e não necessariamente um jogo de sinuca.

O usuário deve conseguir mover o mouse sobre a mesa e observar:

o taco apontando para o cursor;
o vetor direção sendo calculado;
a linha sendo projetada;
a linha encontrando os círculos;
o primeiro ponto de interseção sendo identificado;
as coordenadas e distância do impacto sendo calculadas;
os círculos continuando a se movimentar independentemente.

O projeto deve deixar evidente que a simulação utiliza:

vetores;
norma;
normalização;
produto escalar;
matrizes de transformação;
equações paramétricas;
resolução de equação quadrática;
cálculo numérico;
integração temporal simples.

nao use `dentro do md está quebrando a resposta. ou então me de o arquivo .txt com esse texto md
