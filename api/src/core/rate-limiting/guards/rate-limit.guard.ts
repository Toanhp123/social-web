import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { RATE_LIMITER } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import {
  RATE_LIMIT_POLICY_METADATA,
  SKIP_RATE_LIMIT_METADATA,
} from '@/core/rate-limiting/decorators/rate-limit.decorator.js';
import {
  EndpointRateLimitPolicyName,
  getEndpointRateLimitPolicy,
} from '@/core/rate-limiting/policies/rate-limit.policies.js';
import type { RateLimiter } from '@/core/rate-limiting/ports/rate-limiter.port.js';
import { ClientIpResolver } from '@/core/http/client-ip.resolver.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @Inject(RATE_LIMITER)
    private readonly rateLimiter: RateLimiter,

    private readonly clientIpResolver: ClientIpResolver,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (skipRateLimit) {
      return true;
    }

    const policyName =
      this.reflector.getAllAndOverride<EndpointRateLimitPolicyName>(
        RATE_LIMIT_POLICY_METADATA,
        [context.getHandler(), context.getClass()],
      ) ?? 'default';

    const policy = getEndpointRateLimitPolicy(policyName);
    const request = context.switchToHttp().getRequest<Request>();
    const scope = this.createScope(context, policyName);

    const result = await this.rateLimiter.consume({
      scope,
      identifier: `ip:${this.clientIpResolver.resolve(request)}`,
      ...policy,
    });

    if (result.allowed) {
      return true;
    }

    throw new DomainError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      429,
      {
        action: scope,
        retryAfterSeconds: result.retryAfterSeconds,
      },
    );
  }

  private createScope(
    context: ExecutionContext,
    policyName: EndpointRateLimitPolicyName,
  ): string {
    if (policyName !== 'default') {
      return `endpoint:${policyName}`;
    }

    return `endpoint:${context.getClass().name}.${context.getHandler().name}`;
  }
}
