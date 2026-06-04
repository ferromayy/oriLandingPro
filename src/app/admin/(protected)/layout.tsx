import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/server";
import { LogoutButton } from "@/components/admin/logout-button";

const nav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/coffees", label: "Cafés", exact: false },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="min-h-full bg-zinc-100">
      <div className="mx-auto flex min-h-full max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white p-6 md:block">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Orí Admin
          </p>
          <nav className="mt-6 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <Link href="/" className="text-xs text-zinc-500 underline hover:text-zinc-800">
              Ver sitio público
            </Link>
          </div>
        </aside>

        <div className="flex min-h-full flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
            <div className="md:hidden">
              <p className="text-sm font-semibold">Orí Admin</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <nav className="flex gap-2 md:hidden">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="text-xs underline">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
