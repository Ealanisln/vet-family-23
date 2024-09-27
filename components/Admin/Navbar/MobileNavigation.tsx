import React from "react";
import Link from "next/link";
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
};

export const MobileNavigation: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          <NavItem href="#" icon={<Home className="h-5 w-5" />} label="Dashboard" />
          <NavItem href="#" icon={<ShoppingCart className="h-5 w-5" />} label="Orders" />
          <NavItem href="#" icon={<Package className="h-5 w-5" />} label="Products" />
          <NavItem href="#" icon={<Users2 className="h-5 w-5" />} label="Customers" />
          <NavItem href="#" icon={<LineChart className="h-5 w-5" />} label="Analytics" />
          <NavItem href="#" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;