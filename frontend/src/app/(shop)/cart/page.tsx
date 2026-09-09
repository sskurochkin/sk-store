import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Корзина",
  description: "Корзина заказов SK Store",
  path: "/cart",
  robots: { index: false, follow: false },
});

export default function CartPage() {
  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="cart-heading"
    >
      <Container>
        <Breadcrumbs items={[{ label: "Корзина" }]} />
        <CartPageContent />
      </Container>
    </Section>
  );
}
