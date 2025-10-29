"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo } from "react"
import { ChangelogBadge } from "@/components/Changelog/ChangelogBadge"
import packageJson from "../../../../package.json"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    badge?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>([])
  const { state } = useSidebar()

  // Memoize the current section to avoid recalculating on every render
  const currentSection = useMemo(() => {
    const rootUrls = ['/admin', '/admin/inventario', '/admin/clientes', '/admin/mascotas']

    return items.find(item => {
      // Special handling for root URLs
      if (rootUrls.includes(item.url)) {
        const isMainMatch = pathname === item.url
        const isSubItemMatch = item.items?.some(subItem =>
          pathname === subItem.url || pathname.startsWith(subItem.url + '/')
        )
        return isMainMatch || isSubItemMatch
      }

      // Check if pathname matches this item or any of its subitems
      const isMainItemMatch = pathname === item.url || pathname.startsWith(item.url + '/')
      const isSubItemMatch = item.items?.some(subItem =>
        pathname === subItem.url || pathname.startsWith(subItem.url + '/')
      )
      return isMainItemMatch || isSubItemMatch
    })
  }, [pathname, items])

  // Initialize open sections based on current route
  useEffect(() => {
    if (!currentSection) return

    setOpenSections(prev => {
      // Filter out sections that no longer exist
      const validSections = prev.filter(title =>
        items.some(item => item.title === title)
      )

      // Add current section if not already included
      if (!validSections.includes(currentSection.title)) {
        return [...validSections, currentSection.title]
      }

      return validSections
    })
  }, [currentSection, items])

  const isItemActive = (url: string) => {
    // Special case for root URLs - only exact match
    // This prevents /admin from matching /admin/clientes
    // and /admin/inventario from matching /admin/inventario/vacunas
    const rootUrls = ['/admin', '/admin/inventario', '/admin/clientes', '/admin/mascotas']
    if (rootUrls.includes(url)) {
      return pathname === url
    }
    // For other URLs, exact match or starts with url/
    return pathname === url || pathname.startsWith(url + '/')
  }

  const handleSectionToggle = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Versión {packageJson.version}</SidebarGroupLabel>
      <SidebarMenu className="space-y-2">
        {items.map((item) => {
          const isCollapsed = state === "collapsed"

          // When collapsed, show dropdown menu
          if (isCollapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isItemActive(item.url)}
                      className="py-3 data-[active=true]:text-sidebar-primary relative"
                    >
                      {item.icon && (
                        <div className="relative">
                          <item.icon className="h-6 w-6" />
                          {item.badge && (
                            <div className="absolute -top-1 -right-1">
                              <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </div>
                          )}
                        </div>
                      )}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-5 w-5" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="min-w-[200px]"
                  >
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link
                          href={subItem.url}
                          className={`flex items-center gap-2 cursor-pointer ${
                            isItemActive(subItem.url)
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : ""
                          }`}
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          <span>{subItem.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          // When expanded, show collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              open={openSections.includes(item.title)}
              onOpenChange={() => handleSectionToggle(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item.url)}
                    className="py-3 data-[active=true]:text-sidebar-primary"
                  >
                    {item.icon && (
                      <div>
                        <item.icon className="h-6 w-6" />
                      </div>
                    )}
                    <span className="flex items-center gap-2">
                      {item.title}
                      {item.badge && <ChangelogBadge className="ml-1" />}
                    </span>
                    <ChevronRight className="ml-auto h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="space-y-1">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isItemActive(subItem.url)}
                          className="py-2 data-[active=true]:text-sidebar-primary"
                        >
                          <Link href={subItem.url}>
                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}