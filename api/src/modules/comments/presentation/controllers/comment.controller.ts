import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '@/core/security/guards/optional-jwt-auth.guard.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { CreateCommentService } from '@/modules/comments/application/services/create-comment.service.js';
import { ListCommentsService } from '@/modules/comments/application/services/list-comments.service.js';
import { CommentPageResponseDto } from '@/modules/comments/presentation/dto/comment-page-response.dto.js';
import { CommentResponseDto } from '@/modules/comments/presentation/dto/comment-response.dto.js';
import { CreateCommentInputDto } from '@/modules/comments/presentation/dto/create-comment-input.dto.js';
import { ListCommentsQueryDto } from '@/modules/comments/presentation/dto/list-comments-query.dto.js';

@Controller('posts/:postId/comments')
export class CommentController {
  constructor(
    private readonly createCommentService: CreateCommentService,
    private readonly listCommentsService: ListCommentsService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listComments(
    @Param('postId') postId: string,
    @Query() query: ListCommentsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser | null,
  ): Promise<CommentPageResponseDto> {
    const page = await this.listCommentsService.execute({
      postId,
      viewerId: currentUser?.userId,
      parentId: query.parentId,
      limit: query.limit,
      cursor: query.cursor,
    });

    return CommentPageResponseDto.fromDomain(page);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.createCommentService.execute({
      postId,
      userId: currentUser.userId,
      content: dto.content,
    });

    return CommentResponseDto.fromDomain(comment);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/replies')
  async createReply(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.createCommentService.execute({
      postId,
      userId: currentUser.userId,
      parentId: commentId,
      content: dto.content,
    });

    return CommentResponseDto.fromDomain(comment);
  }
}
