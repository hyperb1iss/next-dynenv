#!/usr/bin/env node

import { spawn } from 'node:child_process'
import http from 'node:http'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

const BUILD_TIME_VALUE = 'build-time-value'
const RUNTIME_VALUE = 'runtime-value'

console.log('🧪 Starting integration test for next-dynenv\n')

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
            res.on('end', () =>
                resolve({
                    status: res.statusCode ?? 0,
                    body: data,
                }),
            )
        }).on('error', reject)
    })
}

// Poll until the server answers, instead of guessing how long startup takes
async function waitForServer(url, timeoutMs) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
        try {
            await httpGet(url)
            return
        } catch {
            await setTimeout(250)
        }
    }
    throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`)
}

const TEST_APP_DIR = join(process.cwd(), 'test-app')

async function main() {
    let serverProcess = null
    let exitCode = 0

    try {
        // Step 1: Install dependencies
        console.log('📦 Installing test app dependencies...')
        await runCommand('pnpm', ['install'], { cwd: TEST_APP_DIR })
        console.log('✅ Dependencies installed\n')

        // Step 2: Build with build-time env var
        console.log(`🔨 Building with NEXT_PUBLIC_TEST_VAR=${BUILD_TIME_VALUE}...`)
        await runCommand('pnpm', ['build'], {
            cwd: TEST_APP_DIR,
            env: {
                ...process.env,
                NEXT_PUBLIC_TEST_VAR: BUILD_TIME_VALUE,
            },
        })
        console.log('✅ Build complete\n')

        // Step 3: Start server with runtime env var
        console.log(`🚀 Starting server with NEXT_PUBLIC_TEST_VAR=${RUNTIME_VALUE}...`)
        serverProcess = spawn('node', ['.next/standalone/test-app/server.js'], {
            cwd: TEST_APP_DIR,
            env: {
                ...process.env,
                NEXT_PUBLIC_TEST_VAR: RUNTIME_VALUE,
                PORT: '3456',
                HOSTNAME: '0.0.0.0',
            },
            stdio: 'pipe',
        })
        serverProcess.stdout?.on('data', (data) => process.stdout.write(`[server] ${data}`))
        serverProcess.stderr?.on('data', (data) => process.stderr.write(`[server err] ${data}`))

        // Wait for server to be ready
        console.log('⏳ Waiting for server to start...')
        await waitForServer('http://localhost:3456/', 30_000)

        // Step 4: Test the home page
        console.log('🧪 Testing script mode (/)...')
        const homePage = await httpGet('http://localhost:3456/')
        console.log(`HTTP status (/): ${homePage.status}`)

        // Check for runtime value
        if (homePage.body.includes(`data-testid="server-value">${RUNTIME_VALUE}</`)) {
            console.log('✅ Server-side: Runtime value found!')
        } else if (homePage.body.includes(`data-testid="server-value">${BUILD_TIME_VALUE}</`)) {
            throw new Error('❌ Server-side: Build-time value found (should be runtime!)')
        } else {
            console.log('⚠️  Server-side: Could not find test value in HTML')

            // Try to find what value is actually there
            const serverValueMatch = homePage.body.match(/data-testid="server-value">([^<]*)</)
            if (serverValueMatch) {
                console.log(`    Found value: "${serverValueMatch[1]}"`)
                console.log(`    Expected: "${RUNTIME_VALUE}"`)
            } else {
                console.log('    data-testid="server-value" element not found at all')
            }

            console.log('    HTML snippet:', homePage.body.slice(0, 500))
            throw new Error('❌ Server-side: Runtime value not found in HTML')
        }

        // Check window.__ENV injection (with Object.freeze wrapper)
        const expectedScript = `window['__ENV'] = Object.freeze({"NEXT_PUBLIC_TEST_VAR":"${RUNTIME_VALUE}"`
        const expectedScriptEscaped = `window['__ENV'] = Object.freeze({\\"NEXT_PUBLIC_TEST_VAR\\":\\"${RUNTIME_VALUE}\\"`

        if (!homePage.body.includes(expectedScript) && !homePage.body.includes(expectedScriptEscaped)) {
            console.log('\n⚠️  Client-side: window.__ENV script not found in HTML')
            console.log('    Expected (unescaped):', expectedScript)
            console.log('    Expected (escaped):', expectedScriptEscaped)

            // Try to find any __ENV references
            const envMatch = homePage.body.match(/window\['__ENV'\][^}]*}/g)
            if (envMatch) {
                console.log('    Found:', envMatch[0])
            } else {
                console.log('    No __ENV script found at all')
                // Show script tags in the HTML
                const scriptMatches = homePage.body.match(/<script[^>]*>.*?<\/script>/gs)
                if (scriptMatches) {
                    console.log(`    Found ${scriptMatches.length} script tag(s):`)
                    for (const script of scriptMatches.slice(0, 3)) {
                        console.log('    -', script.slice(0, 100).replace(/\n/g, ' '))
                    }
                }
            }

            throw new Error('❌ Client-side: window.__ENV script not found in HTML')
        }

        console.log('✅ Client-side: window.__ENV script found!')

        // Step 5: Test context provider page
        console.log('\n🧪 Testing context mode (/context)...')
        const contextPage = await httpGet('http://localhost:3456/context')
        console.log(`HTTP status (/context): ${contextPage.status}`)

        if (contextPage.body.includes(`data-testid="context-value">${BUILD_TIME_VALUE}</`)) {
            throw new Error('❌ Context provider: Build-time value found (should be runtime!)')
        }
        if (!contextPage.body.includes(`data-testid="context-value">${RUNTIME_VALUE}</`)) {
            throw new Error('❌ Context provider: Runtime value missing in HTML')
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
        exitCode = 1
    } finally {
        // Cleanup: Ensure server process is killed
        if (serverProcess && !serverProcess.killed) {
            console.log('\n🧹 Shutting down server...')
            serverProcess.kill('SIGTERM')

            // Give it a moment to shut down gracefully
            await setTimeout(1000)

            // Force kill if still running
            if (!serverProcess.killed) {
                console.log('⚠️  Forcing server shutdown...')
                serverProcess.kill('SIGKILL')
            }
        }
    }

    process.exit(exitCode)
}

main()
