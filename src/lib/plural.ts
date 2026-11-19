/**
 * Množina u bosanskom, hrvatskom i srpskom jeziku:
 * 1 zadatak, 2 zadatka, 5 zadataka, 21 zadatak, 22 zadatka, 11 zadataka.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const n10 = Math.abs(n) % 10
  const n100 = Math.abs(n) % 100
  if (n10 === 1 && n100 !== 11) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}

export function countLabel(n: number, one: string, few: string, many: string): string {
  return `${n} ${plural(n, one, few, many)}`
}
