import { capitalize } from "@/lib/utils"
import { Breadcrumbs } from "../Breadcrumbs"

type Props = {
  params: Promise<{
    catchAll: string[]
  }>
}

export default async function BreadcrumbsSlot(props: Props) {
  const { catchAll } = await props.params;

  return <Breadcrumbs breadcrumbs={catchAll.map((part, i, a) => ({
    label: capitalize(part),
    href: '/' + a.slice(0, i + 1).join('/')
  }))} />
}
