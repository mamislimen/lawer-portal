import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"

// Common validation schemas
export const emailSchema = z.string().email().max(255)
export const passwordSchema = z.string().min(8).max(128)
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/)
export const uuidSchema = z.string().uuid()

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  })
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 255)
}

// Rate limiting
export class RateLimiter {
  private requests = new Map<string, number[]>()

  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const userRequests = this.requests.get(identifier)!

    // Remove old requests outside the window
    const validRequests = userRequests.filter((time) => time > windowStart)

    if (validRequests.length >= limit) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }
}
