import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { VerifyCallback } from 'passport-jwt';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID || 'defaultClientID',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'defaultClientSecret',
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user as any); // attaches user to req.user
  }
}
