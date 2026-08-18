## Objetivo e Contextualização

Este software é desenvolvido como parte de um trabalho acadêmico voltado ao estudo e à implementação de **algoritmos numéricos em tempo real**, utilizando conceitos de geometria analítica, álgebra e Equações Diferenciais Ordinárias (EDOs).

O objetivo principal é desenvolver uma simulação bidimensional de uma **mesa de bilhar**, na qual o usuário controla um taco semelhante a um taco de sinuca para determinar a direção e o ponto de impacto sobre as bolas presentes no espaço vetorial.

A simulação terá como foco principal a **detecção de colisões e a previsão do movimento**, não sendo necessário reproduzir integralmente todos os fenômenos físicos envolvidos em uma partida de bilhar. Dessa forma, o projeto priorizará a aplicação prática dos modelos matemáticos e dos algoritmos numéricos estudados.

### Representação Geométrica

A mesa de bilhar será representada em um espaço vetorial bidimensional, contendo:

* Um **taco**, controlável pelo usuário em posição e direção;
* Uma **linha de direção**, projetada a partir da ponta do taco, indicando sua trajetória de impacto;
* Um conjunto de **bolas**, representadas geometricamente por círculos;
* Um sistema de coordenadas que permita determinar as posições dos objetos em tempo real.

A partir da posição e da orientação do taco, será projetada uma reta que representa sua direção de ataque. O sistema deverá determinar se essa reta intercepta algum dos círculos que representam as bolas.

Essa etapa permitirá demonstrar, na prática, a aplicação das **equações da reta, do círculo e do ponto**, utilizando conceitos de geometria analítica para solucionar problemas de interseção em tempo real.

## Algoritmos Principais

O software deverá possuir dois algoritmos fundamentais.

### 1. Algoritmo de Interseção

O **Algoritmo de Interseção** será responsável por determinar se a trajetória projetada a partir do taco intercepta alguma das bolas presentes na mesa.

O cálculo deverá considerar:

* A posição atual da ponta do taco;
* O vetor de direção do taco;
* A posição de cada bola;
* O raio de cada bola;
* A distância entre a trajetória do taco e o centro de cada bola.

Matematicamente, o problema poderá ser modelado a partir da interseção entre uma **reta e uma circunferência**, permitindo determinar se existe um ou mais pontos de interseção.

Além de identificar uma possível colisão, o algoritmo poderá determinar informações como a distância até o ponto de impacto e qual bola será atingida primeiro, caso existam múltiplas bolas sobre a trajetória.

### 2. Algoritmo de Previsão de Movimento

O **Algoritmo de Previsão de Movimento** será responsável por calcular a evolução temporal da posição dos objetos da simulação.

Para isso, serão utilizadas **Equações Diferenciais Ordinárias (EDOs)**, relacionando posição, velocidade e aceleração ao longo do tempo.

O algoritmo deverá considerar variáveis como:

* Posição atual;
* Velocidade;
* Direção do movimento;
* Aceleração;
* Forças aplicadas;
* Intervalo de tempo entre os frames.

A partir dessas informações, o sistema poderá estimar as posições futuras das bolas e do taco, permitindo antecipar os estados subsequentes da simulação.

O objetivo não é apenas representar o movimento visualmente, mas demonstrar como métodos numéricos podem ser utilizados para aproximar a solução de sistemas dinâmicos em tempo real.

## Motor de Simulação

A aplicação deverá utilizar uma **game engine simples**, desenvolvida sobre o elemento `Canvas` do HTML, permitindo controle explícito sobre:

* O tempo de simulação;
* A taxa de atualização dos frames;
* A velocidade dos objetos;
* Os estados da simulação;
* A execução dos algoritmos numéricos;
* A atualização e renderização dos elementos gráficos.

A separação entre o estado matemático da simulação e sua representação gráfica deverá permitir que os cálculos sejam executados independentemente da renderização.

O sistema deverá utilizar um **loop de simulação**, no qual, a cada frame, os estados dos objetos são atualizados por meio dos algoritmos numéricos e posteriormente desenhados no canvas.

## Previsão dos Estados Futuros

Um dos principais objetivos do projeto é utilizar métodos numéricos para **prever os estados futuros da simulação**.

A partir das condições iniciais de cada objeto, o sistema deverá calcular suas posições nos frames subsequentes utilizando as EDOs que descrevem seu movimento.

Esse mecanismo permitirá estabelecer uma relação direta entre o modelo matemático e a simulação visual, demonstrando como uma equação diferencial pode ser discretizada e resolvida numericamente para produzir uma animação contínua.

Dependendo da complexidade adotada, poderão ser utilizados métodos numéricos como **Euler** ou **Runge-Kutta**, permitindo inclusive comparar precisão, estabilidade e custo computacional entre diferentes métodos.

## Tecnologias

O software deverá ser desenvolvido utilizando tecnologias web básicas:

* **HTML** — estrutura da aplicação;
* **CSS** — interface e apresentação visual;
* **JavaScript** — implementação dos algoritmos matemáticos, controle da simulação e interação com o usuário;
* **HTML Canvas** — renderização da mesa, taco, bolas, trajetórias e demais elementos gráficos.

Não será necessária a utilização de uma engine de jogos externa. O próprio JavaScript, em conjunto com o `Canvas` e um loop de atualização controlado, deverá fornecer a infraestrutura necessária para a simulação.

## Demonstração Matemática

O projeto deverá possuir forte caráter matemático, evidenciando a relação entre os conceitos estudados e sua aplicação prática no software.

A implementação deverá demonstrar, de forma visual e computacional, conceitos como:

* Representação de pontos no plano cartesiano;
* Vetores e vetores de direção;
* Equação paramétrica da reta;
* Equação da circunferência;
* Distância entre ponto e reta;
* Interseção entre reta e circunferência;
* Velocidade e aceleração;
* Equações diferenciais ordinárias;
* Discretização temporal;
* Métodos numéricos para integração;
* Previsão de estados futuros.

Dessa forma, o software não deverá funcionar apenas como um jogo de bilhar simplificado, mas principalmente como uma **ferramenta visual para demonstrar a aplicação de métodos matemáticos e numéricos em uma simulação interativa e executada em tempo real**.
