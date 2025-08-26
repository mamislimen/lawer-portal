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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  icon: any
  label: string
}

export function ClientHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: "/client",
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      href: "/client/cases",
      icon: Briefcase,
      label: "My Cases"
    },
    {
      href: "/client/video-calls",
      icon: Video,
      label: "Video Calls"
    },
    {
      href: "/client/messages",
      icon: MessageSquare,
      label: "Messages"
    },
    {
      href: "/client/appointments",
      icon: Calendar,
      label: "Appointments"
    },
    {
      href: "/client/documents",
      icon: FileText,
      label: "Documents"
    },
    {
      href: "/client/analytics",
      icon: BarChart3,
      label: "Analytics"
    },
    {
      href: "/client/subscription",
      icon: Crown,
      label: "Subscription"
    },
    {
      href: "/client/billing",
      icon: CreditCard,
      label: "Billing"
    },
    {
      href: "/client/profile",
      icon: User,
      label: "Profile"
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
                  key={item.href}
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
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg gradient-card formal-shadow">
              <div className="h-8 w-8 gradient-button rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">JS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-black">John Smith</p>
                <p className="text-xs text-gray-600 truncate">Premium Client</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo for mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-8 w-8 gradient-button rounded-lg flex items-center justify-center formal-shadow">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg text-black">Client Portal</span>
      </div>

      {/* Search Bar */}
      <div className="w-full flex-1 max-w-md mx-auto lg:mx-0">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search cases, documents..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 focus:border-gray-400 text-black placeholder:text-gray-500 text-sm"
          />
        </form>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1 lg:gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-black hover:gradient-button-outline h-8 w-8 lg:h-10 lg:w-10"
        >
          <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 lg:h-3 lg:w-3 bg-black rounded-full text-[8px] lg:text-[10px] font-bold text-white flex items-center justify-center">
            <span className="hidden lg:inline">2</span>
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full hover:gradient-button-outline"
            >
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback className="gradient-button text-white font-semibold text-xs lg:text-sm">
                  JS
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border-gray-200 formal-shadow" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-black">John Smith</p>
                <p className="text-xs leading-none text-gray-600">john.smith@email.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />

            <DropdownMenuItem className="cursor-pointer text-gray-700 hover:bg-gray-50">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-gray-700 hover:bg-gray-50">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
