"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Video,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  Crown,
  CreditCard,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { signOut } from "next-auth/react"

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ClientHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/client",
      icon: LayoutDashboard,
    },
    {
      name: "My Cases",
      href: "/client/cases",
      icon: Briefcase,
    },
    {
      name: "Video Calls",
      href: "/client/video-calls",
      icon: Video,
    },
    {
      name: "Messages",
      href: "/client/messages",
      icon: MessageSquare,
    },
    {
      name: "Appointments",
      href: "/client/appointments",
      icon: Calendar,
    },
    {
      name: "Documents",
      href: "/client/documents",
      icon: FileText,
    },
    {
      name: "Analytics",
      href: "/client/analytics",
      icon: BarChart3,
    },
    {
      name: "Subscription",
      href: "/client/subscription",
      icon: Crown,
    },
    {
      name: "Billing",
      href: "/client/billing",
      icon: CreditCard,
    },
    {
      name: "Profile",
      href: "/client/profile",
      icon: User,
    },
  ]

  return (
    <header className="flex h-16 lg:h-20 items-center gap-2 lg:gap-4 gradient-header formal-shadow px-4 lg:px-6 border-b border-gray-200">
      {/* Mobile Menu */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 lg:hidden text-black hover:gradient-button-outline">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col w-80 bg-white p-0">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="h-10 w-10 gradient-button rounded-lg flex items-center justify-center formal-shadow">
              <User className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-black">Client Portal</span>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "gradient-button text-white formal-shadow"
                      : "text-gray-700 hover:gradient-button-outline hover:formal-shadow",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Search */}
      <div className="hidden lg:flex flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search"
          className="w-full rounded-full bg-gray-50 pl-10 focus-visible:ring-1 focus-visible:ring-gray-300"
        />
      </div>

      <div className="flex items-center gap-2 lg:gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full hover:gradient-button-outline p-0"
            >
              <UserAvatar />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border-gray-200 formal-shadow p-2" align="end" forceMount>
            <div className="flex items-center gap-3 p-2">
              <UserAvatar />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {status === 'authenticated' && session?.user?.name ? session.user.name : 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {status === 'authenticated' && session?.user?.email ? session.user.email : ''}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator className="my-2 bg-gray-200" />
            <DropdownMenuItem asChild>
              <Link href="/client/profile" className="w-full cursor-pointer flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/client/settings" className="w-full cursor-pointer flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-gray-200" />
            <DropdownMenuItem 
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full cursor-pointer flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
