'use client';

import { createContextualCan } from '@casl/react';
import { AbilityContext } from './AbilityContext';

export const Can = createContextualCan(AbilityContext.Consumer);
