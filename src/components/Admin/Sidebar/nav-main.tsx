"use client"

import { usePathname, useRouter } from "next/navigation"
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
} from "@/components/ui/sidebar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useState, useEffect } from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [openSections, setOpenSections] = useState<string[]>([])

  // Redirect to admin dashboard if on a POS page (since POS functionality is disabled)
  useEffect(() => {
    if (pathname.startsWith('/admin/pos')) {
      router.replace('/admin')
    }
  }, [pathname, router])

  // Inicializar las secciones abiertas basado en la ruta actual
  useEffect(() => {
    // Find the current section based on URL
    const currentSection = items.find(item => 
      pathname.startsWith(item.url) || 
      item.items?.some(subItem => pathname.startsWith(subItem.url))
    )
    
    // Update openSections: keep only valid sections and add current if needed
    setOpenSections(prev => {
      // First, filter out sections that no longer exist
      const validSections = prev.filter(title => 
        items.some(item => item.title === title)
      )
      
      // Then, add current section if not already included
      if (currentSection && !validSections.includes(currentSection.title)) {
        return [...validSections, currentSection.title]
      }
      
      return validSections
    })
  }, [pathname, items])

  const isItemActive = (url: string) => pathname.startsWith(url)

  const handleSectionToggle = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const SubMenuContent = ({ item }: { item: typeof items[0] }) => (
    <div className="space-y-1">
      {item.items?.map((subItem) => (
        <Link 
          key={subItem.title}
          href={subItem.url}
          className={`
            flex items-center gap-2 rounded-md px-2 py-2 text-sm
            hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] transition-colors duration-200
            ${isItemActive(subItem.url) ? 'bg-[#47b3b6]/15 text-[#47b3b6]' : 'text-gray-700'}
          `}
        >
          {subItem.icon && <subItem.icon className="h-4 w-4" />}
          <span>{subItem.title}</span>
        </Link>
      ))}
    </div>
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Versión 1.0</SidebarGroupLabel>
      <SidebarMenu className="space-y-2">
        {items.map((item) => (
          <HoverCard key={item.title} openDelay={200} closeDelay={200}>
            <Collapsible
              asChild
              open={openSections.includes(item.title)}
              onOpenChange={() => handleSectionToggle(item.title)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <HoverCardTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      className="py-3"
                      data-active={isItemActive(item.url)}
                    >
                      {item.icon && (
                        <div className="">
                          <item.icon className="h-6 w-6" />
                        </div>
                      )}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </HoverCardTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="space-y-1">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          asChild 
                          className="py-2"
                          data-active={isItemActive(subItem.url)}
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
                <HoverCardContent 
                  side="right" 
                  align="start" 
                  className="w-64 p-2 group-data-[collapsible=default]:hidden"
                >
                  <SubMenuContent item={item} />
                </HoverCardContent>
              </SidebarMenuItem>
            </Collapsible>
          </HoverCard>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}