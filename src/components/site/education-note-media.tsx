import Image from "next/image";
import {
  getPrimaryEducationImage,
  getSecondaryEducationImages,
} from "@/lib/education/helpers";
import type { EducationNote } from "@/lib/education/types";

type Props = {
  note: EducationNote;
  title: string;
  titleAs?: "h1" | "h2";
};

export function EducationNoteTitleWithImage({
  note,
  title,
  titleAs: TitleTag = "h2",
}: Props) {
  const primaryImage = getPrimaryEducationImage(note);

  return (
    <div
      className={`flex flex-col gap-4 ${
        primaryImage ? "sm:flex-row sm:items-center" : ""
      }`}
    >
      {primaryImage && (
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-md bg-gray-100 sm:aspect-square sm:w-36 md:w-44">
          <Image
            src={primaryImage.url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 176px"
          />
        </div>
      )}
      <TitleTag
        className={
          TitleTag === "h1"
            ? "text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
            : "text-sm font-semibold uppercase tracking-widest text-gray-900"
        }
      >
        {title}
      </TitleTag>
    </div>
  );
}

export function EducationNoteGallery({ note }: { note: EducationNote }) {
  const galleryImages = getSecondaryEducationImages(note);

  if (galleryImages.length === 0) return null;

  return (
    <div
      className={`mt-6 grid gap-3 ${
        galleryImages.length === 1
          ? "grid-cols-1"
          : galleryImages.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {galleryImages.map((image) => (
        <div
          key={image.id}
          className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100"
        >
          <Image
            src={image.url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      ))}
    </div>
  );
}
