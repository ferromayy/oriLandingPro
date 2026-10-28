import { describe, expect, it } from "vitest";
import {
  filterCoffeesByProcess,
  listCatalogProcesses,
  normalizeCoffeeProcess,
  resolveCoffeeProcess,
} from "@/lib/coffees/process";

describe("normalizeCoffeeProcess", () => {
  it("deja pasar los valores canónicos", () => {
    expect(normalizeCoffeeProcess("Lavado")).toBe("Lavado");
    expect(normalizeCoffeeProcess("Honey / Semi-lavado")).toBe(
      "Honey / Semi-lavado",
    );
    expect(normalizeCoffeeProcess("Natural")).toBe("Natural");
    expect(normalizeCoffeeProcess("Natural anaeróbico")).toBe(
      "Natural anaeróbico",
    );
  });

  it("unifica mayúsculas, tildes y variantes", () => {
    expect(normalizeCoffeeProcess("lavado")).toBe("Lavado");
    expect(normalizeCoffeeProcess("HONEY")).toBe("Honey / Semi-lavado");
    expect(normalizeCoffeeProcess("Honey")).toBe("Honey / Semi-lavado");
    expect(normalizeCoffeeProcess("natural")).toBe("Natural");
    expect(normalizeCoffeeProcess("Natural anaerobico")).toBe(
      "Natural anaeróbico",
    );
    expect(normalizeCoffeeProcess("semi lavado")).toBe("Honey / Semi-lavado");
    expect(normalizeCoffeeProcess("Semi-lavado")).toBe("Honey / Semi-lavado");
  });

  it("no inventa un proceso si el texto no coincide", () => {
    expect(normalizeCoffeeProcess("")).toBe("");
    expect(normalizeCoffeeProcess("TRIADA - DEGUSTACIÓN")).toBe("");
  });
});

describe("resolveCoffeeProcess", () => {
  it("usa el campo guardado si ya se puede emparejar", () => {
    expect(resolveCoffeeProcess("Natural", "COLOMBIA - HONEY")).toBe("Natural");
  });

  it("infiere desde el nombre si el campo está vacío", () => {
    expect(resolveCoffeeProcess("", "COLOMBIA - HONEY")).toBe(
      "Honey / Semi-lavado",
    );
    expect(resolveCoffeeProcess("", "Colombia - Lavado")).toBe("Lavado");
    expect(resolveCoffeeProcess("", "Uganda - Natural anaeróbico")).toBe(
      "Natural anaeróbico",
    );
    expect(resolveCoffeeProcess("", "TRIADA - DEGUSTACIÓN")).toBe("");
  });
});

describe("filtro de catálogo por proceso", () => {
  const coffees = [
    { name: "Brasil", beneficio: "Natural" },
    { name: "Mucílago", beneficio: "Honey / Semi-lavado" },
    { name: "Uganda", beneficio: "Natural anaeróbico" },
    { name: "Triada", beneficio: "" },
  ];

  it("lista solo los procesos que hay cargados, en el orden canónico", () => {
    expect(listCatalogProcesses(coffees)).toEqual([
      "Honey / Semi-lavado",
      "Natural",
      "Natural anaeróbico",
    ]);
  });

  it("sin proceso elegido muestra todos, incluidos los vacíos", () => {
    expect(filterCoffeesByProcess(coffees, "").map((coffee) => coffee.name)).toEqual(
      ["Brasil", "Mucílago", "Uganda", "Triada"],
    );
  });

  it("al filtrar deja afuera los cafés sin proceso", () => {
    expect(
      filterCoffeesByProcess(coffees, "Natural").map((coffee) => coffee.name),
    ).toEqual(["Brasil"]);
  });
});
