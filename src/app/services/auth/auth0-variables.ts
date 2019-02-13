interface AuthConfig {
  clientID: string;
  domain: string;
  callbackURL: string;
}

export const AUTH_CONFIG: AuthConfig = {
  clientID: 'Re282m5GM0575vOJjhpguBptT8slmIb0',
  domain: 'mayhew3.auth0.com',
  callbackURL: 'http://localhost:4200/callback'
};
