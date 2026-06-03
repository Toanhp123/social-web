import { SetMetadata } from '@nestjs/common';
import type { EndpointRateLimitPolicyName } from '@/core/rate-limiting/policies/rate-limit.policies.js';

export const RATE_LIMIT_POLICY_METADATA = 'rate-limit:policy';
export const SKIP_RATE_LIMIT_METADATA = 'rate-limit:skip';

export function RateLimit(policy: EndpointRateLimitPolicyName) {
  return SetMetadata(RATE_LIMIT_POLICY_METADATA, policy);
}

export function SkipRateLimit() {
  return SetMetadata(SKIP_RATE_LIMIT_METADATA, true);
}
