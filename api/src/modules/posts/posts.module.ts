import { Module } from '@nestjs/common';
import { SecurityModule } from '@/core/security/security.module.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { CreatePostService } from '@/modules/posts/application/services/create-post.service.js';
import { PostPersistenceModule } from '@/modules/posts/infrastructure/persistence/post-persistence.module.js';
import { PostController } from '@/modules/posts/presentation/controllers/post.controller.js';

@Module({
  imports: [PostPersistenceModule, SecurityModule, MediaModule],
  controllers: [PostController],
  providers: [CreatePostService],
  exports: [PostPersistenceModule],
})
export class PostsModule {}
