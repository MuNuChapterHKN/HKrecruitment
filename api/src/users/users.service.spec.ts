import { UsersService } from './users.service';
import { TestBed } from '@automock/jest';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Role } from '@hkrecruitment/shared';

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
