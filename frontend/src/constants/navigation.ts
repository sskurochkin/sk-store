export type NavLink = {
  href: string;
  label: string;
};

export const MAIN_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Главная" },
  { href: "/products", label: "Продукты" },
  { href: "/news", label: "Новости" },
  { href: "/contacts", label: "Контакты" },
];
