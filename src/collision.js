(() => {
  const { dotProduct, subtractVectors, addVectors, scaleVector } = window.Telp.vector;

  function lineCircleIntersection(origin, direction, circle) {
    // Ray: P + tD, t >= 0. Circle: ||P + tD - C||^2 = r^2
    const oc = subtractVectors(origin, circle.position);
    const a = dotProduct(direction, direction);
    const b = 2 * dotProduct(direction, oc);
    const c = dotProduct(oc, oc) - circle.radius * circle.radius;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return null;
    }

    const sqrtD = Math.sqrt(discriminant);
    const inv2A = 1 / (2 * a);
    const t1 = (-b - sqrtD) * inv2A;
    const t2 = (-b + sqrtD) * inv2A;
    const validTs = [t1, t2].filter((t) => t >= 0);

    if (validTs.length === 0) {
      return null;
    }

    const t = Math.min(...validTs);
    const point = addVectors(origin, scaleVector(direction, t));
    return { t, point, discriminant };
  }

  function getAllIntersections(origin, direction, balls) {
    const intersections = [];

    for (const ball of balls) {
      const hit = lineCircleIntersection(origin, direction, ball);
      if (hit) {
        intersections.push({
          ballId: ball.id,
          distance: hit.t,
          point: hit.point,
          discriminant: hit.discriminant
        });
      }
    }

    intersections.sort((a, b) => a.distance - b.distance);
    return intersections;
  }

  function rayToTableBounds(origin, direction, bounds) {
    const { minX, minY, maxX, maxY } = bounds;
    const tCandidates = [];

    if (direction.x > 0) {
      tCandidates.push((maxX - origin.x) / direction.x);
    } else if (direction.x < 0) {
      tCandidates.push((minX - origin.x) / direction.x);
    }

    if (direction.y > 0) {
      tCandidates.push((maxY - origin.y) / direction.y);
    } else if (direction.y < 0) {
      tCandidates.push((minY - origin.y) / direction.y);
    }

    const positiveT = tCandidates.filter((t) => t >= 0);
    if (positiveT.length === 0) {
      return 0;
    }

    return Math.min(...positiveT);
  }

  window.Telp.collision = {
    lineCircleIntersection,
    getAllIntersections,
    rayToTableBounds
  };
})();
