export const TOP_SAFE_AREA_EDGES = ['top'] as const;

export function withBottomInset(bottomInset: number, extra: number) {
  return Math.max(bottomInset + extra, extra);
}
