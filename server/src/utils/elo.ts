export function calculateEloChange(ratingA: number, ratingB: number, scoreA: number) {
  // scoreA = 1 (A wins), 0 (A loses), 0.5 draw
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const newA = Math.round(ratingA + K * (scoreA - expectedA));
  const deltaA = newA - ratingA;
  return deltaA;
}
