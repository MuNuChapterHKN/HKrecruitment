import { atom } from 'jotai';
import { ReactElement } from 'react';

export type ModalProps = {};

export type Modal = ReactElement<ModalProps> | null;

export const currentModalAtom = atom<{ fn: Modal }>({ fn: null });
