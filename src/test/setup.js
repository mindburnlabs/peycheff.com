import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for testing
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/',
    }),
  }
})

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  },
  addSubscriber: vi.fn(() => Promise.resolve({ success: true, data: {} })),
  addInquiry: vi.fn(() => Promise.resolve({ success: true, data: {} })),
}))

// Mock Analytics
vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
  trackCTA: vi.fn(),
  trackFormSubmit: vi.fn(),
  initGA: vi.fn(),
}))

// Mock Stripe
vi.mock('../lib/stripe', () => ({
  stripePromise: Promise.resolve({
    redirectToCheckout: vi.fn(() => Promise.resolve({ error: null }))
  }),
  createCheckoutSession: vi.fn(() => Promise.resolve({ success: true })),
}))
