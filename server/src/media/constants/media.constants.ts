export const MEDIA_PUBLIC_PATH_PREFIX = '/media';

export const MEDIA_ALLOWED_FORMATS = ['jpeg', 'png', 'webp'] as const;

export type MediaImageFormat = (typeof MEDIA_ALLOWED_FORMATS)[number];

export const MEDIA_MIME_BY_FORMAT: Record<MediaImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const MEDIA_EXTENSION_BY_FORMAT: Record<MediaImageFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
};

export const MEDIA_DEFAULT_MAX_FILE_SIZE_BYTES = 10_485_760;

export const MEDIA_DEFAULT_UPLOAD_RATE_LIMIT = 10;

export const MEDIA_DEFAULT_UPLOAD_RATE_TTL_MS = 60_000;
