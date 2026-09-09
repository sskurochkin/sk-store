"use client";

import clsx from "clsx";
import { useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import styles from "./ProductGallery.module.css";

type ProductGalleryProps = {
  name: string;
  mainPhoto: string;
  gallery: string[];
};

export function ProductGallery({
  name,
  mainPhoto,
  gallery,
}: ProductGalleryProps) {
  const images = [mainPhoto, ...gallery.filter((url) => url !== mainPhoto)];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = images[activeIndex] ?? mainPhoto;
  const showThumbs = images.length > 1;

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <MediaImage
          src={activeSrc}
          alt={name}
          aspectRatio="4/3"
          sizes="(max-width: 60rem) 100vw, 50vw"
          priority
        />
      </div>

      {showThumbs ? (
        <ul className={styles.thumbs} aria-label="Галерея товара">
          {images.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={`${src}-${index}`}>
                <button
                  type="button"
                  className={clsx(
                    styles.thumbButton,
                    isActive && styles.thumbActive,
                  )}
                  aria-label={`Показать фото ${index + 1}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                >
                  <MediaImage
                    src={src}
                    alt=""
                    aspectRatio="1/1"
                    sizes="88px"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
