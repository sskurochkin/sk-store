/** Minimal valid 1x1 JPEG (red pixel). */
const MINIMAL_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAQABADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAUGB//EACQQAQABAwMEAgMAAAAAAAAAAAECAwQFABESITETFCIyURUz/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/** Minimal valid 1x1 PNG. */
const MINIMAL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** Minimal valid 1x1 WebP. */
const MINIMAL_WEBP_BASE64 =
  'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/vuUAAA=';

export function createTestJpegBuffer(): Buffer {
  return Buffer.from(MINIMAL_JPEG_BASE64, 'base64');
}

export function createTestPngBuffer(): Buffer {
  return Buffer.from(MINIMAL_PNG_BASE64, 'base64');
}

export function createTestWebpBuffer(): Buffer {
  return Buffer.from(MINIMAL_WEBP_BASE64, 'base64');
}

export function createFakeImageBuffer(): Buffer {
  return Buffer.from('not-an-image', 'utf8');
}
