import { describe, expect, it } from "vitest";
import { validateCoffeeForm } from "@/lib/coffees/schema";
import { defaultVariants, type CoffeeFormData } from "@/lib/coffees/types";

function baseForm(overrides: Partial<CoffeeFormData> = {}): CoffeeFormData {
  return {
    name: "Café interno",
    slug: "",
    codename: "",
    tasting_notes: "",
    short_description: "",
    long_description: "",
    extended_content_url: "",
    extended_content_catch_text: "",
    origin: "",
    varietal: "",
    beneficio: "",
    altitude: "",
    producer: "",
    images: [],
    variants: defaultVariants().map((variant, index) =>
      index === 0
        ? { ...variant, price: 15000, is_available: true }
        : variant,
    ),
    is_active: false,
    sort_order: 0,
    stock_quantity: 0,
    ...overrides,
  };
}

describe("validación de café oculto en landing", () => {
  it("permite guardar solo con nombre y precio si no es visible", () => {
    const issues = validateCoffeeForm(baseForm());
    expect(issues).toEqual([]);
  });

  it("exige al menos un precio si no es visible", () => {
    const issues = validateCoffeeForm(
      baseForm({
        variants: defaultVariants(),
      }),
    );
    expect(issues.some((issue) => issue.field === "variants")).toBe(true);
  });

  it("sigue exigiendo fotos y notas si es visible", () => {
    const issues = validateCoffeeForm(baseForm({ is_active: true, slug: "cafe-interno" }));
    expect(issues.some((issue) => issue.field === "images")).toBe(true);
    expect(issues.some((issue) => issue.field === "tasting_notes")).toBe(true);
    expect(issues.some((issue) => issue.field === "short_description")).toBe(true);
  });
});
