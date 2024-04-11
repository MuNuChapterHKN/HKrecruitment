import {
  RecruitmentSession,
  RecruitmentSessionState,
} from '@hkrecruitment/shared';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RecruitmentSessionResponseDto
  implements Partial<RecruitmentSession>
{
  @Expose() id: number;
  @Expose() createdAt: Date;
  @Expose() state: RecruitmentSessionState;
}
