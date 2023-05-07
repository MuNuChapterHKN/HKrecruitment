import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import { readFileSync } from 'fs';
import { decodeJwt } from 'jose';

export const createApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
};

const allCredentials = JSON.parse(
  readFileSync('test/user-credentials.json').toString(),
);
const auth0_issuer = process.env.AUTH0_ISSUER_URL;
const auth0_client_id = process.env.AUTH0_CLIENT_ID;
const auth0_client_secret = process.env.AUTH0_CLIENT_SECRET;
const auth0_audience = process.env.AUTH0_AUDIENCE;
export const getAccessToken = async (key: string): Promise<string> => {
  const credentials: {
    mail: string;
    password: string;
  } = allCredentials[key];

  const body = {
    grant_type: 'password',
    username: credentials.mail,
    password: credentials.password,
    audience: auth0_audience,
    scope: 'openid profile email',
    client_id: auth0_client_id,
    client_secret: auth0_client_secret,
  };
  const response = await fetch(`${auth0_issuer}oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return response.access_token;
};
export const getSub = (accessToken: string): string => {
  const decoded = decodeJwt(accessToken);
  return decoded.sub;
};

describe('e2e build test', () => {
  let app;

  beforeEach(async () => {
    app = await createApp();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
