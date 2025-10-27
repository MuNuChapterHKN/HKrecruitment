'use client';

import { cloneElement } from 'react';
import { useCurrentModal } from './utils';

export function ModalPortal() {
  const currentModal = useCurrentModal();

  return currentModal && cloneElement(currentModal);
}
