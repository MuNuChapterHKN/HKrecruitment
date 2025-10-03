"use client";

import LogoLong from "@/components/logo/LogoLong"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSubButton, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { ChevronUp, CircleAlert, Gauge, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { AuthUser, AuthUserRole, AuthUserRoleName } from "@/lib/auth"
import { A } from "@/lib/abilities"
import { Can } from "@/components/ability/Can"
import { capitalize } from "@/lib/utils"
import LogoSquare from "@/components/logo/LogoSquare"
import clsx from "clsx";

const LINKS: Record<string, A<{
  links: A<{ label: string; href: string; icon?: React.ReactNode; }>[];
}>> = {
  "platform": {
    canRead: AuthUserRole.User,
    links: [{
      label: "Overview",
      href: "/dashboard",
      icon: <Gauge />,
      canRead: AuthUserRole.User,
    }, {
      label: "Candidates",
      href: "/dashboard/candidates",
      icon: <Users />,
      canRead: AuthUserRole.User,
    }, {
      label: "Alert",
      href: "/dashboard/candidates?stage=z",
      icon: <CircleAlert />,
      canRead: AuthUserRole.User,
    }]
  }
}

export function DashboardSidebar({ user }: { user: AuthUser }) {
  const { state } = useSidebar();
  const initials = user.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('');

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {state == "expanded" ? (
          <LogoLong className="text-foreground w-fit h-7 py-1 px-2" />) : (
          <LogoSquare className="text-foreground w-fit h-7 mt-[0.1em]" />
        )}
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
                          <Link href={link.href}>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto">
                  <Avatar className={clsx(state == "collapsed" && "w-5 h-5")}>
                    {user.image && <AvatarImage src={user.image} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {state == "expanded" && (
                    <>
                      <div className="flex flex-col justify-center">
                        <span>{user.name}</span>
                        <span className="text-xs text-zinc-400 capitalize">{AuthUserRoleName[user.role ?? AuthUserRole.Guest]}</span>
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
  )
}
