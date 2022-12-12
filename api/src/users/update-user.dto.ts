import { Person } from '@hkrecruitment/shared/dist';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['oauthId'] as const),
) {}