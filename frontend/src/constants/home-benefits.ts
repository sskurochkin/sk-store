export type HomeBenefit = {
  id: string;
  title: string;
  description: string;
  /** Sprite symbol id from `public/icons/sprite.svg`. */
  icon: string;
};

/** Mock benefits for the home page until CMS/settings exist. */
export const HOME_BENEFITS: HomeBenefit[] = [
  {
    id: "fresh",
    title: "Свежая выпечка",
    description: "Печём каждый день — к вашему столу без компромиссов по вкусу.",
    icon: "i-calendar",
  },
  {
    id: "quality",
    title: "Качественные ингредиенты",
    description: "Отбираем муку, масло и начинки так, чтобы результат был стабильным.",
    icon: "i-star",
  },
  {
    id: "order",
    title: "Удобный заказ",
    description: "Соберите корзину на сайте и оставьте заявку — мы подтвердим детали.",
    icon: "i-cart",
  },
  {
    id: "delivery",
    title: "Самовывоз и доставка",
    description: "Заберите заказ у нас или договоритесь о доставке при оформлении.",
    icon: "i-delivery",
  },
];
