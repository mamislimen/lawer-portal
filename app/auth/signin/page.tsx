"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { FcGoogle } from "react-icons/fc"
import { motion, AnimatePresence } from "framer-motion"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/client"
  
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    setSuccessMessage("")
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: false 
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      setSuccessMessage("Redirecting to your dashboard...")
      toast({
        title: "Success",
        description: "You've been signed in successfully!",
      })
      
      // Small delay before redirect to show success message
      setTimeout(() => {
        window.location.href = callbackUrl
      }, 1500)
      
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError("Invalid email or password")
        toast({
          title: "Sign In Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      } else {
        setSuccessMessage("Sign in successful! Redirecting...")
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })
        
        // Small delay before redirect to show success message
        setTimeout(() => {
          router.push(callbackUrl)
          router.refresh()
        }, 1500)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An error occurred while signing in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="w-full overflow-hidden shadow-lg">
          <CardHeader className="space-y-1 p-6 pb-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-600 mt-2">
                Sign in to access your account
              </CardDescription>
            </motion.div>
          </CardHeader>
        <CardContent className="p-6 pt-0">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <Alert variant="destructive">
                  <AlertDescription className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {successMessage}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              type="button"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-2 mb-4 h-11 transition-all duration-200 hover:shadow-md"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FcGoogle className="h-5 w-5" />
              )}
              <span>Continue with Google</span>
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>
          </motion.div>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  onClick={(e) => {
                    if (isLoading || isGoogleLoading) {
                      e.preventDefault()
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || isGoogleLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isGoogleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 black-600 hover:bg-black-700 text-white font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <span className="font-medium">Sign in</span>
              )}
            </Button>
          </motion.form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
          <Separator />
          <div className="text-center text-sm text-black-600">
            Don't have an account?{" "}
            <Link 
              href="/auth/signup" 
              className="font-medium text-black-600 hover:text-black-700 hover:underline transition-colors"
              onClick={(e) => {
                if (isLoading || isGoogleLoading) {
                  e.preventDefault()
                }
              }}
            >
              Create an account
            </Link>
          </div>
        </CardFooter>
      </Card>
      </motion.div>
    </div>
  )
}
