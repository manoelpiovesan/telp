(() => {
  const { addVectors, formatVector, magnitude, scaleVector } = window.Telp.vector;

  function render(state) {
    const ctx = state.ctx;
    ctx.clearRect(0, 0, state.viewport.width, state.viewport.height);
    renderTable(state);
    renderBalls(state);
    renderCue(state);
    renderTrajectory(state);
    renderImpactPoints(state);

    if (state.debugMath) {
      renderDebugOverlay(state);
    }
  }

  function renderTable(state) {
    const { ctx, tableBounds } = state;
    const width = tableBounds.maxX - tableBounds.minX;
    const height = tableBounds.maxY - tableBounds.minY;

    ctx.fillStyle = "#145f44";
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 3;
    ctx.fillRect(tableBounds.minX, tableBounds.minY, width, height);
    ctx.strokeRect(tableBounds.minX, tableBounds.minY, width, height);
  }

  function renderBalls(state) {
    const { ctx, balls, firstHit, intersections } = state;
    const hitMap = new Set(intersections.map((entry) => entry.ballId));

    for (const ball of balls) {
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();

      if (hitMap.has(ball.id)) {
        ctx.lineWidth = firstHit?.ballId === ball.id ? 4 : 2;
        ctx.strokeStyle = firstHit?.ballId === ball.id ? "#ffe37a" : "#9ee8ff";
        ctx.stroke();
      }
    }
  }

  function renderCue(state) {
    const { ctx, cue } = state;
    const tip = addVectors(cue.position, scaleVector(cue.direction, cue.length));

    ctx.lineWidth = 6;
    ctx.strokeStyle = "#d2c7aa";
    ctx.beginPath();
    ctx.moveTo(cue.position.x, cue.position.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    ctx.fillStyle = "#ff786e";
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderTrajectory(state) {
    const { ctx, cue, firstHit, trajectoryEnd } = state;
    const origin = addVectors(cue.position, scaleVector(cue.direction, cue.length));

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#8be2ff";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(trajectoryEnd.x, trajectoryEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (firstHit) {
      ctx.strokeStyle = "#ffe37a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(firstHit.point.x, firstHit.point.y);
      ctx.stroke();
    }
  }

  function renderImpactPoints(state) {
    const { ctx, intersections } = state;

    for (let i = 0; i < intersections.length; i += 1) {
      const hit = intersections[i];
      ctx.beginPath();
      ctx.arc(hit.point.x, hit.point.y, i === 0 ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#ffe37a" : "#8be2ff";
      ctx.fill();
    }
  }

  function renderDebugOverlay(state) {
    const { ctx, cue, firstHit } = state;
    const origin = addVectors(cue.position, scaleVector(cue.direction, cue.length));

    ctx.fillStyle = "rgb(5 8 17 / 80%)";
    ctx.fillRect(16, 16, 280, 92);
    ctx.strokeStyle = "#5d7cff";
    ctx.strokeRect(16, 16, 280, 92);
    ctx.fillStyle = "#dfe9ff";
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(`d = ${formatVector(cue.direction)}`, 24, 40);
    ctx.fillText(`||d|| = ${magnitude(cue.direction).toFixed(2)}`, 24, 58);
    ctx.fillText(`origem = ${formatVector(origin)}`, 24, 76);
    ctx.fillText(
      firstHit ? `t primeiro impacto = ${firstHit.distance.toFixed(2)}` : "t primeiro impacto = -",
      24,
      94
    );
  }

  window.Telp.renderer = { render };
})();
