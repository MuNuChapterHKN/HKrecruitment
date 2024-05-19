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

  /**
   * Find all users
   * @returns {Promise<User[]>} - List of users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Find a user by their OAuth ID
   * @param {string} oauthId - OAuth ID of the user
   * @returns {Promise<User | null>} - User with the given OAuth ID
   */
  async findByOauthId(oauthId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { oauthId } });
  }

  /**
   * Delete a user
   * @param {User} user - User to delete
   * @returns {Promise<User>} - Deleted user
   */
  async delete(user: User): Promise<User> {
    return this.userRepository.remove(user);
  }

  /**
   * Create a user
   * @param {User} user - User to create
   * @returns {Promise<User>} - Created user
   */
  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Update a user
   * @param {User} user - User to update
   * @returns {Promise<User>} - Updated user
   */
  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Get the role and abilities for a user
   * @param {string} oauthId - OAuth ID of the user
   * @returns {[Role, AppAbility]} - Role and abilities for the user
   */
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
