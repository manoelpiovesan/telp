(() => {
  const { addVectors, applyMatrix2x2, scaleVector } = window.Telp.vector;

  const REFLECT_VERTICAL = [
    [-1, 0],
    [0, 1]
  ];

  const REFLECT_HORIZONTAL = [
    [1, 0],
    [0, -1]
  ];

  function stepBalls(state, dt) {
    for (const ball of state.balls) {
      ball.position = addVectors(ball.position, scaleVector(ball.velocity, dt));
      resolveWallCollision(ball, state.tableBounds);
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

  window.Telp.physics = { stepBalls };
})();
