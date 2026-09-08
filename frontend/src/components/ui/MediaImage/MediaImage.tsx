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
  const frameClasses = [
    styles.frame,
    aspectRatio !== "auto" ? ASPECT_CLASS[aspectRatio] : styles.ratioAuto,
    frameClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const imageClasses = [
    styles.image,
    objectFit === "contain" ? styles.contain : styles.cover,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (useFill) {
    return (
      <div className={frameClasses}>
        <Image
          alt={alt}
          className={imageClasses}
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
      className={imageClasses}
      sizes={sizes}
      width={width}
      height={height}
      {...rest}
    />
  );
}
