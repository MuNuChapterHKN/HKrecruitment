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

  @ApiProperty({ required: false })
  phone_no?: string;

  @ApiProperty({ required: false })
  telegramId?: string;

  @ApiProperty({ enum: Role, required: false })
  role?: Role
}