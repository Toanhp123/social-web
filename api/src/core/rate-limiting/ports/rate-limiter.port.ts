export type RateLimitConsumeInput = {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
  blockSeconds: number;
};

export type RateLimitConsumeResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      retryAt: Date;
      retryAfterSeconds: number;
    };

export interface RateLimiter {
  consume(input: RateLimitConsumeInput): Promise<RateLimitConsumeResult>;
}
