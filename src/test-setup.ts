import '@testing-library/jest-dom';

// Mock Next.js server functions that don't work in test context
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Headers()),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

jest.mock('next/server', () => ({
  connection: jest.fn(async () => Promise.resolve()),
}));

// Helper to mock window.__ENV for browser tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).mockWindow = (envVars: Record<string, string>) => {
  // Set __ENV on existing window object instead of redefining window
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ENV = envVars;
  } else {
    // If window doesn't exist (shouldn't happen in jsdom), create it
    Object.defineProperty(global, 'window', {
      writable: true,
      configurable: true,
      value: {
        __ENV: envVars,
      },
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).unmockWindow = () => {
  // Clean up __ENV from window
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).__ENV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__ENV;
  }
};
