"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const { data: session, update: updateSession, status } = useSession()
  const [userInitials, setUserInitials] = useState("")
  const [imageSrc, setImageSrc] = useState("")
  
  // Use props.user if provided, otherwise fall back to session.user
  const userData = user || session?.user
  const imageUrl = userData?.image || ''
  
  // Update image source with cache buster
  useEffect(() => {
    if (imageUrl) {
      try {
        // Convert relative URLs to absolute if needed
        let finalUrl = imageUrl
        if (imageUrl.startsWith('/')) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          finalUrl = `${baseUrl}${imageUrl}`
        }
        
        // Add cache buster to force image reload
        const url = new URL(finalUrl)
        url.searchParams.set('t', Date.now().toString())
        setImageSrc(url.toString())
      } catch (e) {
        console.error('Error processing image URL:', e)
        setImageSrc('')
      }
    } else {
      setImageSrc('')
    }
  }, [imageUrl])

  // Update session when user prop changes
  useEffect(() => {
    if (user?.image && user.image !== session?.user?.image) {
      updateSession({
        ...session,
        user: {
          ...session?.user,
          image: user.image
        }
      }).catch(console.error)
    }
  }, [user?.image, session, updateSession])

  // Set user initials
  useEffect(() => {
    if (userData?.name) {
      const names = userData.name.split(' ')
      const initials = names
        .map((name) => name[0])
        .join('')
        .toUpperCase()
      setUserInitials(initials)
    } else if (userData?.email) {
      setUserInitials(userData.email[0].toUpperCase())
    } else {
      setUserInitials('U')
    }
  }, [userData])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-8 w-8 border border-gray-200">
        <AvatarImage 
          src={imageSrc} 
          alt={userData?.name || 'User'} 
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = ''
          }}
        />
        <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      <span className="hidden lg:inline text-sm font-medium text-gray-700 truncate max-w-[120px]">
        {userData?.name || "User"}
      </span>
    </div>
  )
}
