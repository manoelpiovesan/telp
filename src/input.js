(() => {
  const { normalize, subtractVectors } = window.Telp.vector;

  function setupInput(state) {
    state.canvas.addEventListener("mousemove", (event) => {
      const rect = state.canvas.getBoundingClientRect();
      state.mouse.x = event.clientX - rect.left;
      state.mouse.y = event.clientY - rect.top;
      updateCueDirection(state);
    });

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
