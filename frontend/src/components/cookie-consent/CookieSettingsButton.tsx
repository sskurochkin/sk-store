"use client";

import { COOKIE_CONSENT_OPEN_EVENT } from "@/constants/cookie-consent";
import { Button } from "@/components/ui/Button/Button";
import type { ButtonVariant } from "@/components/ui/Button/Button";

type CookieSettingsButtonProps = {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
};

export function CookieSettingsButton({
  variant = "ghost",
  size = "sm",
  className,
  children = "Настройки cookie",
}: CookieSettingsButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT));
      }}
    >
      {children}
    </Button>
  );
}
