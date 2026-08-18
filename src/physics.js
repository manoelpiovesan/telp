(() => {
  const { addVectors, scaleVector, magnitude, applyMatrix2x2 } = window.Telp.vector;

  // --- Constantes físicas ---
  const FRICTION_K = 0.65;  // EDO: dv/dt = -k·v  →  v(t) = v₀·e^(-k·t)  (meia-vida ≈ 1.06 s)
  const MIN_SPEED   = 3;    // velocidade mínima antes de parar

  const REFLECT_VERTICAL = [[-1, 0], [0, 1]];
  const REFLECT_HORIZONTAL = [[1, 0], [0, -1]];

  // -------------------------------------------------------
  // RK4 — integração numérica de 4ª ordem
  // Sistema: dx/dt = v,  dv/dt = -k·v
  // -------------------------------------------------------
  function rk4Step(position, velocity, dt) {
    function deriv(v) {
      return { dx: v, dv: scaleVector(v, -FRICTION_K) };
    }

    const d1 = deriv(velocity);
    const d2 = deriv(addVectors(velocity, scaleVector(d1.dv, dt * 0.5)));
    const d3 = deriv(addVectors(velocity, scaleVector(d2.dv, dt * 0.5)));
    const d4 = deriv(addVectors(velocity, scaleVector(d3.dv, dt)));

    // y_{n+1} = y_n + (k1 + 2k2 + 2k3 + k4) * h/6
    function rk4Combine(f1, f2, f3, f4) {
      return scaleVector(
        addVectors(addVectors(addVectors(f1, scaleVector(f2, 2)), scaleVector(f3, 2)), f4),
        dt / 6
      );
    }

    return {
      position: addVectors(position, rk4Combine(d1.dx, d2.dx, d3.dx, d4.dx)),
      velocity: addVectors(velocity, rk4Combine(d1.dv, d2.dv, d3.dv, d4.dv))
    };
  }

  // -------------------------------------------------------
  // Colisão elástica bola–bola (massas iguais)
  // -------------------------------------------------------
  function resolveBallCollisions(balls) {
    for (let i = 0; i < balls.length; i += 1) {
      for (let j = i + 1; j < balls.length; j += 1) {
        const a = balls[i];
        const b = balls[j];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;

          // Separar sobreposição
          const overlap = (minDist - dist) / 2;
          a.position.x -= nx * overlap;
          a.position.y -= ny * overlap;
          b.position.x += nx * overlap;
          b.position.y += ny * overlap;

          // Troca de componente normal da velocidade (colisão elástica, massas iguais)
          const dvn = (b.velocity.x - a.velocity.x) * nx + (b.velocity.y - a.velocity.y) * ny;
          if (dvn < 0) {
            a.velocity.x += dvn * nx;
            a.velocity.y += dvn * ny;
            b.velocity.x -= dvn * nx;
            b.velocity.y -= dvn * ny;
          }
        }
      }
    }
  }

  function resolveWallCollision(ball, bounds) {
    const { minX, minY, maxX, maxY } = bounds;
    const { radius } = ball;

    if (ball.position.x - radius < minX) {
      ball.position.x = minX + radius;
      ball.velocity = applyMatrix2x2(REFLECT_VERTICAL, ball.velocity);
    } else if (ball.position.x + radius > maxX) {
      ball.position.x = maxX - radius;
      ball.velocity = applyMatrix2x2(REFLECT_VERTICAL, ball.velocity);
    }

    if (ball.position.y - radius < minY) {
      ball.position.y = minY + radius;
      ball.velocity = applyMatrix2x2(REFLECT_HORIZONTAL, ball.velocity);
    } else if (ball.position.y + radius > maxY) {
      ball.position.y = maxY - radius;
      ball.velocity = applyMatrix2x2(REFLECT_HORIZONTAL, ball.velocity);
    }
  }

  function stepBalls(state, dt) {
    for (const ball of state.balls) {
      const result = rk4Step(ball.position, ball.velocity, dt);
      ball.position = result.position;
      ball.velocity = result.velocity;

      if (magnitude(ball.velocity) < MIN_SPEED) {
        ball.velocity = { x: 0, y: 0 };
      }

      resolveWallCollision(ball, state.tableBounds);
    }

    resolveBallCollisions(state.balls);
  }

  // -------------------------------------------------------
  // Previsão de trajeto por EDO (RK4) para uma bola
  // -------------------------------------------------------
  function predictPath(ball, bounds, steps, stepDt) {
    const path = [];
    const tmp = {
      position: { x: ball.position.x, y: ball.position.y },
      velocity: { x: ball.velocity.x, y: ball.velocity.y },
      radius: ball.radius
    };

    for (let i = 0; i < steps; i += 1) {
      const result = rk4Step(tmp.position, tmp.velocity, stepDt);
      tmp.position = result.position;
      tmp.velocity = result.velocity;
      resolveWallCollision(tmp, bounds);
      path.push({ x: tmp.position.x, y: tmp.position.y });
      if (magnitude(tmp.velocity) < MIN_SPEED) {
        break;
      }
    }

    return path;
  }

  window.Telp.physics = { stepBalls, predictPath, FRICTION_K };
})();
