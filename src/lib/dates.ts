export function year(date: string | null): number | "Actualidad" {
  return date ? new Date(date).getFullYear() : "Actualidad"
}

const MONTH_YEAR = new Intl.DateTimeFormat("es-ES", { month: "2-digit", year: "numeric" })

export function monthYear(date: string): string {
  return MONTH_YEAR.format(new Date(date))
}
