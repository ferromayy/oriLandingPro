export function getEducationNotePublicPath(slug: string): string {
  return `/educacion/${slug}`;
}

export function getEducationNotePublicUrl(slug: string, origin?: string): string {
  const base = (origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const path = getEducationNotePublicPath(slug);
  return base ? `${base}${path}` : path;
}

export type EducationNoteQrTarget = {
  id: "production" | "vercel" | "local";
  label: string;
  description: string;
  url: string;
};

function joinOriginAndPath(origin: string, slug: string): string {
  return `${origin.replace(/\/$/, "")}${getEducationNotePublicPath(slug)}`;
}

export function getEducationNoteQrTargets(slug: string): EducationNoteQrTarget[] {
  const productionOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://oricafe.com.ar";
  const vercelOrigin = process.env.NEXT_PUBLIC_VERCEL_SITE_URL?.trim() || "";
  const localOrigin =
    process.env.NEXT_PUBLIC_LOCAL_SITE_URL?.trim() || "http://localhost:3000";

  const targets: EducationNoteQrTarget[] = [
    {
      id: "production",
      label: "Producción",
      description: "oricafe.com.ar",
      url: joinOriginAndPath(productionOrigin, slug),
    },
  ];

  if (vercelOrigin) {
    targets.push({
      id: "vercel",
      label: "Vercel",
      description: "Preview / staging en Vercel",
      url: joinOriginAndPath(vercelOrigin, slug),
    });
  }

  targets.push({
    id: "local",
    label: "Local",
    description: "Desarrollo en tu máquina",
    url: joinOriginAndPath(localOrigin, slug),
  });

  return targets;
}
