import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatDate(dateString: string) {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
}

export function formatDateProject(dateString: string) {
  if (!dateString) return "";
  // format dd-MMM-yy, but manually capitalize the first letter of month
  const d = new Date(dateString);
  const day = format(d, "dd");
  let month = format(d, "MMM", { locale: es }).replace(".", "");
  month = month.charAt(0).toUpperCase() + month.slice(1);
  const year = format(d, "yy");
  return `${day}-${month}-${year}`;
}

export function getStatusColor(status: "ok" | "warning" | "critical") {
  switch (status) {
    case "ok": return "emerald";
    case "warning": return "amber";
    case "critical": return "red";
    default: return "blue";
  }
}

export function calculateDeviation(programmed: number, executed: number) {
  return executed - programmed;
}
