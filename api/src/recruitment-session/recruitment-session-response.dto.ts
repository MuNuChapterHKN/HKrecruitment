import {
  RecruitmentSession,
  RecruitmentSessionState,
} from '@hkrecruitment/shared/recruitment-session';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RecruitmentSessionResponseDto
  implements Partial<RecruitmentSession>
{
  @Expose() id: number;
  @Expose() createdAt: Date;
  @Expose() state: RecruitmentSessionState;
}
