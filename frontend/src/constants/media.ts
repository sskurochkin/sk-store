/** Matches backend default `MEDIA_MAX_FILE_SIZE` (10 MB). */
export const MEDIA_MAX_FILE_SIZE_BYTES = 10_485_760;

export const MEDIA_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MEDIA_ACCEPT_INPUT = MEDIA_ACCEPTED_MIME_TYPES.join(",");

export const MEDIA_CONFLICT_MESSAGE =
  "Это изображение используется в продукте или новости и не может быть удалено.";
