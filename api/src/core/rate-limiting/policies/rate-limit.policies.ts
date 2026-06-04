export type EndpointRateLimitPolicy = {
  limit: number;
  windowSeconds: number;
  blockSeconds: number;
};

const ENDPOINT_RATE_LIMIT_POLICIES = {
  default: {
    limit: 300,
    windowSeconds: 60,
    blockSeconds: 60,
  },
  'auth.login': {
    limit: 30,
    windowSeconds: 60,
    blockSeconds: 60,
  },
  'auth.register': {
    limit: 15,
    windowSeconds: 60,
    blockSeconds: 5 * 60,
  },
  'auth.refresh': {
    limit: 120,
    windowSeconds: 60,
    blockSeconds: 60,
  },
  'auth.logout': {
    limit: 60,
    windowSeconds: 60,
    blockSeconds: 60,
  },
  'auth.oauth': {
    limit: 30,
    windowSeconds: 60,
    blockSeconds: 60,
  },
  'auth.emailVerification.send': {
    limit: 5,
    windowSeconds: 60,
    blockSeconds: 5 * 60,
  },
  'auth.emailVerification.verify': {
    limit: 30,
    windowSeconds: 60,
    blockSeconds: 60,
  },
  'auth.passwordReset.request': {
    limit: 10,
    windowSeconds: 60,
    blockSeconds: 5 * 60,
  },
  'auth.passwordReset.confirm': {
    limit: 30,
    windowSeconds: 60,
    blockSeconds: 60,
  },
} satisfies Record<string, EndpointRateLimitPolicy>;

export type EndpointRateLimitPolicyName =
  keyof typeof ENDPOINT_RATE_LIMIT_POLICIES;

export function getEndpointRateLimitPolicy(
  policyName: EndpointRateLimitPolicyName,
): EndpointRateLimitPolicy {
  return ENDPOINT_RATE_LIMIT_POLICIES[policyName];
}
