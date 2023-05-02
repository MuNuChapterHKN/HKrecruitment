import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'dotenv';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { createApp, getAccessToken, getSub } from 'test/app.e2e-spec';
import { CreateUserDto } from './create-user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let newApplicantToken: string;

  beforeAll(async () => {
    newApplicantToken = await getAccessToken('newApplicant');
  });

  beforeEach(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        oauthId: getSub(newApplicantToken), // getSub() is a helper function to get the sub from the token
        firstName: 'Test',
        lastName: 'Applicant',
        sex: 'F',
        email: 'test-applicant@example.com',
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .send({
          email: 'test-applicant@example.com',
        })
        .expect(201);
    });
  });
});
