import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import { CreatePostService } from '@/modules/posts/application/services/create-post.service.js';
import { CreatePostInputDto } from '@/modules/posts/presentation/dto/create-post-input.dto.js';
import { PostResponseDto } from '@/modules/posts/presentation/dto/post-response.dto.js';
import {
  PostUploadedFileMapper,
  type UploadedPostMediaFile,
} from '@/modules/posts/presentation/mappers/post-uploaded-file.mapper.js';

const MAX_MEDIA_FILES = 10;
const MAX_MEDIA_FILE_BYTES = 100 * 1024 * 1024;

@Controller('posts')
export class PostController {
  constructor(private readonly createPostService: CreatePostService) {}

  @UseGuards(JwtAuthGuard)
  @RateLimit('post.create')
  @Post()
  @UseInterceptors(
    FilesInterceptor('media', MAX_MEDIA_FILES, {
      limits: {
        fileSize: MAX_MEDIA_FILE_BYTES,
        files: MAX_MEDIA_FILES,
      },
    }),
  )
  async createPost(
    @Body() dto: CreatePostInputDto,
    @UploadedFiles() files: UploadedPostMediaFile[] | undefined,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PostResponseDto> {
    const post = await this.createPostService.execute({
      authorId: currentUser.userId,
      content: dto.content,
      visibility: dto.visibility,
      files: PostUploadedFileMapper.toApplicationFiles(files),
    });

    return PostResponseDto.fromDomain(post);
  }
}
