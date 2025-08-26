"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  Scale,
  LayoutDashboard,
  Users as UsersIcon,
  Briefcase,
  Handshake,
  Video,
  MessageSquare,
  BarChart3,
} from "lucide-react"

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  activePattern?: RegExp;
}

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      href: "/dashboard/clients",
      icon: UsersIcon,
      label: "Clients"
    },
    {
      href: "/dashboard/cases",
      icon: Briefcase,
      label: "Cases"
    },
    {
      href: "/dashboard/services",
      icon: Handshake,
      label: "Services"
    },
    {
      href: "/dashboard/video-calls",
      icon: Video,
      label: "Video Calls"
    },
    {
      href: "/dashboard/messages",
      icon: MessageSquare,
      label: "Messages"
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics"
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings"
    },
  ]

  // Check if a nav item is active based on pathname
  const isActive = (href: string, activePattern?: RegExp) => {
    if (activePattern) {
      return activePattern.test(pathname)
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="flex h-16 lg:h-20 items-center gap-2 lg:gap-4 gradient-header formal-shadow px-4 lg:px-6 border-b border-gray-200">
      {/* Mobile Menu */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="flex flex-col w-80 bg-white p-0">
          <SheetHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 gradient-button rounded-lg flex items-center justify-center formal-shadow">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <SheetTitle className="text-xl text-left font-bold text-black">Lawyer Portal</SheetTitle>
            </div>
            <SheetDescription className="sr-only">Navigation menu</SheetDescription>
          </SheetHeader>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href, item.activePattern)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "gradient-button text-white formal-shadow"
                      : "text-gray-700 hover:gradient-button-outline hover:formal-shadow",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg gradient-card formal-shadow">
              <UserAvatar 
                user={session?.user} 
                className="h-8 w-8"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 lg:gap-4 w-full">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="lg:hidden text-black hover:gradient-button-outline"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 gradient-button rounded-lg flex items-center justify-center formal-shadow">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-black">Lawyer Portal</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search cases, clients, documents..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 focus:border-gray-400 text-black placeholder:text-gray-500 text-sm"
            />
          </form>
        </div>

          {/* Right Side Actions */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full hover:gradient-button-outline"
              >
                <UserAvatar user={session?.user} className="h-8 w-8 lg:h-10 lg:w-10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-gray-200 formal-shadow" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-black">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-gray-600">
                    {session?.user?.email || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem asChild className="cursor-pointer text-gray-700 hover:bg-gray-50">
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-gray-700 hover:bg-gray-50">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
