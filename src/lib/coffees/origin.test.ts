import { describe, expect, it } from "vitest";
import {
  countryFromOrigin,
  filterCoffeesByOrigin,
  listCatalogOrigins,
} from "@/lib/coffees/origin";

describe("countryFromOrigin", () => {
  it("toma el país antes de la coma o el guión", () => {
    expect(countryFromOrigin("Brasil, Minas gerais")).toBe("Brasil");
    expect(countryFromOrigin("Colombia - San Antonio - Tolima")).toBe(
      "Colombia",
    );
    expect(countryFromOrigin("Honduras, Montecillos")).toBe("Honduras");
    expect(countryFromOrigin("Costa Rica, Tarrazú")).toBe("Costa Rica");
    expect(countryFromOrigin("Uganda")).toBe("Uganda");
  });

  it("unifica mayúsculas", () => {
    expect(countryFromOrigin("COLOMBIA, Rio blanco")).toBe("Colombia");
  });

  it("queda vacío si no hay origen", () => {
    expect(countryFromOrigin("")).toBe("");
    expect(countryFromOrigin("   ")).toBe("");
  });
});

describe("filtro de catálogo por origen", () => {
  const coffees = [
    { name: "Brasil", origin: "Brasil, Minas gerais" },
    { name: "Lavado", origin: "Colombia - San Antonio - Tolima" },
    { name: "Honey", origin: "" },
    { name: "Honduras", origin: "Honduras, Montecillos" },
  ];

  it("arma el desplegable solo con países que hay cargados", () => {
    expect(listCatalogOrigins(coffees)).toEqual([
      "Brasil",
      "Colombia",
      "Honduras",
    ]);
  });

  it("sin origen elegido muestra todos, incluidos los vacíos", () => {
    expect(filterCoffeesByOrigin(coffees, "").map((coffee) => coffee.name)).toEqual(
      ["Brasil", "Lavado", "Honey", "Honduras"],
    );
  });

  it("al filtrar deja afuera los cafés sin país", () => {
    expect(
      filterCoffeesByOrigin(coffees, "Colombia").map((coffee) => coffee.name),
    ).toEqual(["Lavado"]);
  });
});
