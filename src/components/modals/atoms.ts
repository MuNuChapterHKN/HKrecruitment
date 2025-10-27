import { atom } from 'jotai';
import { ReactElement } from 'react';

export type Modal = ReactElement | null;

export const currentModalAtom = atom<{ fn: Modal }>({ fn: null });
