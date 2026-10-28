import { CoffeeCatalog } from "@/components/site/coffee-catalog";

export default function CafePage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-10">
      <CoffeeCatalog enableProcessFilter showHeading={false} />
    </main>
  );
}
