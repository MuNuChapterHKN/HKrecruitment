"use client";

import { createContext, useMemo } from "react";
import type { AnyAbility } from "@casl/ability";
import { defineAbilityFor } from "@/lib/abilities";
import { AuthUser, AuthUserRole } from "@/lib/auth";

const defaultAbility = defineAbilityFor({ role: AuthUserRole.Guest });
export const AbilityContext = createContext<AnyAbility>(defaultAbility);

export function AbilityProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const ability = useMemo(() => defineAbilityFor(user), [user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
