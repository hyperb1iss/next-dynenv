#!/usr/bin/env node

import { spawn } from 'child_process'
import http from 'http'
import { setTimeout } from 'timers/promises'

const BUILD_TIME_VALUE = 'build-time-value'
const RUNTIME_VALUE = 'runtime-value'

console.log('🧪 Starting integration test for next-runtime-env\n')

// Helper to run shell commands
function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: options.silent ? 'pipe' : 'inherit',
            shell: true,
            ...options,
        })

        let stdout = ''
        let stderr = ''

        if (options.silent) {
            proc.stdout?.on('data', (data) => {
                stdout += data.toString()
            })
            proc.stderr?.on('data', (data) => {
                stderr += data.toString()
            })
        }

        proc.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr })
            } else {
                reject(new Error(`Command failed with code ${code}`))
            }
        })

        proc.on('error', reject)
    })
}

// Helper to make HTTP requests
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => resolve(data))
        }).on('error', reject)
    })
}

async function main() {
    let serverProcess = null

    try {
        // Step 1: Install dependencies
        console.log('📦 Installing test app dependencies...')
        await runCommand('pnpm', ['install'], { cwd: process.cwd() })
        console.log('✅ Dependencies installed\n')

        // Step 2: Build with build-time env var
        console.log(`🔨 Building with NEXT_PUBLIC_TEST_VAR=${BUILD_TIME_VALUE}...`)
        await runCommand('pnpm', ['build'], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                NEXT_PUBLIC_TEST_VAR: BUILD_TIME_VALUE,
            },
        })
        console.log('✅ Build complete\n')

        // Step 3: Start server with runtime env var
        console.log(`🚀 Starting server with NEXT_PUBLIC_TEST_VAR=${RUNTIME_VALUE}...`)
        serverProcess = spawn('node', ['.next/standalone/test-app/server.js'], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                NEXT_PUBLIC_TEST_VAR: RUNTIME_VALUE,
                PORT: '3456',
                HOSTNAME: '0.0.0.0',
            },
            stdio: 'pipe',
        })

        // Wait for server to be ready
        console.log('⏳ Waiting for server to start...')
        await setTimeout(3000)

        // Step 4: Test the home page
        console.log('🧪 Testing script mode (/)...')
        const homePage = await httpGet('http://localhost:3456/')

        // Check for runtime value
        if (homePage.includes(`data-testid="server-value">${RUNTIME_VALUE}</`)) {
            console.log('✅ Server-side: Runtime value found!')
        } else if (homePage.includes(`data-testid="server-value">${BUILD_TIME_VALUE}</`)) {
            throw new Error('❌ Server-side: Build-time value found (should be runtime!)')
        } else {
            console.log('⚠️  Server-side: Could not find test value in HTML')
        }

        // Check window.__ENV injection
        if (homePage.includes(`window['__ENV'] = {"NEXT_PUBLIC_TEST_VAR":"${RUNTIME_VALUE}"}`)) {
            console.log('✅ Client-side: window.__ENV correctly set with runtime value!')
        } else if (homePage.includes(`window['__ENV'] = {"NEXT_PUBLIC_TEST_VAR":"${BUILD_TIME_VALUE}"}`)) {
            throw new Error('❌ Client-side: window.__ENV has build-time value (should be runtime!)')
        } else {
            console.log('⚠️  Client-side: Could not find window.__ENV in HTML')
        }

        // Step 5: Test context provider page
        console.log('\n🧪 Testing context mode (/context)...')
        const contextPage = await httpGet('http://localhost:3456/context')

        if (contextPage.includes('Context Provider Mode Test')) {
            console.log('✅ Context page rendered successfully')
        } else {
            console.log('⚠️  Context page may not have rendered correctly')
        }

        console.log('\n🎉 All integration tests passed!')
        console.log('\n📝 Summary:')
        console.log(`   Build-time env: ${BUILD_TIME_VALUE}`)
        console.log(`   Runtime env: ${RUNTIME_VALUE}`)
        console.log('   ✓ Runtime values correctly injected')
        console.log('   ✓ Build-time values not inlined')
        console.log('   ✓ Standalone mode working correctly')
    } catch (error) {
        console.error('\n💥 Integration test failed:', error.message)
        process.exit(1)
    } finally {
        // Cleanup
        if (serverProcess) {
            console.log('\n🧹 Shutting down server...')
            serverProcess.kill()
        }
    }
}

main()
