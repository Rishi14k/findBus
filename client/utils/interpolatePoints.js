// helper function for bus movement

export function interpolatePoints(points, steps = 20) {
  const result = [];

  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[i + 1];

    for (let j = 0; j < steps; j++) {
      const lat = lat1 + ((lat2 - lat1) * j) / steps;
      const lng = lng1 + ((lng2 - lng1) * j) / steps;
      result.push([lat, lng]);
    }
  }

  result.push(points[points.length - 1]);

  return result;
}
