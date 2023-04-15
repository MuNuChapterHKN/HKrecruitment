import { Application, ApplicationState } from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';

class CustomMessage {
  subject: string;
  body: string;
}

export class UpdateApplicationDto implements Partial<Application> {
  @ApiProperty({ required: false })
  state?: ApplicationState;

  @ApiProperty({ required: false })
  notes?: string;

  // @ApiProperty({ required: false })
  // customMessage?: CustomMessage;

  // @ApiProperty({ required: false })
  // additionalText?: string;
}
