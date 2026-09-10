export type LegalLink = {
  href: string;
  label: string;
};

export const PRIVACY_POLICY_PATH = "/privacy-policy";

export const FOOTER_LEGAL_LINKS: LegalLink[] = [
  {
    href: PRIVACY_POLICY_PATH,
    label: "Политика обработки персональных данных",
  },
  {
    href: "/cookie-policy",
    label: "Обработка файлов cookie",
  },
];
