function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function displayCountry(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase("es");
      return lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
    })
    .join(" ");
}

/** País = texto antes de la primera coma o " - ". "Costa Rica, Tarrazú" → Costa Rica. */
export function countryFromOrigin(origin: string): string {
  const trimmed = origin.trim();
  if (!trimmed) return "";
  const first = trimmed.split(/\s*(?:,|–|—| - )\s*/u)[0]?.trim() ?? "";
  return first ? displayCountry(first) : "";
}

export function listCatalogOrigins(
  coffees: Array<{ origin: string }>,
): string[] {
  const byFold = new Map<string, string>();
  for (const coffee of coffees) {
    const country = countryFromOrigin(coffee.origin);
    if (!country) continue;
    const key = fold(country);
    if (!byFold.has(key)) byFold.set(key, country);
  }
  return [...byFold.values()].sort((a, b) => a.localeCompare(b, "es"));
}

export function filterCoffeesByOrigin<T extends { origin: string }>(
  coffees: T[],
  country: string,
): T[] {
  if (!country) return coffees;
  const wanted = fold(country);
  return coffees.filter(
    (coffee) => fold(countryFromOrigin(coffee.origin)) === wanted,
  );
}
