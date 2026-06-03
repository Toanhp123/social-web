export type OAuthSessionHandoffPayload = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export abstract class OAuthSessionHandoffStore {
  abstract create(payload: OAuthSessionHandoffPayload): Promise<string>;
  abstract consume(code: string): Promise<OAuthSessionHandoffPayload | null>;
}
