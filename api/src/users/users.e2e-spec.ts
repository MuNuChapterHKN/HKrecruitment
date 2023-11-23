import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, getAccessToken, getSub } from 'test/app.e2e-spec';
import { CreateUserDto } from './create-user.dto';
import { UsersService } from './users.service';
import { Person, Role } from '@hkrecruitment/shared';
import { UpdateUserDto } from './update-user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let newApplicantToken: string;
  let newMemberToken: string;
  let knownSuperuser: string;
  let mockUsers: Person[];

  beforeAll(async () => {
    newApplicantToken = await getAccessToken('newApplicant');
    newMemberToken = await getAccessToken('newMember');
    knownSuperuser = await getAccessToken('knownSuperuser');

    mockUsers = [
      {
        oauthId: getSub(knownSuperuser),
        firstName: 'Test',
        lastName: 'Superuser',
        sex: 'F',
        email: 'known-superuser-test@example.com',
        role: Role.Admin,
      },
      {
        oauthId: getSub(newApplicantToken),
        firstName: 'Test',
        lastName: 'Applicant',
        sex: 'F',
        email: 'test-applicant@example.com',
        role: Role.Applicant,
      },
      {
        oauthId: getSub(newMemberToken),
        firstName: 'Test',
        lastName: 'Member',
        sex: 'M',
        email: 'hknrecruitment-test@hknpolito.org',
        role: Role.Member,
      },
    ];
  });

  beforeEach(async () => {
    app = await createApp();
    usersService = app.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await app.close();
  });

  const insertMockUsers = async () => {
    await Promise.all(mockUsers.map(async (u) => await usersService.create(u)));
  };

  describe('GET /users', () => {
    beforeEach(async () => {
      await insertMockUsers();
    });

    it('should return all users for admin', async () => {
      return await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${knownSuperuser}`)
        .expect(200)
        .expect((res) => expect(res.body).toHaveLength(3));
    });

    it('should return only themselves for applicants', async () => {
      return await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body;
          expect(body).toHaveLength(1);
          expect(body[0]).toHaveProperty('oauthId', getSub(newApplicantToken));
        });
    });
  });

  describe('GET /users/:oauthId', () => {
    beforeEach(async () => {
      await insertMockUsers();
    });

    it('should allow reading any user for admin', async () => {
      await request(app.getHttpServer())
        .get(`/users/${getSub(newApplicantToken)}`)
        .set('Authorization', `Bearer ${knownSuperuser}`)
        .expect(200)
        .expect((res) =>
          expect(res.body).toHaveProperty('oauthId', getSub(newApplicantToken)),
        );

      await request(app.getHttpServer())
        .get(`/users/${getSub(newMemberToken)}`)
        .set('Authorization', `Bearer ${knownSuperuser}`)
        .expect(200)
        .expect((res) =>
          expect(res.body).toHaveProperty('oauthId', getSub(newMemberToken)),
        );
    });

    it('should allow reading themselves for applicants', async () => {
      await request(app.getHttpServer())
        .get(`/users/${getSub(newApplicantToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .expect(200)
        .expect((res) =>
          expect(res.body).toHaveProperty('oauthId', getSub(newApplicantToken)),
        );
    });

    it('should not allow reading other users for applicants', async () => {
      await request(app.getHttpServer())
        .get(`/users/${getSub(newMemberToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .expect(403);
    });
  });

  describe('POST /users', () => {
    it('should create a an applicant user for external emails', async () => {
      const createUserDto: CreateUserDto = {
        oauthId: getSub(newApplicantToken), // getSub() is a helper function to get the sub from the token
        firstName: 'Test',
        lastName: 'Applicant',
        sex: 'F',
        email: 'test-applicant@example.com',
      };

      const expectedUser = {
        ...createUserDto,
        role: Role.Applicant,
        phone_no: null,
        telegramId: null,
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((res) => expect(res.body).toStrictEqual(expectedUser));

      const userInDb = await usersService.findByOauthId(createUserDto.oauthId);
      expect(userInDb).toBeDefined();
      expect(userInDb).toMatchObject(expectedUser);
    });

    it('should create a member user for internal mails', async () => {
      const createUserDto: CreateUserDto = {
        oauthId: getSub(newMemberToken), // getSub() is a helper function to get the sub from the token
        firstName: 'Test',
        lastName: 'Member',
        sex: 'M',
        email: 'hknrecruitment-test@hknpolito.org',
      };
      const expectedUser = {
        ...createUserDto,
        role: Role.Member,
        phone_no: null,
        telegramId: null,
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${newMemberToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((res) => expect(res.body).toStrictEqual(expectedUser));

      const userInDb = await usersService.findByOauthId(createUserDto.oauthId);
      expect(userInDb).toBeDefined();
      expect(userInDb).toMatchObject(expectedUser);
    });
  });

  describe('PATCH /users/:oauthId', () => {
    beforeEach(async () => {
      await insertMockUsers();
    });

    it('should allow updating themselves for applicants', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        phone_no: '1234567890',
      };
      const expectedUser = {
        ...mockUsers[1],
        ...updateUserDto,
      };

      await request(app.getHttpServer())
        .patch(`/users/${getSub(newApplicantToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .send(updateUserDto)
        .expect(200)
        .expect((res) => expect(res.body).toMatchObject(expectedUser));

      const userInDb = await usersService.findByOauthId(
        getSub(newApplicantToken),
      );
      expect(userInDb).toMatchObject(expectedUser);
    });

    it("should not allow updating other users' info for applicants", async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      await request(app.getHttpServer())
        .patch(`/users/${getSub(newMemberToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .send(updateUserDto)
        .expect(403);

      const userInDb = await usersService.findByOauthId(getSub(newMemberToken));
      expect(userInDb).toMatchObject(mockUsers[2]);
    });

    it('should not allow updating own role for applicants', async () => {
      const updateUserDto: UpdateUserDto = {
        role: Role.Member,
      };

      await request(app.getHttpServer())
        .patch(`/users/${getSub(newApplicantToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .send(updateUserDto)
        .expect(403);

      const userInDb = await usersService.findByOauthId(
        getSub(newApplicantToken),
      );
      expect(userInDb).toMatchObject(mockUsers[1]);
    });

    it('should allow updating role of others for admin', async () => {
      const updateUserDto: UpdateUserDto = {
        role: Role.Clerk,
      };

      await request(app.getHttpServer())
        .patch(`/users/${getSub(newMemberToken)}`)
        .set('Authorization', `Bearer ${knownSuperuser}`)
        .send(updateUserDto)
        .expect(200)
        .expect((res) =>
          expect(res.body).toMatchObject({
            ...mockUsers[2],
            ...updateUserDto,
          }),
        );

      const userInDb = await usersService.findByOauthId(getSub(newMemberToken));
      expect(userInDb).toMatchObject({
        ...mockUsers[2],
        ...updateUserDto,
      });
    });
  });

  describe('DELETE /users/:oauthId', () => {
    beforeEach(async () => {
      await insertMockUsers();
    });

    it('should allow deleting themselves for applicants', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${getSub(newApplicantToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .expect(200);

      const userInDb = await usersService.findByOauthId(
        getSub(newApplicantToken),
      );
      expect(userInDb).toBeNull();
    });

    it('should not allow deleting other users to applicant', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${getSub(newMemberToken)}`)
        .set('Authorization', `Bearer ${newApplicantToken}`)
        .expect(403);

      const userInDb = await usersService.findByOauthId(getSub(newMemberToken));
      expect(userInDb).toMatchObject(mockUsers[2]);
    });

    it('should allow deleting anyone to admin', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${getSub(newMemberToken)}`)
        .set('Authorization', `Bearer ${knownSuperuser}`)
        .expect(200);

      const userInDb = await usersService.findByOauthId(getSub(newMemberToken));
      expect(userInDb).toBeNull();
    });
  });
});
