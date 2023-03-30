import { AppAbility } from '@hkrecruitment/shared';
import { SetMetadata } from '@nestjs/common';

export type PolicyHandler = (ability: AppAbility) => boolean;

export const CHECK_POLICIES_KEY = 'check-policies';
export const CheckPolicies = (...args: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, args);
