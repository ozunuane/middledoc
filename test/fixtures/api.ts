import { vi } from 'vitest'

export const mockQuery = vi.fn()
export const mockGetOne = vi.fn()
export const mockGetMany = vi.fn()
export const mockClosePool = vi.fn()

vi.mock('@/lib/db', () => ({
  query: mockQuery,
  getOne: mockGetOne,
  getMany: mockGetMany,
  closePool: mockClosePool,
}))

// Helper to reset all mocks between tests
export function resetDbMocks() {
  mockQuery.mockReset()
  mockGetOne.mockReset()
  mockGetMany.mockReset()
  mockClosePool.mockReset()
}
