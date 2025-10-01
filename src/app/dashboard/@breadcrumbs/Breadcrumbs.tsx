"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export const DEFAULT_WRAPPER = (label: string, href: string) => (
  <BreadcrumbItem>
    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
  </BreadcrumbItem>
)

export const DEFAULT_PAGE_WRAPPER = (label: string, _: string) => (
  <BreadcrumbItem>
    <BreadcrumbPage>{label}</BreadcrumbPage>
  </BreadcrumbItem>
)

export function Breadcrumbs({ breadcrumbs }: {
  breadcrumbs: {
    label: string;
    href: string;
    wrapper?: (label: string, href: string) => React.ReactNode
  }[]
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((bc, i, a) => i == a.length - 1 ? (
          <Fragment key={i}>
            {(bc.wrapper ?? DEFAULT_PAGE_WRAPPER)(bc.label, bc.href)}
          </Fragment>
        ) : (
          <Fragment key={i}>
            {(bc.wrapper ?? DEFAULT_WRAPPER)(bc.label, bc.href)}
            <BreadcrumbSeparator />
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
