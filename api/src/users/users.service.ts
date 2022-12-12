import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByOauthId(oauthId: string): Promise<User|null> {
    const matches = await this.userRepository.findBy({ oauthId });
    return matches.length > 0 ? matches[0] : null;
  }

  async delete(user: User): Promise<User> {
    return this.userRepository.remove(user);
  }

  async create(user: User): Promise<User> {
    // add user to database if it doesn't exist
    const existingUser = await this.findByOauthId(user.oauthId);
    if (existingUser) {
      throw new ForbiddenException('User already exists');
    }
    return this.userRepository.save(user);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async getRoleForOauthId(oauthId: string): Promise<string|null> {
    const user = await this.userRepository.findOne({
      where: { oauthId },
      select: ['role'],
    })
    return user?.role;
  }
}
