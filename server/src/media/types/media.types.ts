export type MediaRecord = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

export type MediaResponse = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  path: string;
  createdAt: string;
};

export type ValidatedUploadImage = {
  format: 'jpeg' | 'png' | 'webp';
  mimeType: string;
  extension: string;
  width: number | null;
  height: number | null;
  buffer: Buffer;
};
