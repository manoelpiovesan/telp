(() => {
  const { addVectors, formatVector, magnitude, scaleVector } = window.Telp.vector;
  const { FRICTION_K } = window.Telp.physics;

  function render(state) {
    const ctx = state.ctx;
    ctx.clearRect(0, 0, state.viewport.width, state.viewport.height);
    renderTable(state);
    renderBallPaths(state);
    renderBalls(state);
    renderCue(state);
    renderTrajectory(state);
    renderImpactPoints(state);
    renderPowerIndicator(state);

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

  // Trajetos previstos por EDO/RK4
  function renderBallPaths(state) {
    const { ctx, ballPaths } = state;
    if (!ballPaths) return;

    for (const [, path] of Object.entries(ballPaths)) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i += 1) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.strokeStyle = "rgba(255, 220, 100, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
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

      // ID da bola
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = `bold ${Math.max(9, ball.radius * 0.8)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(ball.id), ball.position.x, ball.position.y);
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
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

  // Indicador de potência do taco (barra ao lado do taco)
  function renderPowerIndicator(state) {
    const { ctx, cue } = state;
    const maxPower = 1500;
    const ratio = cue.power / maxPower;
    const barH = 80;
    const barW = 8;
    const x = cue.position.x + 14;
    const y = cue.position.y - barH / 2;

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(x, y, barW, barH);

    const grad = ctx.createLinearGradient(x, y + barH, x, y);
    grad.addColorStop(0, "#4ecb6a");
    grad.addColorStop(0.5, "#f0c040");
    grad.addColorStop(1, "#e84040");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + barH * (1 - ratio), barW, barH * ratio);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barW, barH);
  }

  function renderDebugOverlay(state) {
    const { ctx, cue, firstHit } = state;
    const origin = addVectors(cue.position, scaleVector(cue.direction, cue.length));

    const boxX = 16, boxY = 16, boxW = 340, boxH = 200;
    ctx.fillStyle = "rgb(5 8 17 / 88%)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#5d7cff";
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#9ecfff";
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.fillText("━ Reta paramétrica ━", boxX + 10, boxY + 18);
    ctx.fillStyle = "#dfe9ff";
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText("P(t) = O + t·d", boxX + 14, boxY + 34);
    ctx.fillText(`d = ${formatVector(cue.direction)}   ||d|| = ${magnitude(cue.direction).toFixed(2)}`, boxX + 14, boxY + 50);
    ctx.fillText(`O = ${formatVector(origin)}`, boxX + 14, boxY + 66);

    ctx.fillStyle = "#9ecfff";
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.fillText("━ Interseção reta–círculo ━", boxX + 10, boxY + 86);
    ctx.fillStyle = "#dfe9ff";
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText("||P(t) - C||² = r²  →  at² + bt + c = 0", boxX + 14, boxY + 102);
    if (firstHit) {
      ctx.fillText(`Δ = ${firstHit.discriminant.toFixed(2)}   t = ${firstHit.distance.toFixed(2)}`, boxX + 14, boxY + 118);
    } else {
      ctx.fillText("Δ < 0  (sem interseção no alvo)", boxX + 14, boxY + 118);
    }

    ctx.fillStyle = "#9ecfff";
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.fillText("━ EDO Atrito (RK4) ━", boxX + 10, boxY + 138);
    ctx.fillStyle = "#dfe9ff";
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText(`dv/dt = -k·v,  k = ${FRICTION_K}  →  v(t) = v₀·e^(-kt)`, boxX + 14, boxY + 154);
    ctx.fillText("RK4: y_{n+1} = y_n + h/6·(k1+2k2+2k3+k4)", boxX + 14, boxY + 170);
    ctx.fillText(`Potência do taco: ${Math.round(state.cue.power)} px/s`, boxX + 14, boxY + 186);
  }

  window.Telp.renderer = { render };
})();
