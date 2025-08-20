// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error('GOOGLE_CLIENT_ID is not defined'); })(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error('GOOGLE_CLIENT_SECRET is not defined'); })(),
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true, // مهم جدا
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    console.log('✅ Google profile:', profile);

    const { id, name, emails, photos, provider } = profile;
    return {
      provider,
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
    };
  }
}
