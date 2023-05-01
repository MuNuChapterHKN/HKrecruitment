import { UsersService } from './users.service';
import { TestBed } from '@automock/jest';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Role, abilityForUser } from '@hkrecruitment/shared';

describe('UsersService', () => {
  let service: UsersService;
  let model: Repository<User>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UsersService)
      .mock<Repository<User>>(getRepositoryToken(User) as string)
      .using(createMock<Repository<User>>())
      .compile();

    service = unit;
    model = unitRef.get(getRepositoryToken(User) as string);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [new User()];
      jest.spyOn(model, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(model.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByOauthId', () => {
    it('should return user if found', async () => {
      const mockUser = new User();
      mockUser.oauthId = 'test';
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser);

      expect(await service.findByOauthId('test')).toBe(mockUser);
      expect(model.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null if not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      expect(await service.findByOauthId('test2')).toBe(null);
      expect(model.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const mockUser = new User();
      jest.spyOn(model, 'remove').mockResolvedValue(mockUser as any);

      expect(await service.delete(mockUser)).toBe(mockUser);
      expect(model.remove).toHaveBeenCalledTimes(1);
      expect(model.remove).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const mockUser = new User();
      jest.spyOn(model, 'save').mockResolvedValue(mockUser as any);
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      expect(await service.create(mockUser)).toBe(mockUser);
      expect(model.save).toHaveBeenCalledTimes(1);
      expect(model.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const mockUser = new User();
      jest.spyOn(model, 'save').mockResolvedValue(mockUser as any);

      expect(await service.update(mockUser)).toBe(mockUser);
      expect(model.save).toHaveBeenCalledTimes(1);
      expect(model.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getRoleAndAbilityForOauthId', () => {
    it('should return role and ability for oauthId', async () => {
      const mockUser = new User();
      mockUser.oauthId = 'test';
      mockUser.role = Role.Admin;
      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser as any);

      const [role, _] = await service.getRoleAndAbilityForOauthId('test');
      expect(role).toBe(Role.Admin);
      expect(model.findOne).toHaveBeenCalledTimes(1);
      expect(model.findOne).toHaveBeenCalledWith({
        where: { oauthId: 'test' },
        select: ['role'],
      });
    });
  });

  it('should return role None to unknown oauthId', async () => {
    jest.spyOn(model, 'findOne').mockResolvedValue(null);

    const [role, ability] = await service.getRoleAndAbilityForOauthId('test');
    expect(role).toBe(Role.None);
    expect(model.findOne).toHaveBeenCalledTimes(1);
  });
});

// mock data for e2e testing
export const mockUsers: User[] = [
  {
    oauthId: 'oauthId1',
    firstName: 'John',
    lastName: 'Doe',
    sex: 'Male',
    email: 'john.doe@example.com',
    phone_no: '+1234567890',
    telegramId: '@johndoe',
    role: Role.Admin,
  },
  {
    oauthId: 'oauthId2',
    firstName: 'Jane',
    lastName: 'Doe',
    sex: 'Female',
    email: 'jane.doe@example.com',
    role: Role.Supervisor,
  },
  {
    oauthId: 'oauthId3',
    firstName: 'Bob',
    lastName: 'Smith',
    sex: 'Does not identify',
    email: 'bob.smith@example.com',
    phone_no: '+1357908642',
    role: Role.Clerk,
  },
  {
    oauthId: 'oauthId4',
    firstName: 'Alice',
    lastName: 'Jones',
    sex: 'Female',
    email: 'alice.jones@example.com',
    role: Role.Member,
  },
  {
    oauthId: 'oauthId5',
    firstName: 'David',
    lastName: 'Lee',
    sex: 'Male',
    email: 'david.lee@example.com',
    telegramId: '@davidlee',
    role: Role.Clerk,
  },
  {
    oauthId: 'oauthId6',
    firstName: 'Sarah',
    lastName: 'Kim',
    sex: 'Not specified',
    email: 'sarah.kim@example.com',
    phone_no: '+0123456789',
    role: Role.Applicant,
  },
  {
    oauthId: 'oauthId7',
    firstName: 'James',
    lastName: 'Chen',
    sex: 'Male',
    email: 'james.chen@example.com',
    phone_no: '+5678901234',
    telegramId: '@jameschen',
    role: Role.Member,
  },
  {
    oauthId: 'oauthId8',
    firstName: 'Olivia',
    lastName: 'Brown',
    sex: 'Female',
    email: 'olivia.brown@example.com',
    role: Role.Clerk,
  },
  {
    oauthId: 'oauthId9',
    firstName: 'William',
    lastName: 'Taylor',
    sex: 'Male',
    email: 'william.taylor@example.com',
    telegramId: '@williamtaylor',
    role: Role.Applicant,
  },
  {
    oauthId: 'oauthId10',
    firstName: 'Emma',
    lastName: 'Garcia',
    sex: 'Female',
    email: 'emma.garcia@example.com',
    phone_no: '+1234567890',
    role: Role.Admin,
  },
];
// mock service for e2e testing
export const mockUsersService = {
  findAll: () => mockUsers,
  findByOauthId: (oauthId: string) => {
    return mockUsers.find((user) => user.oauthId === oauthId) ?? null;
  },
  delete: (user: User) => {
    return user;
  },
  create: (user: User) => {
    if (mockUsers.find((u) => u.oauthId === user.oauthId))
      throw new Error('User already exists');
    mockUsers.push(user);
    return user;
  },
  update: (user: User) => {
    return user;
  },
  getRoleAndAbilityForOauthId: (oauthId: string) => {
    const user = mockUsers.find((user) => user.oauthId === oauthId);
    if (user)
      return [
        user.role,
        abilityForUser({ sub: user.oauthId, role: user.role }),
      ];
    return [Role.None, abilityForUser({ sub: oauthId, role: Role.None })];
  },
};
