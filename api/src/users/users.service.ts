import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AppAbility, Role, abilityForUser } from '@hkrecruitment/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByOauthId(oauthId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { oauthId } });
  }

  async delete(user: User): Promise<User> {
    return this.userRepository.remove(user);
  }

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async getRoleAndAbilityForOauthId(
    oauthId: string,
  ): Promise<[Role, AppAbility]> {
    const user = await this.userRepository.findOne({
      where: { oauthId },
      select: ['role'],
    });
    const role = user?.role ?? Role.None;
    return [role, abilityForUser({ sub: oauthId, role })];
  }
}
