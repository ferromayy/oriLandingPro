export function getEducationNotePublicPath(slug: string): string {
  return `/educacion/${slug}`;
}

export function getEducationNotePublicUrl(slug: string, origin?: string): string {
  const base = (origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const path = getEducationNotePublicPath(slug);
  return base ? `${base}${path}` : path;
}
