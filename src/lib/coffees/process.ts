export const COFFEE_PROCESS_OPTIONS = [
  "Lavado",
  "Honey / Semi-lavado",
  "Natural",
  "Natural anaeróbico",
] as const;

export type CoffeeProcess = (typeof COFFEE_PROCESS_OPTIONS)[number];

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function isCoffeeProcess(value: string): value is CoffeeProcess {
  return (COFFEE_PROCESS_OPTIONS as readonly string[]).includes(value);
}

/**
 * Lleva un texto libre al valor canónico de proceso.
 * Sirve para el campo guardado y, en el catch-up, para inferir desde el nombre.
 */
export function normalizeCoffeeProcess(value: string): CoffeeProcess | "" {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isCoffeeProcess(trimmed)) return trimmed;

  const folded = fold(trimmed);
  if (!folded) return "";
  if (folded.includes("anaerob")) return "Natural anaeróbico";
  if (
    folded.includes("honey") ||
    (folded.includes("semi") && folded.includes("lavado"))
  ) {
    return "Honey / Semi-lavado";
  }
  if (folded.includes("lavado")) return "Lavado";
  if (folded.includes("natural")) return "Natural";
  return "";
}

export function resolveCoffeeProcess(
  stored: string,
  name = "",
): CoffeeProcess | "" {
  return normalizeCoffeeProcess(stored) || normalizeCoffeeProcess(name);
}

export function listCatalogProcesses(
  coffees: Array<{ beneficio: string }>,
): CoffeeProcess[] {
  const present = new Set<CoffeeProcess>();
  for (const coffee of coffees) {
    const process = normalizeCoffeeProcess(coffee.beneficio);
    if (process) present.add(process);
  }
  return COFFEE_PROCESS_OPTIONS.filter((process) => present.has(process));
}

export function filterCoffeesByProcess<T extends { beneficio: string }>(
  coffees: T[],
  process: CoffeeProcess | "",
): T[] {
  if (!process) return coffees;
  return coffees.filter(
    (coffee) => normalizeCoffeeProcess(coffee.beneficio) === process,
  );
}
