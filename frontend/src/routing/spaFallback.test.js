import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { test } from 'node:test'

const frontendRoot = fileURLToPath(new URL('../../', import.meta.url))
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))

function readRepoFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8')
}

function sourceFiles(dir) {
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry)
      return statSync(path).isDirectory() ? sourceFiles(path) : [path]
    })
    .filter((path) => /\.(jsx?|tsx?)$/.test(path))
}

test('static hosting redirects all frontend routes to the SPA entrypoint', () => {
  const redirects = readFileSync(join(frontendRoot, 'public/_redirects'), 'utf8')

  assert.match(redirects, /^\/\*\s+\/index\.html\s+200$/m)
})

test('production nginx serves index.html for client-side routes', () => {
  const nginxConfig = readRepoFile('docker/frontend/nginx.conf')

  assert.match(nginxConfig, /location\s+\/\s+\{[\s\S]*try_files\s+\$uri\s+\$uri\/\s+\/index\.html;/)
})

test('frontend source does not expose placeholder hash links as navigation', () => {
  const filesWithHashLinks = sourceFiles(join(frontendRoot, 'src'))
    .filter((path) => /href=\{?["']#["']\}?/.test(readFileSync(path, 'utf8')))

  assert.deepEqual(filesWithHashLinks, [])
})
