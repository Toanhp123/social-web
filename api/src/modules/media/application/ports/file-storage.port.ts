export type UploadFileResourceType = 'image' | 'video' | 'raw' | 'auto';
export type StoredFileResourceType = 'image' | 'video' | 'raw';

export type UploadFileInput = {
  buffer: Buffer;
  folder?: string;
  publicId?: string;
  resourceType?: UploadFileResourceType;
  overwrite?: boolean;
};

export type UploadFileResult = {
  publicId: string;
  secureUrl: string;
  resourceType: UploadFileResourceType;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
};

export type DeleteFileInput = {
  publicId: string;
  resourceType?: StoredFileResourceType;
};

export interface FileStoragePort {
  upload(input: UploadFileInput): Promise<UploadFileResult>;
  delete(input: DeleteFileInput): Promise<void>;
}
