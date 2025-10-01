import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { AuthUser, AuthUserRole } from "@/lib/auth";

export type UserLike<T extends object> = T & Pick<AuthUser, "role">

export function defineAbilityFor<T extends object>(user: UserLike<T>) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  can('read', 'all', { canRead: { $lte: (user.role ?? AuthUserRole.Guest) } });
  can('access', 'all', { canAccess: { $lte: (user.role ?? AuthUserRole.Guest) } });

  return build({
    detectSubjectType: object => object.__typename
  });
}
