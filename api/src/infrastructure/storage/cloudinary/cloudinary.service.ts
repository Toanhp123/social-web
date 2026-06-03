import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';
import { StorageError } from '@/core/exceptions/storage.exception.js';

export type CloudinaryUploadResourceType = 'image' | 'video' | 'raw' | 'auto';
export type CloudinaryStoredResourceType = 'image' | 'video' | 'raw';

export type CloudinaryUploadInput = {
  buffer: Buffer;
  folder?: string;
  publicId?: string;
  resourceType?: CloudinaryUploadResourceType;
  tags?: string[];
  context?: Record<string, string>;
  overwrite?: boolean;
};

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  resourceType: CloudinaryUploadResourceType;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
  createdAt: Date;
};

export type CloudinaryDeleteInput = {
  publicId: string;
  resourceType?: CloudinaryStoredResourceType;
  invalidate?: boolean;
};

@Injectable()
export class CloudinaryService {
  private readonly configured: boolean;
  private readonly uploadFolder: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadFolder =
      this.configService.get<string>('cloudinary.uploadFolder') ?? 'social-web';
    this.configured = this.configureClient();
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async uploadBuffer(
    input: CloudinaryUploadInput,
  ): Promise<CloudinaryUploadResult> {
    this.assertConfigured();

    const options: UploadApiOptions = {
      folder: input.folder ?? this.uploadFolder,
      public_id: input.publicId,
      resource_type: input.resourceType ?? 'auto',
      tags: input.tags,
      context: input.context,
      overwrite: input.overwrite ?? false,
    };

    return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(this.createStorageError('Cloudinary upload failed', error));
            return;
          }

          if (!result) {
            reject(
              new StorageError('Cloudinary upload returned an empty result', {
                component: 'cloudinary',
                operation: 'upload',
              }),
            );
            return;
          }

          resolve(this.mapUploadResult(result));
        },
      );

      uploadStream.on('error', (error) => {
        reject(
          this.createStorageError('Cloudinary upload stream failed', error),
        );
      });

      uploadStream.end(input.buffer);
    });
  }

  async deleteAsset(input: CloudinaryDeleteInput): Promise<void> {
    this.assertConfigured();

    try {
      const response = (await cloudinary.uploader.destroy(input.publicId, {
        resource_type: input.resourceType ?? 'image',
        invalidate: input.invalidate ?? true,
      })) as { result?: string };

      if (response.result && !['ok', 'not found'].includes(response.result)) {
        throw new StorageError('Cloudinary delete failed', {
          component: 'cloudinary',
          operation: 'delete',
          publicId: input.publicId,
          result: response.result,
        });
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      throw this.createStorageError('Cloudinary delete failed', error, {
        publicId: input.publicId,
      });
    }
  }

  private configureClient(): boolean {
    const cloudName = this.getOptionalConfig('cloudinary.cloudName');
    const apiKey = this.getOptionalConfig('cloudinary.apiKey');
    const apiSecret = this.getOptionalConfig('cloudinary.apiSecret');
    const configuredValues = [cloudName, apiKey, apiSecret].filter(Boolean);

    if (configuredValues.length === 0) {
      return false;
    }

    if (configuredValues.length !== 3) {
      throw new StorageError('Incomplete Cloudinary configuration', {
        component: 'cloudinary',
        missing: [
          !cloudName ? 'CLOUDINARY_CLOUD_NAME' : undefined,
          !apiKey ? 'CLOUDINARY_API_KEY' : undefined,
          !apiSecret ? 'CLOUDINARY_API_SECRET' : undefined,
        ].filter(Boolean),
      });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: this.configService.get<boolean>('cloudinary.secure') ?? true,
    });

    return true;
  }

  private getOptionalConfig(key: string): string | undefined {
    return this.configService.get<string>(key)?.trim() || undefined;
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw new StorageError('Cloudinary is not configured', {
        component: 'cloudinary',
        requiredEnv: [
          'CLOUDINARY_CLOUD_NAME',
          'CLOUDINARY_API_KEY',
          'CLOUDINARY_API_SECRET',
        ],
      });
    }
  }

  private mapUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      originalFilename: result.original_filename,
      createdAt: new Date(result.created_at),
    };
  }

  private createStorageError(
    message: string,
    cause: unknown,
    metadata: Record<string, unknown> = {},
  ): StorageError {
    return new StorageError(
      message,
      {
        component: 'cloudinary',
        ...metadata,
      },
      undefined,
      undefined,
      cause,
    );
  }
}
