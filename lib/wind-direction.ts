const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const;

export function degToCardinal(deg: number): string {
  const index = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return CARDINALS[index];
}
