import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

interface LinkedInUserInfo {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

@Injectable()
export class LinkedInStrategy extends PassportStrategy(
  OAuth2Strategy,
  'linkedin',
) {
  constructor() {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
      scope: ['openid', 'profile', 'email'],
    });
  }

  userProfile(
    accessToken: string,
    done: (err: unknown, profile?: unknown) => void,
  ): void {
    fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data: LinkedInUserInfo) => {
        done(null, data);
      })
      .catch((error: unknown) => {
        done(error);
      });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: LinkedInUserInfo,
  ) {
    return {
      linkedinId: profile.sub,
      email: profile.email,
      firstName: profile.given_name,
      lastName: profile.family_name,
      photo: profile.picture,
    };
  }
}
