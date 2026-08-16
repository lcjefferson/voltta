/** Tipos de negócio VOLTTA — barbearias, salões e estética. */

export const BUSINESS_TYPES = [
  {
    value: "BARBERSHOP",
    label: "Barbearia",
    short: "barbearia",
    example: "Ex.: Barbearia do João",
  },
  {
    value: "SALON",
    label: "Salão de beleza",
    short: "salão",
    example: "Ex.: Studio Ana Beleza",
  },
  {
    value: "AESTHETICS",
    label: "Estética (manicure, cílios, etc.)",
    short: "estúdio",
    example: "Ex.: Studio de Unhas da Mari",
  },
] as const;

export type BusinessTypeValue = (typeof BUSINESS_TYPES)[number]["value"];

export function businessTypeLabel(value?: string | null) {
  return (
    BUSINESS_TYPES.find((t) => t.value === value)?.label || "Negócio de beleza"
  );
}

export function businessTypeShort(value?: string | null) {
  return BUSINESS_TYPES.find((t) => t.value === value)?.short || "negócio";
}
