import { Person, Role } from "@hkrecruitment/shared";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto implements Partial<Person> {
  @ApiProperty()
  oauthId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  sex: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone_no?: string;

  @ApiProperty()
  telegramId?: string;

  @ApiProperty({ enum: Role })
  role?: Role
}