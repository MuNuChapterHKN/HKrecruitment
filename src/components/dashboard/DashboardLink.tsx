'use client';

import { useLinkPrefix } from '@/hooks/use-link-prefix';
import Link, { LinkProps } from 'next/link';

export function DashboardLink({
  href,
  children,
  ...otherProps
}: LinkProps & {
  children: React.ReactNode;
  className?: string;
}) {
  const linkPrefix = useLinkPrefix();

  return (
    <Link href={linkPrefix + href} {...otherProps}>
      {children}
    </Link>
  );
}
