'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Can,
} from '@/components';
import { ChevronUp, Users } from 'lucide-react';
import Link from 'next/link';
import { AuthUser, AuthUserRole, AuthUserRoleName } from '@/lib/auth';
import { capitalize, cn } from '@/lib/utils';
import RecruitmentSwitcher from './RecruitmentSwitcher';
import { RecruitingSession } from '@/db/types';
import { LINKS } from './Sidebar.data';
import { usePathname } from 'next/navigation';

export type DashboardSidebarProps = {
  user: AuthUser;
  recruitment: {
    selected: RecruitingSession;
    options: Pick<RecruitingSession, 'id' | 'year' | 'semester'>[];
  };
};

export function DashboardSidebar({ user, recruitment }: DashboardSidebarProps) {
  const pathname = usePathname();
  const linkPrefix = pathname.split('/').splice(0, 3).join('/');

  const { state } = useSidebar();
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('');

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <RecruitmentSwitcher
          selected={recruitment.selected}
          options={recruitment.options}
        />
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(LINKS).map(([groupName, group], i) => (
          <Can I="read" this={group} key={i}>
            <SidebarGroup>
              <SidebarGroupLabel>{capitalize(groupName)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.links.map((link, j) => (
                    <Can I="read" this={link} key={j}>
                      <SidebarMenuItem key={link.label}>
                        <SidebarMenuButton asChild>
                          <Link href={linkPrefix + link.href}>
                            {link.icon}
                            <span>{link.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Can>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={linkPrefix + '/users'}>
                <Users />
                <span>Members</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto">
                  <Avatar className={cn(state == 'collapsed' && 'w-5 h-5')}>
                    {user.image && <AvatarImage src={user.image} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {state == 'expanded' && (
                    <>
                      <div className="flex flex-col justify-center">
                        <span>{user.name}</span>
                        <span className="text-xs text-zinc-400 capitalize">
                          {AuthUserRoleName[user.role ?? AuthUserRole.Guest]}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto h-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width)"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-700">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
