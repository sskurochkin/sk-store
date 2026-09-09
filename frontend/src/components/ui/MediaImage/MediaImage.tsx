import clsx from "clsx";
import Image, { type ImageProps } from "next/image";
import styles from "./MediaImage.module.css";

export type MediaAspectRatio = "1/1" | "4/3" | "3/2" | "16/9" | "auto";

type SharedProps = {
  alt: string;
  aspectRatio?: MediaAspectRatio;
  objectFit?: "cover" | "contain";
  className?: string;
  frameClassName?: string;
};

export type MediaImageProps = SharedProps &
  Omit<ImageProps, "alt" | "className">;

const ASPECT_CLASS: Record<Exclude<MediaAspectRatio, "auto">, string> = {
  "1/1": styles.ratio1x1,
  "4/3": styles.ratio4x3,
  "3/2": styles.ratio3x2,
  "16/9": styles.ratio16x9,
};

/**
 * Next.js Image wrapper with aspect-ratio frame and object-fit conventions.
 * Prefer aspectRatio (uses `fill`) for responsive cards; pass width/height when fixed.
 */
export function MediaImage({
  alt,
  aspectRatio = "auto",
  objectFit = "cover",
  className,
  frameClassName,
  fill,
  sizes = "(max-width: 40rem) 100vw, (max-width: 60rem) 50vw, 33vw",
  width,
  height,
  ...rest
}: MediaImageProps) {
  const useFill = Boolean(fill) || aspectRatio !== "auto";

  if (useFill) {
    return (
      <div
        className={clsx(
          styles.frame,
          aspectRatio !== "auto" ? ASPECT_CLASS[aspectRatio] : styles.ratioAuto,
          frameClassName,
        )}
      >
        <Image
          alt={alt}
          className={clsx(
            styles.image,
            objectFit === "contain" ? styles.contain : styles.cover,
            className,
          )}
          fill
          sizes={sizes}
          {...rest}
        />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={clsx(
        styles.image,
        objectFit === "contain" ? styles.contain : styles.cover,
        className,
      )}
      sizes={sizes}
      width={width}
      height={height}
      {...rest}
    />
  );
}
