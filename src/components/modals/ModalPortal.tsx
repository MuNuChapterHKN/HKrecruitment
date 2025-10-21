'use client';

import { cloneElement, useEffect } from 'react';
import { useCurrentModal } from './utils';

export function ModalPortal() {
  const currentModal = useCurrentModal();

  return currentModal && cloneElement(currentModal);
}
