import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type Profile,
  type StrategyOptions,
} from 'passport-google-oauth20';
import type { OAuthProfile } from '@/modules/auth/domain/types/oauth-profile.type.js';

type GoogleJsonProfile = {
  email_verified?: boolean;
  picture?: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super(createGoogleStrategyOptions(configService));
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): OAuthProfile {
    return mapGoogleProfile(profile);
  }
}

function createGoogleStrategyOptions(
  configService: ConfigService,
): StrategyOptions {
  return {
    clientID:
      configService.get<string>('oauth.google.clientId') ||
      'missing-google-client-id',
    clientSecret:
      configService.get<string>('oauth.google.clientSecret') ||
      'missing-google-client-secret',
    callbackURL: configService.getOrThrow<string>('oauth.google.callbackUrl'),
    scope: ['email', 'profile'],
  };
}

function mapGoogleProfile(profile: Profile): OAuthProfile {
  const primaryEmail = profile.emails?.[0];
  const jsonProfile = profile._json as GoogleJsonProfile | undefined;
  const photo = profile.photos?.[0]?.value ?? jsonProfile?.picture;

  return {
    provider: 'GOOGLE',
    providerId: profile.id,
    email: primaryEmail?.value ?? '',
    emailVerified: Boolean(
      primaryEmail?.verified ?? jsonProfile?.email_verified,
    ),
    name: profile.displayName,
    avatarUrl: photo,
  };
}
