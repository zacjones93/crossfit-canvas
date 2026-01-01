"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNavStore } from "@/state/nav";

type NavItem = {
  name: string;
  href: Route;
};

type ProgramItem = {
  name: string;
  href: Route;
};

const ActionButtons = () => {
  const { setIsOpen } = useNavStore();

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <Button
        asChild
        onClick={() => setIsOpen(false)}
        variant="outline"
        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase text-sm px-6 rounded-sm transition-all hover:scale-105 w-full md:w-auto"
      >
        <Link href="/drop-in">Drop-In</Link>
      </Button>
      <Button
        asChild
        onClick={() => setIsOpen(false)}
        variant="outline"
        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase text-sm px-6 rounded-sm transition-all hover:scale-105 w-full md:w-auto"
      >
        <Link href="/tour">Schedule Tour</Link>
      </Button>
      <Button
        asChild
        onClick={() => setIsOpen(false)}
        className="bg-white text-black font-bold uppercase text-sm px-6 rounded-sm transition-all hover:scale-105 w-full md:w-auto"
      >
        <Link href="/intro-class">Intro Class</Link>
      </Button>
    </div>
  );
};

export function Navigation() {
  const { isOpen, setIsOpen } = useNavStore();
  const pathname = usePathname();

  const programItems: ProgramItem[] = [
    { name: "CrossFit Classes", href: "/programs/crossfit-classes" },
    { name: "Olympic Lifting", href: "/programs/olympic-lifting" },
    { name: "Nutrition", href: "/programs/nutrition" },
    { name: "Personal Training", href: "/programs/personal-training" },
    { name: "Kids Fitness Classes", href: "/programs/kids-fitness-classes" },
    { name: "Hyrox", href: "/programs/hyrox" },
  ];

  const navItems: NavItem[] = [
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Wellness", href: "/wellness" as Route },
    { name: "What is CrossFit?", href: "/what-is-crossfit" },
  ];

  const isActiveLink = (itemHref: string) => {
    if (itemHref === "/") {
      return pathname === "/";
    }
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
  };

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <Image
                src="/crossfit-canvas.jpg"
                alt="CrossFit Canvas Logo"
                width={240}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            <div className="flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group font-subheading text-white/80 hover:text-white no-underline px-4 h-20 flex items-center text-sm font-bold uppercase tracking-wide transition-colors relative",
                    isActiveLink(item.href) &&
                      "text-white after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-white"
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      "absolute left-0 bottom-0 h-[3px] w-0 bg-white transition-all group-hover:w-full",
                      isActiveLink(item.href) && "w-full"
                    )}
                  />
                </Link>
              ))}

              {/* Programs Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "group font-subheading text-white/80 hover:text-white no-underline px-4 h-20 flex items-center text-sm font-bold uppercase tracking-wide transition-colors relative outline-none",
                    pathname.startsWith("/programs") &&
                      "text-white after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-white"
                  )}
                >
                  Programs
                  <ChevronDown className="ml-1 h-4 w-4" />
                  <span
                    className={cn(
                      "absolute left-0 bottom-0 h-[3px] w-0 bg-white transition-all group-hover:w-full",
                      pathname.startsWith("/programs") && "w-full"
                    )}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black border-white/10 mt-2">
                  {programItems.map((program) => (
                    <DropdownMenuItem key={program.name} asChild>
                      <Link
                        href={program.href!}
                        className="font-subheading text-white/80 hover:text-white focus:text-white uppercase text-xs cursor-pointer focus:bg-white/10 focus-visible:outline-none"
                      >
                        {program.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ActionButtons />
          </div>
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-6 text-white hover:bg-white/10"
                >
                  <Menu className="w-9 h-9" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[240px] sm:w-[300px] bg-black border-l border-white/10"
              >
                <div className="mt-6 flow-root">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group block px-3 py-3 text-base font-subheading font-bold uppercase tracking-wide text-white/80 hover:text-white hover:bg-white/5 no-underline transition-colors relative rounded",
                          isActiveLink(item.href) &&
                            "text-white bg-white/5 border-l-4 border-white"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}

                    {/* Programs Section */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="px-3 py-2 text-xs font-subheading font-bold uppercase tracking-wider text-white/40">
                        Programs
                      </div>
                      {programItems.map((program) => (
                        <Link
                          key={program.name}
                          href={program.href!}
                          className={cn(
                            "group block px-3 py-3 text-base font-subheading font-bold uppercase tracking-wide text-white/80 hover:text-white focus:text-white hover:bg-white/5 focus:bg-white/5 no-underline transition-colors relative rounded focus-visible:outline-none",
                            pathname === program.href &&
                              "text-white bg-white/5 border-l-4 border-white"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {program.name}
                        </Link>
                      ))}
                    </div>

                    <div className="px-3 pt-4">
                      <ActionButtons />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
