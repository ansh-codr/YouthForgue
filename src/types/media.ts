export type MediaKind = 'image' | 'video';

export interface MediaVariant {
  url: string;
  width: number;
  height: number;
  size: number;
  contentType: string;
}

export interface ProjectMedia {
  id: string;
  kind: MediaKind;
  alt?: string;
  storagePath: string;
  downloadUrl: string;
  width: number;
  height: number;
  size: number;
  contentType: string;
  blurDataUrl?: string;
  variants?: MediaVariant[];
  createdAt: string;
}
