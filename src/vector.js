(() => {
  function addVectors(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  function subtractVectors(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  function scaleVector(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  function magnitude(v) {
    return Math.hypot(v.x, v.y);
  }

  function normalize(v) {
    const mag = magnitude(v);
    if (mag === 0) {
      return { x: 0, y: -1 };
    }

    return scaleVector(v, 1 / mag);
  }

  function applyMatrix2x2(matrix, v) {
    return {
      x: matrix[0][0] * v.x + matrix[0][1] * v.y,
      y: matrix[1][0] * v.x + matrix[1][1] * v.y
    };
  }

  function formatVector(v) {
    return `[${v.x.toFixed(2)}, ${v.y.toFixed(2)}]`;
  }

  window.Telp = window.Telp || {};
  window.Telp.vector = {
    addVectors,
    subtractVectors,
    scaleVector,
    dotProduct,
    magnitude,
    normalize,
    applyMatrix2x2,
    formatVector
  };
})();
