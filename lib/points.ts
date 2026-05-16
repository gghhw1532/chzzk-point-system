export function getPointMultiplier(subscriptionTier?: number | null) {
  if (subscriptionTier === 2) return 2;
  if (subscriptionTier === 1) return 1.2;
  return 1;
}

export function applyPointMultiplier(
  basePoints: number,
  subscriptionTier?: number | null
) {
  const multiplier = getPointMultiplier(subscriptionTier);

  return Math.floor(basePoints * multiplier);
}