import React, { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  name: string;
  path: string;
  icon: string;
};

interface MobileMenuProps {
  navItems: NavItem[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function MobileMenu({ navItems, activeTab, setActiveTab }: MobileMenuProps) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleTabClick = (tabName: string, path: string) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
    setLocation(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="px-2 py-6 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "justify-start text-base",
                  (location === item.path || activeTab === item.name.toLowerCase())
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground"
                )}
                onClick={() => handleTabClick(item.name.toLowerCase(), item.path)}
              >
                <i className={`${item.icon} mr-2`} />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}