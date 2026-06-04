import { CoffeeForm } from "@/components/admin/coffee-form";

export default function NewCoffeePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Nuevo café</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Completá los datos que se muestran en la landing.
        </p>
      </div>
      <CoffeeForm mode="create" />
    </div>
  );
}
