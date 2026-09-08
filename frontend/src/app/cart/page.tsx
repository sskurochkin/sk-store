import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Корзина заказов SK Store",
};

export default function CartPage() {
  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="cart-heading"
    >
      <Container>
        <CartPageContent />
      </Container>
    </Section>
  );
}
