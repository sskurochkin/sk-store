import { ApiError } from "@/services/api";
import { MEDIA_MAX_FILE_SIZE_BYTES } from "@/constants/media";
import { formatFileSize } from "@/lib/format-media";

export function mapUploadValidationError(file: File | null): string | null {
  if (!file) {
    return "Выберите файл изображения.";
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return "Неподдерживаемый формат. Разрешены JPEG, PNG и WebP.";
  }

  if (file.size > MEDIA_MAX_FILE_SIZE_BYTES) {
    return `Файл слишком большой. Максимум ${formatFileSize(MEDIA_MAX_FILE_SIZE_BYTES)}.`;
  }

  return null;
}

export function mapUploadApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Сессия истекла. Войдите снова.";
    }
    if (error.status === 413) {
      return `Файл слишком большой. Максимум ${formatFileSize(MEDIA_MAX_FILE_SIZE_BYTES)}.`;
    }
    if (error.status === 415) {
      return "Неподдерживаемый формат. Разрешены JPEG, PNG и WebP.";
    }
    if (error.status === 400) {
      return "Некорректный файл изображения.";
    }
    if (error.status >= 500) {
      return "Ошибка сервера. Попробуйте позже.";
    }
    return error.message || "Не удалось загрузить изображение.";
  }

  return "Не удалось загрузить изображение.";
}
