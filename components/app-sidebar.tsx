"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  SquaresFourIcon,
  ThermometerIcon,
  GearIcon,
  QuestionIcon,
  FactoryIcon,
} from "@phosphor-icons/react"

const data = {
  user: {
    name: "Operator",
    email: "operator@jasuda.local",
    avatar: "",
  },
  navMain: [
    {
      title: "Ringkasan",
      url: "/dashboard",
      icon: <SquaresFourIcon />,
    },
    {
      title: "Mesin 1",
      url: "/dashboard/mesin-1",
      icon: <ThermometerIcon />,
    },
    {
      title: "Mesin 2",
      url: "/dashboard/mesin-2",
      icon: <ThermometerIcon />,
    },
    {
      title: "Mesin 3",
      url: "/dashboard/mesin-3",
      icon: <ThermometerIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan",
      url: "#",
      icon: <GearIcon />,
    },
    {
      title: "Bantuan",
      url: "#",
      icon: <QuestionIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <FactoryIcon className="size-5!" />
              <span className="text-base font-semibold">Cup Sealer Monitor</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
