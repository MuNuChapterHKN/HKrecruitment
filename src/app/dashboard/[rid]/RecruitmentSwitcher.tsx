'use client';

import {
  SidebarMenuButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenuItem,
  SidebarMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  useSidebar,
} from '@/components';
import { RecruitingSession } from '@/db/types';
import { ChevronDown, ChevronsUpDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export type RecruitmentSwitcherProps = {
  selected: RecruitingSession;
  options: Pick<RecruitingSession, 'id' | 'year' | 'semester'>[];
};

export const makeLogo = (rs: Pick<RecruitingSession, 'year'>) =>
  rs.year.toString().replace('20', '');

export default function RecruitmentSwitcher({
  selected,
  options,
}: RecruitmentSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (option: RecruitmentSwitcherProps['options'][number]) => {
    const segments = pathname.split('/');
    segments[2] = option.id;
    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {makeLogo(selected)}
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  Y{selected.year} H{selected.semester}
                </span>
                <span className="truncate text-xs font-mono text-muted-foreground">
                  {selected.id}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>

            {options.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => switchTo(option)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {makeLogo(option)}
                </div>
                Y{option.year} H{option.semester}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <Link href="/dashboard/recruitments/new" className="contents">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add recruitment
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
