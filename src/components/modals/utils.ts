"use client";

import { createStore } from 'jotai';
import { currentModalAtom, Modal } from './atoms';
import { useState } from 'react';

const modalStore = createStore();

export function openModal(component: Modal) {
  modalStore.set(currentModalAtom, {
    fn: component
  });
}

export function dismissModal(): void {
  openModal(null);
}

export function useCurrentModal() {
  const [state, setState] = useState<Modal>(null);

  modalStore.sub(currentModalAtom, () => {
    setState(modalStore.get(currentModalAtom).fn)
  })

  return state;
}
