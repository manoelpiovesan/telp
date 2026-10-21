(() => {
  'use strict';

  const canvas = document.querySelector('#simulation');
  const ctx = canvas.getContext('2d');
  const plotCanvas = document.querySelector('#functionPlot');
  const plotCtx = plotCanvas.getContext('2d');
  const wrap = document.querySelector('#canvasWrap');
  const angleSlider = document.querySelector('#angleSlider');
  const speedSlider = document.querySelector('#speedSlider');
  const balls = [];
  const W = 1000;
  const H = 540;
  const bounds = { left: 30, right: 970, top: 31, bottom: 509 };
  const cue = { x: 83, y: H / 2 };
  let particleRadius = 18;
  let angle = 0;
  let timeScale = 1;
  let paused = false;
  let dragging = false;
  let previousFrame = performance.now();
  let fpsFrames = 0;
  let fpsStamp = previousFrame;
  let predictions = [];

  const palette = ['#b65f4a', '#547c9d', '#7d8d58', '#8a6c9f', '#bb8950', '#4e8b83', '#697886', '#b16f78'];
  const seeds = [
    { x: 360, y: 275, vx: 58, vy: 2 },
    { x: 520, y: 380, vx: -42, vy: -50 },
    { x: 680, y: 213, vx: 30, vy: 62 },
    { x: 810, y: 380, vx: -67, vy: -26 },
    { x: 600, y: 440, vx: 46, vy: -39 },
  ];

  function addBall(x, y, vx, vy) {
    const color = palette[Math.floor(Math.random() * palette.length)];
    balls.push({ x, y, vx, vy, r: particleRadius, color, phase: Math.random() * Math.PI * 2 });
  }

  function reset() {
    balls.length = 0;
    seeds.forEach((ball) => addBall(ball.x, ball.y, ball.vx, ball.vy));
    predictions = [];
  }

  function direction() {
    const radians = angle * Math.PI / 180;
    return { x: Math.cos(radians), y: Math.sin(radians) };
  }

  function rayLength(d) {
    const exits = [];
    if (d.x > 1e-9) exits.push((bounds.right - cue.x) / d.x);
    if (d.x < -1e-9) exits.push((bounds.left - cue.x) / d.x);
    if (d.y > 1e-9) exits.push((bounds.bottom - cue.y) / d.y);
    if (d.y < -1e-9) exits.push((bounds.top - cue.y) / d.y);
    return Math.min(...exits.filter((distance) => distance >= 0));
  }

  // Analytic reference: solve |cue + s*d - center|² = radius² on the forward ray.
  function exactIntersection(ball, d, maxS) {
    const qx = cue.x - ball.x;
    const qy = cue.y - ball.y;
    const projection = qx * d.x + qy * d.y;
    const perpendicularSquared = qx * qx + qy * qy - projection * projection;
    const radiusSquared = ball.r * ball.r;
    if (perpendicularSquared > radiusSquared) return { hit: false };
    const halfChord = Math.sqrt(Math.max(0, radiusSquared - perpendicularSquared));
    const roots = [-projection - halfChord, -projection + halfChord]
      .filter((s) => s >= 0 && s <= maxS);
    return roots.length ? { hit: true, s: Math.min(...roots) } : { hit: false };
  }

  // Predictor: project the center onto the ray and subtract its radius.
  // Corrector: Newton iterations solve f(s)=0 for the first forward contact.
  function newtonIntersection(ball, d, maxS) {
    const qx = cue.x - ball.x;
    const qy = cue.y - ball.y;
    const projection = -(qx * d.x + qy * d.y);
    const radiusSquared = ball.r * ball.r;
    let s = Math.max(0, projection - ball.r);
    let residual = Infinity;
    const history = [];

    for (let i = 0; i < 20; i++) {
      const dx = qx + s * d.x;
      const dy = qy + s * d.y;
      const f = dx * dx + dy * dy - radiusSquared;
      const derivative = 2 * (dx * d.x + dy * d.y);
      residual = Math.abs(f);
      history.push({ s, f });
      if (residual < 0.02) return { hit: s <= maxS, s, iterations: i, residual, history };
      if (Math.abs(derivative) < 1e-8) break;
      const next = s - f / derivative;
      if (!Number.isFinite(next) || next < 0 || next > maxS) break;
      s = next;
    }
    const dx = qx + s * d.x;
    const dy = qy + s * d.y;
    residual = Math.abs(dx * dx + dy * dy - radiusSquared);
    if (s >= 0 && s <= maxS && residual < 0.02) return { hit: true, s, iterations: history.length, residual, history };
    return { hit: false, iterations: history.length, residual, history };
  }

  function calculatePredictions() {
    const d = direction();
    const maxS = rayLength(d);
    predictions = balls.map((ball, index) => {
      const exact = exactIntersection(ball, d, maxS);
      const numeric = newtonIntersection(ball, d, maxS);
      const exactPoint = exact.hit ? { x: cue.x + d.x * exact.s, y: cue.y + d.y * exact.s } : null;
      const numericPoint = numeric.hit ? { x: cue.x + d.x * numeric.s, y: cue.y + d.y * numeric.s } : null;
      return { index, ball, exact, numeric, exactPoint, numericPoint };
    });
    updateMetrics();
  }

  function firstHit(method) {
    return predictions.filter((p) => p[method].hit).sort((a, b) => a[method].s - b[method].s)[0] || null;
  }

  function updateMetrics() {
    const exact = firstHit('exact');
    const numeric = firstHit('numeric');
    document.querySelector('#exactMetric').textContent = exact ? `${exact.exact.s.toFixed(1)} px` : '—';
    document.querySelector('#exactDetail').textContent = exact ? `Partícula ${String(exact.index + 1).padStart(2, '0')} · primeira raiz positiva` : 'Nenhuma interseção no raio';
    document.querySelector('#newtonMetric').textContent = numeric ? `${numeric.numeric.s.toFixed(1)} px` : '—';
    document.querySelector('#newtonDetail').textContent = numeric ? `Partícula ${String(numeric.index + 1).padStart(2, '0')} · ${numeric.numeric.iterations} iterações · resíduo ${numeric.numeric.residual.toFixed(2)}` : 'Newton não convergiu para uma raiz';
    const error = exact && numeric && exact.index === numeric.index
      ? Math.hypot(exact.exactPoint.x - numeric.numericPoint.x, exact.exactPoint.y - numeric.numericPoint.y)
      : null;
    document.querySelector('#errorMetric').textContent = error === null ? '—' : `${error.toFixed(2)} px`;
    document.querySelector('#errorDetail').textContent = error === null ? 'Compare quando ambos identificarem a mesma partícula' : `Diferença entre previsões · partícula ${String(exact.index + 1).padStart(2, '0')}`;
  }

  function resizeCanvas() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    resizePlot();
    draw();
  }

  function resizePlot() {
    const rect = plotCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    plotCanvas.width = Math.round(rect.width * dpr);
    plotCanvas.height = Math.round(rect.height * dpr);
    plotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawTable() {
    ctx.fillStyle = '#fbfcfa';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f8faf8';
    ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    ctx.strokeStyle = '#dce3e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(bounds.left + 1, bounds.top + 1, bounds.right - bounds.left - 2, bounds.bottom - bounds.top - 2);

    // A measured coordinate grid replaces the decorative billiard-table surface.
    ctx.strokeStyle = '#e8edeb';
    ctx.lineWidth = 1;
    for (let x = 100; x < bounds.right; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, bounds.top); ctx.lineTo(x, bounds.bottom); ctx.stroke();
    }
    for (let y = 80; y < bounds.bottom; y += 80) {
      ctx.beginPath(); ctx.moveTo(bounds.left, y); ctx.lineTo(bounds.right, y); ctx.stroke();
    }
    ctx.strokeStyle = '#97a6a1';
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(bounds.left, cue.y); ctx.lineTo(bounds.right, cue.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cue.x, bounds.top); ctx.lineTo(cue.x, bounds.bottom); ctx.stroke();
    ctx.fillStyle = '#667772';
    ctx.font = '11px "DM Mono", monospace';
    ctx.fillText('x', bounds.right - 13, cue.y - 10);
    ctx.fillText('y', cue.x + 9, bounds.top + 14);
    ctx.font = '9px "DM Mono", monospace';
    for (let x = 100; x < bounds.right; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, cue.y - 3); ctx.lineTo(x, cue.y + 3); ctx.stroke();
      ctx.fillText(String(Math.round((x - cue.x) / 10)), x - 7, cue.y + 15);
    }
    for (let y = 80; y < bounds.bottom; y += 80) {
      ctx.beginPath(); ctx.moveTo(cue.x - 3, y); ctx.lineTo(cue.x + 3, y); ctx.stroke();
      if (y !== cue.y) ctx.fillText(String(Math.round((cue.y - y) / 10)), cue.x + 7, y + 3);
    }
  }

  function drawCue() {
    const d = direction();
    const length = 1100;
    const end = { x: cue.x + d.x * length, y: cue.y + d.y * length };
    ctx.save();
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = 'rgba(238,239,220,.62)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.restore();

    // A finite vector arrow distinguishes the direction vector from the full search ray.
    const vectorLength = 88;
    const tip = { x: cue.x + d.x * vectorLength, y: cue.y + d.y * vectorLength };
    const normal = { x: -d.y, y: d.x };
    const base = { x: tip.x - d.x * 11, y: tip.y - d.y * 11 };
    ctx.strokeStyle = '#253e59'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(base.x, base.y); ctx.stroke();
    ctx.fillStyle = '#253e59';
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(base.x + normal.x * 5, base.y + normal.y * 5);
    ctx.lineTo(base.x - normal.x * 5, base.y - normal.y * 5);
    ctx.closePath(); ctx.fill();

    // The ray starts at a marked origin; a small orthogonal cross indicates its basis.
    ctx.strokeStyle = '#253e59'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cue.x - 7, cue.y); ctx.lineTo(cue.x + 7, cue.y); ctx.moveTo(cue.x, cue.y - 7); ctx.lineTo(cue.x, cue.y + 7); ctx.stroke();
    ctx.fillStyle = '#253e59';
    ctx.beginPath(); ctx.arc(cue.x, cue.y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '10px "DM Mono", monospace';
    ctx.fillText('o', cue.x + 8, cue.y - 8);
    ctx.font = 'italic 12px "DM Mono", monospace';
    ctx.fillText('d', tip.x + normal.x * 8 + d.x * 5, tip.y + normal.y * 8 + d.y * 5);
  }

  function drawPredictions() {
    const showExact = document.querySelector('#showExact').checked;
    const showNewton = document.querySelector('#showNewton').checked;
    const firstExact = firstHit('exact');
    const firstNewton = firstHit('numeric');
    if (showExact && showNewton && firstExact && firstNewton && firstExact.index === firstNewton.index) {
      ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(71,91,105,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(firstExact.exactPoint.x, firstExact.exactPoint.y); ctx.lineTo(firstNewton.numericPoint.x, firstNewton.numericPoint.y); ctx.stroke(); ctx.restore();
    }
    if (showExact) predictions.forEach((p) => {
      if (!p.exact.hit) return;
      const point = p.exactPoint;
      ctx.beginPath(); ctx.arc(point.x, point.y, 8, 0, Math.PI * 2); ctx.strokeStyle = '#317c76'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#317c76'; ctx.fill();
      if (p === firstExact) drawTag(point.x + 10, point.y - 13, 'DIRETO', '#3b8179');
    });
    if (showNewton) predictions.forEach((p) => {
      if (!p.numeric.hit) return;
      const point = p.numericPoint;
      ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = '#bc654f'; ctx.lineWidth = 2; ctx.strokeRect(-5, -5, 10, 10);
      ctx.restore();
      if (p === firstNewton) drawTag(point.x + 10, point.y + 13, 'NEWTON', '#bc654f');
    });
  }

  function drawTag(x, y, text, color) {
    ctx.font = '9px "DM Mono", monospace';
    const width = ctx.measureText(text).width + 10;
    ctx.fillStyle = 'rgba(255,255,255,.94)'; ctx.fillRect(x, y - 10, width, 15);
    ctx.fillStyle = color; ctx.fillText(text, x + 5, y + 1);
  }

  function drawBall(ball, index) {
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.strokeStyle = ball.color; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = ball.color; ctx.font = '9px "DM Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(index + 1), ball.x, ball.y + .5); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawTable();
    drawCue();
    balls.forEach(drawBall);
    drawPredictions();
    drawFunctionPlot();
  }

  function drawFunctionPlot() {
    const rect = plotCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (!width || !height) return;
    plotCtx.clearRect(0, 0, width, height);
    plotCtx.fillStyle = '#fff';
    plotCtx.fillRect(0, 0, width, height);

    const d = direction();
    const maxS = rayLength(d);
    const exactHit = firstHit('exact');
    const selected = exactHit || predictions.reduce((best, item) => {
      const projection = (item.ball.x - cue.x) * d.x + (item.ball.y - cue.y) * d.y;
      const s = Math.max(0, Math.min(maxS, projection));
      const fx = cue.x + s * d.x - item.ball.x;
      const fy = cue.y + s * d.y - item.ball.y;
      const score = Math.abs(fx * fx + fy * fy - item.ball.r * item.ball.r);
      return !best || score < best.score ? { item, score } : best;
    }, null)?.item;
    if (!selected) {
      plotCtx.fillStyle = '#74817d';
      plotCtx.font = '12px "DM Sans", sans-serif';
      plotCtx.fillText('Adicione partículas para comparar os métodos.', 22, 34);
      return;
    }

    const ball = selected.ball;
    const projection = (ball.x - cue.x) * d.x + (ball.y - cue.y) * d.y;
    const span = Math.max(ball.r * 3.2, 38);
    let xMin = Math.max(0, projection - span);
    let xMax = Math.min(maxS, projection + span);
    if (xMax - xMin < 1) { xMin = 0; xMax = Math.max(1, maxS); }
    const f = (s) => {
      const dx = cue.x + s * d.x - ball.x;
      const dy = cue.y + s * d.y - ball.y;
      return dx * dx + dy * dy - ball.r * ball.r;
    };
    const left = 60, right = 18, top = 17, bottom = 35;
    const pw = Math.max(1, width - left - right);
    const ph = Math.max(1, height - top - bottom);
    const samples = Array.from({ length: 121 }, (_, i) => {
      const s = xMin + (xMax - xMin) * i / 120;
      return { s, value: f(s) };
    });
    let yMin = Math.min(0, ...samples.map((point) => point.value));
    let yMax = Math.max(0, ...samples.map((point) => point.value));
    const padding = Math.max((yMax - yMin) * .12, 1);
    yMin -= padding; yMax += padding;
    const px = (s) => left + (s - xMin) / (xMax - xMin) * pw;
    const py = (value) => top + (yMax - value) / (yMax - yMin) * ph;

    plotCtx.font = '10px "DM Mono", monospace';
    plotCtx.textAlign = 'right';
    plotCtx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const value = yMin + (yMax - yMin) * i / 4;
      const y = py(value);
      plotCtx.strokeStyle = '#e9eeeb'; plotCtx.lineWidth = 1;
      plotCtx.beginPath(); plotCtx.moveTo(left, y); plotCtx.lineTo(width - right, y); plotCtx.stroke();
      plotCtx.fillStyle = '#76837f';
      plotCtx.fillText(value.toFixed(0), left - 8, y);
    }
    plotCtx.textAlign = 'center';
    plotCtx.textBaseline = 'top';
    for (let i = 0; i <= 4; i++) {
      const s = xMin + (xMax - xMin) * i / 4;
      const x = px(s);
      plotCtx.strokeStyle = '#eff2f0'; plotCtx.beginPath(); plotCtx.moveTo(x, top); plotCtx.lineTo(x, top + ph); plotCtx.stroke();
      plotCtx.fillStyle = '#76837f';
      plotCtx.fillText(s.toFixed(0), x, top + ph + 8);
    }

    const zeroY = py(0);
    plotCtx.strokeStyle = '#7f908a'; plotCtx.lineWidth = 1.3;
    plotCtx.beginPath(); plotCtx.moveTo(left, zeroY); plotCtx.lineTo(width - right, zeroY); plotCtx.stroke();
    plotCtx.strokeStyle = '#355f84'; plotCtx.lineWidth = 2.5;
    plotCtx.beginPath();
    samples.forEach((point, i) => i ? plotCtx.lineTo(px(point.s), py(point.value)) : plotCtx.moveTo(px(point.s), py(point.value)));
    plotCtx.stroke();

    if (selected.exact.hit) {
      const x = px(selected.exact.s);
      plotCtx.save(); plotCtx.setLineDash([4, 4]); plotCtx.strokeStyle = '#3b8179'; plotCtx.lineWidth = 1.5;
      plotCtx.beginPath(); plotCtx.moveTo(x, top); plotCtx.lineTo(x, top + ph); plotCtx.stroke(); plotCtx.restore();
      plotCtx.beginPath(); plotCtx.arc(x, zeroY, 5, 0, Math.PI * 2); plotCtx.fillStyle = '#3b8179'; plotCtx.fill();
    }

    const history = selected.numeric.history || [];
    if (history.length) {
      plotCtx.save(); plotCtx.setLineDash([3, 3]); plotCtx.strokeStyle = '#bd684f'; plotCtx.lineWidth = 1.2;
      plotCtx.beginPath();
      history.forEach((point, i) => i ? plotCtx.lineTo(px(point.s), py(point.f)) : plotCtx.moveTo(px(point.s), py(point.f)));
      plotCtx.stroke(); plotCtx.restore();
      history.forEach((point, i) => {
        plotCtx.beginPath(); plotCtx.arc(px(point.s), py(point.f), i === history.length - 1 ? 4.2 : 3, 0, Math.PI * 2);
        plotCtx.fillStyle = i === history.length - 1 ? '#bd684f' : '#fff';
        plotCtx.fill(); plotCtx.strokeStyle = '#bd684f'; plotCtx.lineWidth = 1.5; plotCtx.stroke();
      });
    }

    plotCtx.fillStyle = '#52645e'; plotCtx.textAlign = 'left'; plotCtx.textBaseline = 'alphabetic';
    plotCtx.font = '10px "DM Mono", monospace';
    plotCtx.textAlign = 'right'; plotCtx.fillText('s (px)', width - right, height - 5);
    const directLabel = selected.exact.hit ? `direto s = ${selected.exact.s.toFixed(2)}` : 'sem interseção direta';
    const approxLabel = selected.numeric.hit ? `aprox. s = ${selected.numeric.s.toFixed(2)}` : `aprox. não convergiu · resíduo ${selected.numeric.residual.toFixed(1)}`;
    document.querySelector('#plotCaption').textContent = `Partícula ${String(selected.index + 1).padStart(2, '0')} · ${directLabel} · ${approxLabel}`;
  }

  function update(dt) {
    for (const ball of balls) {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x - ball.r < bounds.left) { ball.x = bounds.left + ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.r > bounds.right) { ball.x = bounds.right - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.r < bounds.top) { ball.y = bounds.top + ball.r; ball.vy = Math.abs(ball.vy); }
      if (ball.y + ball.r > bounds.bottom) { ball.y = bounds.bottom - ball.r; ball.vy = -Math.abs(ball.vy); }
    }
  }

  function frame(now) {
    const dt = Math.min((now - previousFrame) / 1000, 0.04);
    previousFrame = now;
    if (!paused) update(dt * timeScale);
    calculatePredictions();
    draw();
    fpsFrames += 1;
    if (now - fpsStamp >= 500) {
      document.querySelector('#fpsValue').textContent = String(Math.round(fpsFrames * 1000 / (now - fpsStamp)));
      fpsFrames = 0; fpsStamp = now;
    }
    requestAnimationFrame(frame);
  }

  function setAngle(value) {
    angle = Math.max(-180, Math.min(180, Number(value)));
    angleSlider.value = String(Math.round(angle));
    document.querySelector('#angleValue').textContent = `${Math.round(angle)}°`;
    document.querySelector('#coordReadout').textContent = `θ ${String(Math.round(angle)).replace('-', '−').padStart(3, '0')}°`;
  }

  function pointerAngle(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * W / rect.width;
    const y = (event.clientY - rect.top) * H / rect.height;
    setAngle(Math.atan2(y - cue.y, x - cue.x) * 180 / Math.PI);
  }

  angleSlider.addEventListener('input', () => setAngle(angleSlider.value));
  speedSlider.addEventListener('input', () => {
    timeScale = Number(speedSlider.value);
    document.querySelector('#speedValue').textContent = `${timeScale.toFixed(1)}×`;
  });
  document.querySelector('#radiusSlider').addEventListener('input', (event) => {
    particleRadius = Number(event.currentTarget.value);
    document.querySelector('#radiusValue').textContent = `${particleRadius} px`;
    balls.forEach((ball) => { ball.r = particleRadius; });
    calculatePredictions();
    draw();
  });
  canvas.addEventListener('pointerdown', (event) => { dragging = true; canvas.setPointerCapture(event.pointerId); pointerAngle(event); });
  canvas.addEventListener('pointermove', (event) => { if (dragging) pointerAngle(event); });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  document.querySelector('#playButton').addEventListener('click', (event) => {
    paused = !paused;
    event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
    event.currentTarget.setAttribute('aria-label', paused ? 'Continuar simulação' : 'Pausar simulação');
    document.querySelector('#pausedBadge').classList.toggle('hidden', !paused);
  });
  document.querySelector('#resetButton').addEventListener('click', () => { reset(); setAngle(0); paused = false; document.querySelector('#playButton').textContent = 'Ⅱ'; document.querySelector('#pausedBadge').classList.add('hidden'); });
  document.querySelector('#addBallButton').addEventListener('click', () => {
    const x = 340 + Math.random() * 550;
    const y = bounds.top + 35 + Math.random() * (bounds.bottom - bounds.top - 70);
    const speed = 40 + Math.random() * 55;
    const direction = Math.random() * Math.PI * 2;
    addBall(x, y, Math.cos(direction) * speed, Math.sin(direction) * speed);
  });
  document.querySelector('#shuffleButton').addEventListener('click', () => balls.forEach((ball) => {
    const direction = Math.random() * Math.PI * 2;
    const speed = 35 + Math.random() * 85;
    ball.vx = Math.cos(direction) * speed;
    ball.vy = Math.sin(direction) * speed;
  }));
  ['#showExact', '#showNewton'].forEach((selector) => document.querySelector(selector).addEventListener('change', draw));
  window.addEventListener('resize', resizeCanvas);

  reset();
  setAngle(0);
  resizeCanvas();
  requestAnimationFrame(frame);
})();
