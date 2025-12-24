import { usePathname } from 'next/navigation';

export const useLinkPrefix = () => {
  const pathname = usePathname();

  return pathname.split('/').splice(0, 3).join('/');
};
