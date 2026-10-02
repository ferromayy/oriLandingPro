import Image from "next/image";
import { ACADEMIA_PEOPLE } from "@/lib/academia/people";

export function AcademiaPeopleSection() {
  return (
    <section className="mt-20 border-t border-gray-200 pt-14 sm:mt-24 sm:pt-16">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-500">
          Academia
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-tight text-gray-900 sm:text-3xl">
          Quiénes lo hacen posible
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
          Crearon este espacio y son quienes acompañan cada encuentro: educan,
          diseñan y sostienen el proyecto.
        </p>
      </div>

      <ul className="space-y-12 sm:space-y-14">
        {ACADEMIA_PEOPLE.map((person) => (
          <li
            key={person.id}
            className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12 sm:gap-10"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 sm:col-span-4 lg:col-span-3">
              <Image
                src={person.imageSrc}
                alt={person.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 280px"
              />
            </div>
            <div className="sm:col-span-8 lg:col-span-7">
              <h3 className="text-xl font-medium tracking-tight text-gray-900">
                {person.name}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                {person.role}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-[0.95rem]">
                {person.bio}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
