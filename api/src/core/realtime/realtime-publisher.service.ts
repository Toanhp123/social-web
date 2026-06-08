import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from '@/core/realtime/realtime.gateway.js';
import type { RealtimeEventPayload } from '@/core/realtime/realtime-event.type.js';

type PublishRealtimeEventInput = {
  type: string;
  data?: unknown;
};

@Injectable()
export class RealtimePublisher {
  constructor(private readonly gateway: RealtimeGateway) {}

  publishToPublicFeed(input: PublishRealtimeEventInput): void {
    this.gateway.emitToPublicFeed(this.createEvent(input));
  }

  publishToUser(userId: string, input: PublishRealtimeEventInput): void {
    this.gateway.emitToUser(userId, this.createEvent(input));
  }

  private createEvent(input: PublishRealtimeEventInput): RealtimeEventPayload {
    const event: RealtimeEventPayload = {
      type: input.type,
      data: input.data,
      occurredAt: new Date().toISOString(),
    };

    return event;
  }
}
