export type NavLink = {
  href: string;
  label: string;
};

export const MAIN_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Главная" },
  { href: "/products", label: "Продукты1" },
  { href: "/news", label: "Новости" },
  { href: "/contacts", label: "Контакты" },
];
