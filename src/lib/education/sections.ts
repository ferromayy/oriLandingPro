export const EDUCATION_SECTIONS = ["blog", "prepara_en_casa"] as const;
export type EducationSection = (typeof EDUCATION_SECTIONS)[number];

export const EDUCATION_SECTION_DEFAULT: EducationSection = "blog";

/** Slugs reservados para las páginas de listado (no usar como nota). */
export const EDUCATION_RESERVED_SLUGS = [
  "blog",
  "prepara-en-casa",
  "academia",
] as const;

/**
 * Ramas del menú Educación (hover / mobile).
 * La primera agrupa Blog + Prepará en casa; la segunda es Academia.
 */
export const EDUCATION_NAV_BRANCHES = [
  {
    id: "recursos",
    label: "Blog y Prepará en casa",
    path: "/educacion",
    description: "Notas del blog y recetas para prepararte el café en casa.",
  },
  {
    id: "academia",
    label: "Academia",
    path: "/educacion/academia",
    description: "Formación y profundidad en el café de especialidad.",
  },
] as const;

export const EDUCATION_SECTION_META: Record<
  EducationSection,
  {
    label: string;
    path: string;
    title: string;
    description: string;
    emptyMessage: string;
    cta: string;
  }
> = {
  blog: {
    label: "Blog",
    path: "/educacion/blog",
    title: "Blog",
    description:
      "Notas para profundizar en el mundo del café de especialidad.",
    emptyMessage: "Pronto vas a encontrar notas del blog acá.",
    cta: "Leer notas",
  },
  prepara_en_casa: {
    label: "Prepará en casa",
    path: "/educacion/prepara-en-casa",
    title: "Prepará en casa",
    description:
      "Recetas base de cada método para hacerte un buen café en casa.",
    emptyMessage: "Pronto vas a encontrar recetas de métodos acá.",
    cta: "Ver recetas",
  },
};

export function isEducationSection(value: unknown): value is EducationSection {
  return (
    typeof value === "string" &&
    (EDUCATION_SECTIONS as readonly string[]).includes(value)
  );
}

export function normalizeEducationSection(
  value: unknown,
): EducationSection {
  return isEducationSection(value) ? value : EDUCATION_SECTION_DEFAULT;
}

export function educationSectionLabel(section: EducationSection): string {
  return EDUCATION_SECTION_META[section].label;
}

export function educationSectionPath(section: EducationSection): string {
  return EDUCATION_SECTION_META[section].path;
}

export function isReservedEducationSlug(slug: string): boolean {
  return (EDUCATION_RESERVED_SLUGS as readonly string[]).includes(slug.trim());
}
