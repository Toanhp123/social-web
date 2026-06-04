import { Injectable } from '@nestjs/common';

import { CloudinaryService } from '@/infrastructure/storage/cloudinary/cloudinary.service.js';
import {
  DeleteFileInput,
  FileStoragePort,
  UploadFileInput,
  UploadFileResult,
} from '@/modules/media/application/ports/file-storage.port.js';

@Injectable()
export class CloudinaryFileStorageAdapter implements FileStoragePort {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async upload(input: UploadFileInput): Promise<UploadFileResult> {
    const result = await this.cloudinary.uploadBuffer({
      ...input,
      overwrite: input.overwrite,
    });

    return {
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      resourceType: result.resourceType,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
    };
  }

  async delete(input: DeleteFileInput): Promise<void> {
    await this.cloudinary.deleteAsset(input);
  }
}
