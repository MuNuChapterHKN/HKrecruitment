import { Action, Person, Role } from '@hkrecruitment/shared';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TestBed } from '@automock/jest';
import { createMockAbility } from '@hkrecruitment/shared/abilities.spec';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CannotAttachTreeChildrenEntityError } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { createMock } from '@golevelup/ts-jest';
import { UpdateUserDto } from './update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(UsersController).compile();

    controller = unit;
    service = unitRef.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockApplicant: Person = {
    oauthId: '123',
    firstName: 'John',
    lastName: 'Doe',
    sex: 'M',
    email: 'example@example.com',
    role: Role.Applicant,
  };

  const mockMember: Person = {
    oauthId: '456',
    firstName: 'Jane',
    lastName: 'Doe',
    sex: 'F',
    email: 'jane@hknpolito.org',
    role: Role.Member,
  };

  const mockUsers = [mockApplicant, mockMember];

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Person');
      });
      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers);
      expect(await controller.findAll(mockAbility)).toStrictEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it('should only return users that the user can read', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Person', { oauthId: '123' });
      });
      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers);
      expect(await controller.findAll(mockAbility)).toStrictEqual([
        mockApplicant,
      ]);
      expect(service.findAll).toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });

  describe('findByOauthId', () => {
    it('should return a user if it exists', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      expect(await controller.findByOauthId('123', mockAbility)).toStrictEqual(
        mockApplicant,
      );
      expect(service.findByOauthId).toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the user doesn't exist", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Read, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      await expect(
        controller.findByOauthId('123', mockAbility),
      ).rejects.toThrow(NotFoundException);
      expect(service.findByOauthId).toHaveBeenCalled();
    });

    it("should throw a ForbiddenException if the user can't read the user", async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Read, 'Person', { oauthId: '123' });
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      await expect(
        controller.findByOauthId('123', mockAbility),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findByOauthId).toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const mockApplicantDto: CreateUserDto = {
      ...mockApplicant,
    };
    delete mockApplicantDto.role;
    const mockMemberDto: CreateUserDto = {
      ...mockMember,
    };
    delete mockMemberDto.role;

    beforeEach(() => {
      jest
        .spyOn(service, 'create')
        .mockImplementation((user) => Promise.resolve(user));
    });

    it("should create a user if it doesn't exist and it's allowed", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      expect(
        await controller.create(mockApplicantDto, mockAbility),
      ).toStrictEqual(mockApplicant);
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it('should throw if user with that oauthId already exists', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      await expect(
        controller.create(mockApplicantDto, mockAbility),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should throw if the user is not allowed to create a user', async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Create, 'Person', { oauthId: '123' });
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      await expect(
        controller.create(mockApplicantDto, mockAbility),
      ).rejects.toThrow(ForbiddenException);
      expect(service.create).not.toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should assign the user the applicant role if the email is not internal and doesn't match the member email", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      expect(
        await controller.create(mockApplicantDto, mockAbility),
      ).toHaveProperty('role', Role.Applicant);
    });

    it('should assign the user the member role if the email is internal', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      expect(
        await controller.create(mockMemberDto, mockAbility),
      ).toHaveProperty('role', Role.Member);
    });

    it('should assign the requested role if provided', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Create, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      expect(
        await controller.create(
          { ...mockApplicantDto, role: Role.Supervisor },
          mockAbility,
        ),
      ).toHaveProperty('role', Role.Supervisor);
    });
  });

  describe('update', () => {
    const mockReq = createMock<AuthenticatedRequest>();
    const mockApplicantDto: UpdateUserDto = {
      ...mockApplicant,
    };
    delete mockApplicantDto.role;
    const mockMemberDto: UpdateUserDto = {
      ...mockMember,
    };
    delete mockMemberDto.role;
    it('should update a user if it exists and the user is allowed to update it', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      jest
        .spyOn(service, 'update')
        .mockImplementation((user) => Promise.resolve(user));
      expect(
        await controller.update(
          '123',
          { ...mockApplicantDto, firstName: 'enzo' },
          mockAbility,
          mockReq,
        ),
      ).toStrictEqual({ ...mockApplicant, firstName: 'enzo' });
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
      expect(mockReq.roleChangeChecker).not.toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the user doesn't exist", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      await expect(
        controller.update('123', mockApplicantDto, mockAbility, mockReq),
      ).rejects.toThrow(NotFoundException);
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(mockReq.roleChangeChecker).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException if the user is not allowed to update the other user', async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Update, 'Person', { oauthId: '123' });
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      await expect(
        controller.update('123', mockApplicantDto, mockAbility, mockReq),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
      expect(mockReq.roleChangeChecker).not.toHaveBeenCalled();
    });

    it("should throw an error if the user is not allowed to update other user's role in that way", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Person');
      });
      const mockReq = createMock<AuthenticatedRequest>({
        roleChangeChecker: () => false,
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      await expect(
        controller.update(
          '123',
          { ...mockApplicantDto, role: Role.Admin },
          mockAbility,
          mockReq,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
      expect(mockReq.roleChangeChecker).toHaveBeenCalledWith(
        mockApplicant.role,
        Role.Admin,
      );
    });

    it("should allow user to update other user's role if they are allowed to do so", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Update, 'Person');
      });
      const mockReq = createMock<AuthenticatedRequest>({
        roleChangeChecker: () => true,
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      jest
        .spyOn(service, 'update')
        .mockImplementation((user) => Promise.resolve(user));
      expect(
        await controller.update(
          '123',
          { ...mockApplicantDto, role: Role.Admin },
          mockAbility,
          mockReq,
        ),
      ).toStrictEqual({ ...mockApplicant, role: Role.Admin });
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
      expect(mockReq.roleChangeChecker).toHaveBeenCalledWith(
        mockApplicant.role,
        Role.Admin,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user if it exists and the user is allowed to delete it', async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Delete, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      jest.spyOn(service, 'delete').mockResolvedValue(mockApplicant);
      expect(await controller.delete('123', mockAbility)).toStrictEqual(
        mockApplicant,
      );
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.delete).toHaveBeenCalledTimes(1);
      expect(mockAbility.can).toHaveBeenCalled();
    });

    it("should throw a NotFoundException if the user doesn't exist", async () => {
      const mockAbility = createMockAbility(({ can }) => {
        can(Action.Delete, 'Person');
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(null);
      await expect(controller.delete('123', mockAbility)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.delete).not.toHaveBeenCalled();
    });

    it("should throw a ForbiddenException if the user can't delete the user", async () => {
      const mockAbility = createMockAbility(({ cannot }) => {
        cannot(Action.Delete, 'Person', { oauthId: '123' });
      });
      jest.spyOn(service, 'findByOauthId').mockResolvedValue(mockApplicant);
      await expect(controller.delete('123', mockAbility)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.findByOauthId).toHaveBeenCalledTimes(1);
      expect(service.delete).not.toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalled();
    });
  });
});
