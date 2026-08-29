import { notFound } from "next/navigation";
import { EducationSectionPage } from "@/components/site/education-section-page";
import { getActiveEducationNotes } from "@/lib/education/queries";
import { EDUCATION_PUBLIC_ENABLED } from "@/lib/site/features";

export const dynamic = "force-dynamic";

export default async function EducacionBlogPage() {
  if (!EDUCATION_PUBLIC_ENABLED) notFound();

  const notes = await getActiveEducationNotes("blog");

  return <EducationSectionPage section="blog" notes={notes} />;
}
