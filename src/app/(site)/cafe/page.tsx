import { CoffeeCatalog } from "@/components/site/coffee-catalog";

export default function CafePage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-10">
      <CoffeeCatalog
        title="Todos los cafés"
        description="Explorá nuestra selección completa de cafés de especialidad."
      />
    </main>
  );
}
