export type UploadProductImageInput = {
  bytes: Buffer;
  fileName: string;
  contentType: string;
  productSlug?: string;
};

export type UploadProductImageResult = {
  bucket: string;
  objectKey: string;
  contentType: string;
  size: number;
  url: string;
};
