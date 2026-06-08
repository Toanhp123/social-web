import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AUTH_ACCOUNT_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import type { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import type { RealtimeEventPayload } from '@/core/realtime/realtime-event.type.js';

const PUBLIC_FEED_ROOM = 'feed:public';

type ClientToServerEvents = {
  'realtime:ping': () => void;
  'realtime:subscribe': (topic: unknown) => void;
};

type ServerToClientEvents = {
  'realtime:event': (event: RealtimeEventPayload) => void;
};

type ServerSideEvents = object;

type RealtimeSocketData = {
  userId?: string;
  isGuest?: boolean;
};

type RealtimeServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSideEvents,
  RealtimeSocketData
>;

type RealtimeSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  ServerSideEvents,
  RealtimeSocketData
>;

@Injectable()
@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: RealtimeServer;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,
  ) {}

  async handleConnection(client: RealtimeSocket): Promise<void> {
    try {
      await client.join(PUBLIC_FEED_ROOM);

      const userId = await this.authenticateOptional(client);

      if (userId) {
        client.data.userId = userId;
        await client.join(this.getUserRoom(userId));
      } else {
        client.data.isGuest = true;
      }

      client.emit('realtime:event', {
        type: 'realtime.connected',
        data: {
          authenticated: Boolean(userId),
        },
        occurredAt: new Date().toISOString(),
      } satisfies RealtimeEventPayload);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: RealtimeSocket): void {
    const userId = client.data.userId;

    if (!userId) return;

    void client.leave(this.getUserRoom(userId));
  }

  emitToUser(userId: string, event: RealtimeEventPayload): void {
    this.server.to(this.getUserRoom(userId)).emit('realtime:event', event);
  }

  emitToPublicFeed(event: RealtimeEventPayload): void {
    this.server.to(PUBLIC_FEED_ROOM).emit('realtime:event', event);
  }

  @SubscribeMessage('realtime:ping')
  handlePing(@ConnectedSocket() client: RealtimeSocket): RealtimeEventPayload {
    return {
      type: 'realtime.pong',
      data: {
        socketId: client.id,
      },
      occurredAt: new Date().toISOString(),
    };
  }

  @SubscribeMessage('realtime:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: RealtimeSocket,
    @MessageBody() topic: unknown,
  ): RealtimeEventPayload {
    const normalizedTopic = typeof topic === 'string' ? topic.trim() : '';

    return {
      type: 'realtime.subscribed',
      data: {
        socketId: client.id,
        topic: normalizedTopic,
      },
      occurredAt: new Date().toISOString(),
    };
  }

  private async authenticateOptional(
    client: RealtimeSocket,
  ): Promise<string | null> {
    const token = this.extractToken(client);
    const accessSecret = this.configService.get<string>('jwt.accessSecret');

    if (!token) {
      return null;
    }

    if (!accessSecret) {
      throw new UnauthorizedException(
        'Realtime access secret is not configured',
      );
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: accessSecret,
    });

    if (!payload?.id) {
      throw new UnauthorizedException('Invalid realtime token');
    }

    const account = await this.authAccountRepository.findById(payload.id);

    if (!account || account.isDisabled()) {
      throw new UnauthorizedException('Realtime account is not available');
    }

    return account.id;
  }

  private extractToken(client: RealtimeSocket): string | null {
    const auth = client.handshake.auth as { token?: unknown };
    const token = auth.token;

    if (typeof token === 'string' && token.trim()) {
      return token.trim();
    }

    const authorization = client.handshake.headers.authorization;

    if (typeof authorization !== 'string') {
      return null;
    }

    const [scheme, value] = authorization.split(' ');

    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}
