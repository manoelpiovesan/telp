(() => {
  const { normalize, subtractVectors, addVectors, scaleVector } = window.Telp.vector;

  function setupInput(state) {
    // Mouse move → direção do taco
    state.canvas.addEventListener("mousemove", (event) => {
      const rect = state.canvas.getBoundingClientRect();
      state.mouse.x = event.clientX - rect.left;
      state.mouse.y = event.clientY - rect.top;
      updateCueDirection(state);
    });

    // Clique esquerdo → tacada na primeira bola atingida
    state.canvas.addEventListener("click", (event) => {
      if (event.button !== 0) return;
      if (!state.firstHit) return;

      const ball = state.balls.find((b) => b.id === state.firstHit.ballId);
      if (!ball) return;

      // Impulso: v += direction * power
      ball.velocity = addVectors(ball.velocity, scaleVector(state.cue.direction, state.cue.power));
      state.paused = false;
      state.onPauseChange(false);
    });

    // Clique direito → reposicionar o taco
    state.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const rect = state.canvas.getBoundingClientRect();
      state.cue.position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      updateCueDirection(state);
    });

    // Roda do mouse → ajustar potência
    state.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -50 : 50;
      state.cue.power = Math.min(Math.max(state.cue.power + delta, 100), 1500);
      state.syncPanel();
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (event.code === "Space") {
        event.preventDefault();
        state.paused = !state.paused;
        state.onPauseChange(state.paused);
        return;
      }

      if (key === "r") {
        state.reset();
        return;
      }

      if (key === "d") {
        state.debugMath = !state.debugMath;
      }
    });
  }

  function updateCueDirection(state) {
    const targetVector = subtractVectors(state.mouse, state.cue.position);
    state.cue.direction = normalize(targetVector);
  }

  window.Telp.input = { setupInput, updateCueDirection };
})();
