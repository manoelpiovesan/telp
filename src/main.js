(() => {
  const { createEngine, updateTrajectoryInfo } = window.Telp.engine;
  const { setupInput, updateCueDirection } = window.Telp.input;
  const { formatVector, magnitude } = window.Telp.vector;

  const BALL_COUNT = 12;
  const TABLE_MARGIN = 20;
  const BALL_RADIUS_RANGE = [10, 16];
  const SPEED_RANGE = [80, 180];

  const canvas = document.getElementById("tableCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    fpsLabel: document.getElementById("fpsLabel"),
    pausedBadge: document.getElementById("pausedBadge"),
    ballsCount: document.getElementById("ballsCount"),
    intersectionsCount: document.getElementById("intersectionsCount"),
    firstHitLabel: document.getElementById("firstHitLabel"),
    firstHitDistance: document.getElementById("firstHitDistance"),
    cuePosition: document.getElementById("cuePosition"),
    cueDirection: document.getElementById("cueDirection"),
    cueDirectionNorm: document.getElementById("cueDirectionNorm")
  };

  const state = {
    canvas,
    ctx,
    fps: 0,
    paused: false,
    debugMath: false,
    tableBounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    viewport: { width: 0, height: 0 },
    mouse: { x: 0, y: 0 },
    cue: {
      position: { x: 0, y: 0 },
      direction: { x: 0, y: -1 },
      length: 90
    },
    balls: [],
    intersections: [],
    firstHit: null,
    trajectoryEnd: { x: 0, y: 0 },
    onPauseChange(isPaused) {
      ui.pausedBadge.classList.toggle("hidden", !isPaused);
    },
    syncPanel() {
      ui.fpsLabel.textContent = `FPS: ${Math.round(this.fps)}`;
      ui.ballsCount.textContent = String(this.balls.length);
      ui.intersectionsCount.textContent = String(this.intersections.length);
      ui.firstHitLabel.textContent = this.firstHit ? `Bola #${this.firstHit.ballId}` : "Nenhum";
      ui.firstHitDistance.textContent = this.firstHit ? this.firstHit.distance.toFixed(2) : "-";
      ui.cuePosition.textContent = formatVector(this.cue.position);
      ui.cueDirection.textContent = formatVector(this.cue.direction);
      ui.cueDirectionNorm.textContent = magnitude(this.cue.direction).toFixed(2);
    },
    reset() {
      this.balls = createBalls(BALL_COUNT, this.tableBounds);
      updateTrajectoryInfo(this);
    }
  };

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    state.tableBounds = {
      minX: TABLE_MARGIN,
      minY: TABLE_MARGIN,
      maxX: rect.width - TABLE_MARGIN,
      maxY: rect.height - TABLE_MARGIN
    };
    state.viewport = { width: rect.width, height: rect.height };

    state.cue.position = {
      x: rect.width / 2,
      y: rect.height - TABLE_MARGIN - 42
    };

    if (state.mouse.x === 0 && state.mouse.y === 0) {
      state.mouse = { x: rect.width / 2, y: rect.height / 2 };
    }

    clampBallsToBounds(state.balls, state.tableBounds);
    updateCueDirection(state);
    updateTrajectoryInfo(state);
  }

  function clampBallsToBounds(balls, bounds) {
    for (const ball of balls) {
      ball.position.x = Math.min(Math.max(ball.position.x, bounds.minX + ball.radius), bounds.maxX - ball.radius);
      ball.position.y = Math.min(Math.max(ball.position.y, bounds.minY + ball.radius), bounds.maxY - ball.radius);
    }
  }

  function createBalls(count, bounds) {
    const balls = [];
    for (let i = 0; i < count; i += 1) {
      const radius = randomBetween(BALL_RADIUS_RANGE[0], BALL_RADIUS_RANGE[1]);
      const position = randomNonOverlappingPosition(radius, bounds, balls);
      const velocity = randomVelocity();

      balls.push({
        id: i + 1,
        radius,
        position,
        velocity,
        color: randomColor(i)
      });
    }

    return balls;
  }

  function randomNonOverlappingPosition(radius, bounds, existingBalls) {
    const maxAttempts = 250;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const candidate = {
        x: randomBetween(bounds.minX + radius, bounds.maxX - radius),
        y: randomBetween(bounds.minY + radius, bounds.maxY - radius)
      };

      const overlaps = existingBalls.some((ball) => {
        const dx = candidate.x - ball.position.x;
        const dy = candidate.y - ball.position.y;
        const minDistance = radius + ball.radius + 4;
        return dx * dx + dy * dy < minDistance * minDistance;
      });

      if (!overlaps) {
        return candidate;
      }
    }

    return {
      x: randomBetween(bounds.minX + radius, bounds.maxX - radius),
      y: randomBetween(bounds.minY + radius, bounds.maxY - radius)
    };
  }

  function randomVelocity() {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(SPEED_RANGE[0], SPEED_RANGE[1]);
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomColor(index) {
    const hue = (index * 37) % 360;
    return `hsl(${hue} 85% 62%)`;
  }

  setupInput(state);
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  state.reset();
  state.syncPanel();
  createEngine(state).start();
})();
