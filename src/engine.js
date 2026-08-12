(() => {
  const { addVectors, scaleVector } = window.Telp.vector;
  const { getAllIntersections, rayToTableBounds } = window.Telp.collision;
  const { stepBalls } = window.Telp.physics;
  const { render } = window.Telp.renderer;

  function createEngine(state) {
    let lastTimestamp = performance.now();

    function frame(timestamp) {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.033);
      lastTimestamp = timestamp;

      state.fps = dt > 0 ? 1 / dt : 0;

      if (!state.paused) {
        stepBalls(state, dt);
      }

      updateTrajectoryInfo(state);
      render(state);
      state.syncPanel();
      requestAnimationFrame(frame);
    }

    return {
      start() {
        requestAnimationFrame(frame);
      }
    };
  }

  function updateTrajectoryInfo(state) {
    const origin = addVectors(state.cue.position, scaleVector(state.cue.direction, state.cue.length));
    const maxDistance = rayToTableBounds(origin, state.cue.direction, state.tableBounds);
    const allHits = getAllIntersections(origin, state.cue.direction, state.balls).filter(
      (hit) => hit.distance <= maxDistance
    );

    state.intersections = allHits;
    state.firstHit = allHits[0] ?? null;

    const endDistance = state.firstHit ? state.firstHit.distance : maxDistance;
    state.trajectoryEnd = addVectors(origin, scaleVector(state.cue.direction, endDistance));
  }

  window.Telp.engine = { createEngine, updateTrajectoryInfo };
})();
