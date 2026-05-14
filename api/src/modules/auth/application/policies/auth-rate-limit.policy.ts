import type { AuthRateLimitAction } from '@/modules/auth/application/ports/auth-rate-limiter.port.js';

export type AuthRateLimitPolicy = {
  limit: number;
  windowSeconds: number;
  blockSeconds: number;
};

const AUTH_RATE_LIMIT_POLICIES: Record<
  AuthRateLimitAction,
  AuthRateLimitPolicy
> = {
  login: {
    limit: 5,
    windowSeconds: 15 * 60,
    blockSeconds: 15 * 60,
  },
  register: {
    limit: 5,
    windowSeconds: 60 * 60,
    blockSeconds: 60 * 60,
  },
  refresh: {
    limit: 60,
    windowSeconds: 60,
    blockSeconds: 60,
  },
};

export function getAuthRateLimitPolicy(
  action: AuthRateLimitAction,
): AuthRateLimitPolicy {
  return AUTH_RATE_LIMIT_POLICIES[action];
}
