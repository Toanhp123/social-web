import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { MentionParser } from '@/modules/notifications/domain/services/mention-parser.service.js';
import { CreateNotificationService } from './create-notification.service.js';

export type NotifyMentionedUsersInput = {
  actorId: string;
  content: string;
  refId: string;
  source: 'post' | 'comment';
};

@Injectable()
export class NotifyMentionedUsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    private readonly createNotificationService: CreateNotificationService,
  ) {}

  async execute(input: NotifyMentionedUsersInput): Promise<void> {
    const usernames = MentionParser.extractUsernames(input.content);

    if (usernames.length === 0) {
      return;
    }

    const mentionedUsers =
      await this.userRepository.findSummariesByUsernames(usernames);

    await Promise.all(
      mentionedUsers.map((user) =>
        this.createNotificationService.execute({
          userId: user.id,
          actorId: input.actorId,
          type: 'MENTIONED',
          refId: input.refId,
          aggregateKey: `mention:${input.source}:${input.refId}:${user.id}`,
        }),
      ),
    );
  }
}
