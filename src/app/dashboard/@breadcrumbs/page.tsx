import { Breadcrumbs } from './Breadcrumbs';
export default function BreadcrumbsSlot() {
  return (
    <Breadcrumbs
      breadcrumbs={[
        {
          label: 'Dashboard',
          href: '/dashboard',
        },
      ]}
    />
  );
}
