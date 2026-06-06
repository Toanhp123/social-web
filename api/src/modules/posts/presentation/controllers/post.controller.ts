import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '@/core/security/guards/optional-jwt-auth.guard.js';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { RateLimit } from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import { CreatePostService } from '@/modules/posts/application/services/create-post.service.js';
import { ListPostsService } from '@/modules/posts/application/services/list-posts.service.js';
import { ReactToPostService } from '@/modules/posts/application/services/react-to-post.service.js';
import { SharePostService } from '@/modules/posts/application/services/share-post.service.js';
import { CreatePostInputDto } from '@/modules/posts/presentation/dto/create-post-input.dto.js';
import { ListPostsQueryDto } from '@/modules/posts/presentation/dto/list-posts-query.dto.js';
import { PostPageResponseDto } from '@/modules/posts/presentation/dto/post-page-response.dto.js';
import { PostResponseDto } from '@/modules/posts/presentation/dto/post-response.dto.js';
import { SetPostReactionInputDto } from '@/modules/posts/presentation/dto/set-post-reaction-input.dto.js';
import { SharePostInputDto } from '@/modules/posts/presentation/dto/share-post-input.dto.js';
import {
  PostUploadedFileMapper,
  type UploadedPostMediaFile,
} from '@/modules/posts/presentation/mappers/post-uploaded-file.mapper.js';

const MAX_MEDIA_FILES = 10;
const MAX_MEDIA_FILE_BYTES = 100 * 1024 * 1024;

@Controller('posts')
export class PostController {
  constructor(
    private readonly createPostService: CreatePostService,
    private readonly listPostsService: ListPostsService,
    private readonly reactToPostService: ReactToPostService,
    private readonly sharePostService: SharePostService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listPosts(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser | null,
  ): Promise<PostPageResponseDto> {
    const page = await this.listPostsService.execute({
      viewerId: currentUser?.userId,
      limit: query.limit,
      cursor: query.cursor,
    });

    return PostPageResponseDto.fromDomain(page);
  }

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

  @UseGuards(JwtAuthGuard)
  @Put(':postId/reactions')
  async setReaction(
    @Param('postId') postId: string,
    @Body() dto: SetPostReactionInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PostResponseDto> {
    const post = await this.reactToPostService.setReaction({
      postId,
      userId: currentUser.userId,
      type: dto.type,
    });

    return PostResponseDto.fromDomain(post);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/reactions')
  async removeReaction(
    @Param('postId') postId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PostResponseDto> {
    const post = await this.reactToPostService.removeReaction({
      postId,
      userId: currentUser.userId,
    });

    return PostResponseDto.fromDomain(post);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/shares')
  async sharePost(
    @Param('postId') postId: string,
    @Body() dto: SharePostInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PostResponseDto> {
    const post = await this.sharePostService.execute({
      authorId: currentUser.userId,
      originalPostId: postId,
      content: dto.content,
      visibility: dto.visibility,
    });

    return PostResponseDto.fromDomain(post);
  }
}
