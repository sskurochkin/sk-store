export type AdminNavItem = {
  href: string;
  label: string;
  /** When true, section is linked but not implemented yet. */
  comingSoon?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/orders", label: "Orders", comingSoon: true },
  {
    href: "/admin/contact-requests",
    label: "Contact Requests",
    comingSoon: true,
  },
  { href: "/admin/settings", label: "Settings", comingSoon: true },
];
