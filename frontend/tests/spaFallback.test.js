import { it, expect, describe } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFile)
const frontendRoot = join(currentDir, '../')
const repoRoot = join(currentDir, '../../')

function readRepoFile(path) {
  if (path.startsWith('frontend/')) {
    return readFileSync(join(frontendRoot, path.replace(/^frontend\//, '')), 'utf8')
  }

  if (path.startsWith('docker/') && existsSync('/docker')) {
    return readFileSync(join('/', path), 'utf8')
  }

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

describe('SPA fallback', () => {
  it('static hosting redirects all frontend routes to the SPA entrypoint', () => {
    const redirects = readFileSync(join(frontendRoot, 'public/_redirects'), 'utf8')

    expect(redirects).toMatch(/^\/\*\s+\/index\.html\s+200$/m)
})

  it('production nginx serves index.html for client-side routes', () => {
    const nginxConfig = readRepoFile('docker/frontend/nginx.conf')

    expect(nginxConfig).toMatch(/location\s+\/\s+\{[\s\S]*try_files\s+\$uri\s+\$uri\/\s+\/index\.html;/)
})

  it('frontend source does not expose placeholder hash links as navigation', () => {
    const filesWithHashLinks = sourceFiles(join(frontendRoot, 'src'))
      .filter((path) => /href=\{?["']#["']\}?/.test(readFileSync(path, 'utf8')))

    expect(filesWithHashLinks).toEqual([])
})

  it('app exposes canonical attender and teacher dashboard routes with legacy redirects', () => {
    const appSource = readRepoFile('frontend/src/App.jsx')

    expect(appSource).toMatch(/path="\/demo\/dashboard\/attender"/)
    expect(appSource).toMatch(/path="\/demo\/dashboard\/teacher"/)
    expect(appSource).toMatch(/path="\/demo\/dashboard\/teacher\/workshops"/)
    expect(appSource).toMatch(/path="\/dashboard\/attender"/)
    expect(appSource).toMatch(/path="\/dashboard\/teacher"/)
    expect(appSource).toMatch(/path="\/dashboard\/professor"[\s\S]*to="\/demo\/dashboard\/attender"/)
    expect(appSource).toMatch(/path="\/dashboard\/referent"[\s\S]*to="\/demo\/dashboard\/teacher"/)
  })
})
