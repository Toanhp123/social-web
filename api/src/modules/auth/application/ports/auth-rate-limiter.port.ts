export type AuthRateLimitAction = 'login' | 'register' | 'refresh' | 'oauth';

export type AuthRateLimitInput = {
  action: AuthRateLimitAction;
  ip?: string;
  subject?: string;
  deviceId?: string;
};

export interface AuthRateLimiter {
  assertAllowed(input: AuthRateLimitInput): Promise<void>;
}
