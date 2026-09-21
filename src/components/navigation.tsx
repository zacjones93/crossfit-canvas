"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNavStore } from "@/state/nav";

type NavigationItem = {
  name: string;
  href: Route;
};

type NavigationGroup = {
  name: string;
  basePath: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    name: "Programs",
    basePath: "/programs",
    items: [
      { name: "CrossFit Classes", href: "/programs/crossfit-classes" },
      { name: "HYROX Training", href: "/programs/hyrox" },
      { name: "Olympic Lifting", href: "/programs/olympic-lifting" },
      { name: "Personal Training", href: "/programs/personal-training" },
      { name: "Nutrition", href: "/programs/nutrition" },
      {
        name: "Kids Fitness",
        href: "/programs/kids-fitness-classes" as Route,
      },
    ],
  },
  {
    name: "Services",
    basePath: "/services",
    items: [
      { name: "On-Site Services", href: "/services" as Route },
      { name: "Recovery & Wellness", href: "/wellness" as Route },
    ],
  },
  {
    name: "About",
    basePath: "/about",
    items: [
      { name: "About CrossFit Canvas", href: "/about" },
      { name: "Meet the Coaches", href: "/about#coaches" as Route },
      { name: "What Is CrossFit?", href: "/what-is-crossfit" },
    ],
  },
];

const isPathActive = (pathname: string, href: string) => {
  const path = href.split("#")[0];
  return pathname === path || pathname.startsWith(`${path}/`);
};

function DesktopMenu({
  group,
  pathname,
}: {
  group: NavigationGroup;
  pathname: string;
}) {
  const isActive = group.items.some((item) =>
    isPathActive(pathname, item.href)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group relative flex h-[4.5rem] items-center gap-1.5 px-3 font-subheading text-xs font-bold uppercase tracking-[0.08em] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-inset",
          isActive && "text-white"
        )}
      >
        {group.name}
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
        <span
          className={cn(
            "absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 bg-crimson transition-transform duration-200 group-hover:scale-x-100",
            isActive && "scale-x-100"
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={0}
        className="min-w-56 rounded-none border border-white/15 border-t-2 border-t-crimson bg-black p-2 shadow-xl"
      >
        {group.items.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link
              href={item.href}
              className={cn(
                "min-h-11 cursor-pointer rounded-none px-3 font-subheading text-xs font-bold uppercase tracking-wide text-white/65 transition-colors focus:bg-white/10 focus:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson",
                isPathActive(pathname, item.href) && "bg-white/5 text-white"
              )}
            >
              {item.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileMenuGroup({
  group,
  pathname,
  closeMenu,
}: {
  group: NavigationGroup;
  pathname: string;
  closeMenu: () => void;
}) {
  const isActive = group.items.some((item) =>
    isPathActive(pathname, item.href)
  );

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <CollapsibleTrigger
        className={cn(
          "flex min-h-13 w-full items-center justify-between border-b border-white/10 px-1 text-left font-subheading text-base font-bold uppercase tracking-wide text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-inset",
          isActive && "text-white"
        )}
      >
        {group.name}
        <ChevronDown
          className="h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-b border-white/10 pb-2">
        {group.items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMenu}
            className={cn(
              "flex min-h-11 items-center border-l border-transparent px-4 font-sans text-sm font-medium text-white/60 no-underline transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-inset",
              isPathActive(pathname, item.href) &&
                "border-crimson bg-white/5 text-white"
            )}
          >
            {item.name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function Navigation() {
  const { isOpen, setIsOpen } = useNavStore();
  const pathname = usePathname();
  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-0 z-50 border-b border-white/10 bg-black"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link
            href="/"
            aria-label="CrossFit Canvas home"
            className="flex h-full items-center transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
          >
            <Image
              src="/crossfit-canvas.jpg"
              alt=""
              width={240}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>

          <div className="hidden items-center lg:flex">
            <div className="flex items-center">
              {navigationGroups.map((group) => (
                <DesktopMenu
                  key={group.name}
                  group={group}
                  pathname={pathname}
                />
              ))}
              <Link
                href="/pricing"
                className={cn(
                  "group relative flex h-[4.5rem] items-center px-3 font-subheading text-xs font-bold uppercase tracking-[0.08em] text-white/70 no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-inset",
                  isPathActive(pathname, "/pricing") && "text-white"
                )}
              >
                Pricing
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 bg-crimson transition-transform duration-200 group-hover:scale-x-100",
                    isPathActive(pathname, "/pricing") && "scale-x-100"
                  )}
                />
              </Link>
            </div>

            <div className="ml-5 flex items-center gap-4 border-l border-white/15 pl-5">
              <Link
                href="/drop-in"
                className="font-subheading text-xs font-bold uppercase tracking-[0.08em] text-white/65 no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
              >
                Drop-In
              </Link>
              <Link
                href="/intro-class"
                className="flex min-h-11 items-center bg-crimson px-5 font-subheading text-xs font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#ef244a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Start Here
              </Link>
            </div>
          </div>

          <div className="flex items-center lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="h-dvh max-h-dvh w-[min(88vw,22rem)] gap-0 overflow-hidden border-l border-white/15 bg-black p-0 text-white"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-16">
                  <SheetTitle className="font-heading text-4xl uppercase tracking-wide text-white">
                    Explore Canvas
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-sm text-white/50">
                    Find your training, services, and next step.
                  </SheetDescription>

                  <div className="mt-7">
                    {navigationGroups.map((group) => (
                      <MobileMenuGroup
                        key={group.name}
                        group={group}
                        pathname={pathname}
                        closeMenu={closeMenu}
                      />
                    ))}
                    <Link
                      href="/pricing"
                      onClick={closeMenu}
                      className={cn(
                        "flex min-h-13 items-center border-b border-white/10 px-1 font-subheading text-base font-bold uppercase tracking-wide text-white/75 no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-inset",
                        isPathActive(pathname, "/pricing") && "text-white"
                      )}
                    >
                      Pricing
                    </Link>
                  </div>
                </div>

                <SheetFooter className="border-t border-white/15 bg-black px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <Link
                    href="/drop-in"
                    onClick={closeMenu}
                    className="flex min-h-11 items-center justify-center border border-white/35 font-subheading text-sm font-bold uppercase tracking-wide text-white no-underline transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
                  >
                    Drop-In
                  </Link>
                  <Link
                    href="/intro-class"
                    onClick={closeMenu}
                    className="flex min-h-12 items-center justify-center bg-crimson font-subheading text-sm font-bold uppercase tracking-wide text-white no-underline transition-colors hover:bg-[#ef244a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Start Here
                  </Link>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
