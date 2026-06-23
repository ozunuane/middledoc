import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  useParams() {
    return {}
  },
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies() {
    return {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(),
    }
  },
  headers() {
    return {
      get: vi.fn(),
      getSetCookie: vi.fn(),
    }
  },
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Mock fs/promises
vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises')
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  }
})
