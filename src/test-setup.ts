import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Next.js server functions that don't work in test context
vi.mock('next/headers', () => ({
    headers: vi.fn(() => Promise.resolve(new Headers())),
    cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
    })),
}))

vi.mock('next/server', () => ({
    connection: vi.fn(async () => Promise.resolve()),
}))

// Helper to mock window.__ENV for browser tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).mockWindow = (envVars: Record<string, string>) => {
    // Set __ENV on existing window object instead of redefining window
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).__ENV = envVars
    } else {
        // If window doesn't exist (shouldn't happen in jsdom), create it
        Object.defineProperty(globalThis, 'window', {
            writable: true,
            configurable: true,
            value: {
                __ENV: envVars,
            },
        })
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).unmockWindow = () => {
    // Clean up __ENV from window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).__ENV) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__ENV
    }
}
