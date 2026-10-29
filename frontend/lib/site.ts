/**
 * Публичные контакты и соцсети. Ничего не придумываем: блок показывается,
 * только если значение задано в переменных окружения (frontend/.env.local или Vercel).
 */
export const CONTACTS = {
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
};

export const SOCIALS = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM },
  { label: "Telegram", href: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM },
  { label: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE },
  { label: "TikTok", href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK },
].filter((s): s is { label: string; href: string } => Boolean(s.href));
