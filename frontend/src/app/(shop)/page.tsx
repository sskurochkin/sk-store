import type { Metadata } from "next";
import Link from "next/link";
import { ContactRequestForm } from "@/components/contact/ContactRequestForm";
import { ContentSlider } from "@/components/home/ContentSlider";
import { HomeBenefits } from "@/components/home/HomeBenefits";
import { HomeHero } from "@/components/home/HomeHero";
import { NewsCard } from "@/components/news/NewsCard";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container/Container";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { resolveSiteSeo } from "@/lib/resolve-site-seo";
import { buildPageMetadata, isAbsoluteHttpUrl } from "@/lib/seo";
import { getNewsList } from "@/services/news";
import { getProducts } from "@/services/products";
import { getSiteSettings } from "@/services/settings";
import type { News } from "@/types/news";
import type { Product } from "@/types/product";
import styles from "./page.module.css";

const HOME_CONTACT_FORM_ID = "home-contact-request";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = resolveSiteSeo(settings);
  const ogImage = seo.ogImageUrl && isAbsoluteHttpUrl(seo.ogImageUrl)
    ? seo.ogImageUrl
    : undefined;

  return buildPageMetadata({
    title: settings.site.name,
    description: seo.description,
    path: "/",
    absoluteTitle: true,
    siteName: seo.siteName,
    image: ogImage,
    robots: seo.robots,
  });
}

export default async function Home() {
  const settings = await getSiteSettings();
  let products: Product[] = [];
  let productsFailed = false;
  let newsItems: News[] = [];
  let newsFailed = false;

  try {
    products = await getProducts();
  } catch {
    productsFailed = true;
  }

  try {
    newsItems = await getNewsList();
  } catch {
    newsFailed = true;
  }

  return (
    <>
      <HomeHero formTargetId={HOME_CONTACT_FORM_ID} settings={settings} />

      <Section
        spacing="lg"
        className={styles.section}
        aria-labelledby="home-products-heading"
      >
        <Container>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionHeadingGroup}>
              <Heading id="home-products-heading" level={2}>
                Продукты
              </Heading>
              <Text muted>Свежая выпечка из нашей пекарни.</Text>
            </div>
            <Link href="/products" className={styles.sectionLink}>
              Весь каталог
            </Link>
          </header>

          {productsFailed ? (
            <ErrorState
              title="Не удалось загрузить продукты"
              description="Проверьте соединение и попробуйте обновить страницу."
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="Пока нет продуктов"
              description="Скоро здесь появится каталог выпечки."
            />
          ) : (
            <ContentSlider
              label="Слайдер продуктов"
              previousLabel="Предыдущие продукты"
              nextLabel="Следующие продукты"
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  headingLevel={3}
                />
              ))}
            </ContentSlider>
          )}
        </Container>
      </Section>

      <HomeBenefits />

      <Section
        spacing="lg"
        className={styles.section}
        aria-labelledby="home-news-heading"
      >
        <Container>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionHeadingGroup}>
              <Heading id="home-news-heading" level={2}>
                Новости
              </Heading>
              <Text muted>Объявления и события пекарни.</Text>
            </div>
            <Link href="/news" className={styles.sectionLink}>
              Все новости
            </Link>
          </header>

          {newsFailed ? (
            <ErrorState
              title="Не удалось загрузить новости"
              description="Проверьте соединение и попробуйте обновить страницу."
            />
          ) : newsItems.length === 0 ? (
            <EmptyState
              title="Пока нет новостей"
              description="Скоро здесь появятся объявления пекарни."
            />
          ) : (
            <ContentSlider
              label="Слайдер новостей"
              previousLabel="Предыдущие новости"
              nextLabel="Следующие новости"
            >
              {newsItems.map((item) => (
                <NewsCard key={item.id} news={item} headingLevel={3} />
              ))}
            </ContentSlider>
          )}
        </Container>
      </Section>

      <Section
        spacing="lg"
        className={styles.formSection}
        aria-labelledby="contact-request-heading"
      >
        <Container>
          <div id={HOME_CONTACT_FORM_ID} className={styles.formAnchor}>
            <ContactRequestForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
