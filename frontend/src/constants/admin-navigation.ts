export type AdminNavItem = {
  href: string;
  label: string;
  /** Symbol id from `/public/icons/sprite.svg`. */
  icon: string;
  /** When true, section is linked but not implemented yet. */
  comingSoon?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "i-burger" },
  { href: "/admin/products", label: "Products", icon: "i-cart" },
  { href: "/admin/news", label: "News", icon: "information" },
  { href: "/admin/orders", label: "Orders", icon: "i-delivery" },
  {
    href: "/admin/contact-requests",
    label: "Contact Requests",
    icon: "i-mail",
  },
  { href: "/admin/settings", label: "Settings", icon: "i-action" },
  { href: "/admin/icons", label: "Icons", icon: "i-menu" },
];
