import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        include: ['src/**/*.spec.{ts,tsx}'],
        exclude: ['node_modules', 'build', 'examples'],
        globals: true,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.spec.{ts,tsx}', 'src/test-setup.ts', 'src/lib'],
            reporter: ['text', 'lcov'],
        },
    },
})
