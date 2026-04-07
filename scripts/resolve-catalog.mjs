#!/usr/bin/env node

import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDir = resolve(import.meta.dirname, '..')
const workspacePath = resolve(rootDir, 'pnpm-workspace.yaml')
const pkgPath = resolve(rootDir, 'package.json')

const workspace = readFileSync(workspacePath, 'utf8')
const catalog = {}
let inCatalog = false

for (const line of workspace.split('\n')) {
    if (/^catalog:/.test(line)) {
        inCatalog = true
        continue
    }
    if (inCatalog && /^\S/.test(line)) break
    if (inCatalog) {
        const match = line.match(/^\s+(?:'([^']+)'|"([^"]+)"|([^\s:]+)):\s*(.+)/)
        if (match) {
            catalog[match[1] ?? match[2] ?? match[3]] = match[4].trim()
        }
    }
}

copyFileSync(pkgPath, resolve(rootDir, 'package.json.bak'))

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

let resolved = 0
for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    if (!pkg[field]) continue
    for (const [name, version] of Object.entries(pkg[field])) {
        if (version === 'catalog:' || version === 'catalog:default') {
            if (catalog[name]) {
                pkg[field][name] = catalog[name]
                resolved++
            } else {
                console.warn(`⚠ No catalog entry for ${name}`)
            }
        }
    }
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`)
console.log(`✨ Resolved ${resolved} catalog references for packaging`)
