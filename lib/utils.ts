import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string | null | undefined): {
  display: string;
  cleanPhone: string;
  waLink: string | null;
} {
  if (!phone || phone.trim().length === 0) {
    return { display: "No disponible", cleanPhone: "", waLink: null };
  }
  const cleaned = phone.replace(/[^\d+]/g, "");
  let waNumber = cleaned.replace(/^\+/, "");
  if (waNumber.length === 9 && !waNumber.startsWith("51")) {
    waNumber = `51${waNumber}`; // Default Peru country code if 9 digits
  }
  return {
    display: phone,
    cleanPhone: cleaned,
    waLink: waNumber.length >= 8 ? `https://wa.me/${waNumber}` : null,
  };
}

export function formatUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
