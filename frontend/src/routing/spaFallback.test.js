import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { test } from 'node:test'

const frontendRoot = fileURLToPath(new URL('../../', import.meta.url))
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))

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

test('static hosting redirects all frontend routes to the SPA entrypoint', () => {
  const redirects = readFileSync(join(frontendRoot, 'public/_redirects'), 'utf8')

  assert.match(redirects, /^\/\*\s+\/index\.html\s+200$/m)
})

test('production nginx serves index.html for client-side routes', () => {
  const nginxConfig = readRepoFile('docker/frontend/nginx.conf')

  assert.match(nginxConfig, /location\s+\/\s+\{[\s\S]*try_files\s+\$uri\s+\$uri\/\s+\/index\.html;/)
})

test('vercel rewrites client-side routes to the SPA entrypoint', () => {
  const vercelConfig = JSON.parse(readRepoFile('frontend/vercel.json'))

  assert.deepEqual(vercelConfig.rewrites, [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ])
})

test('frontend source does not expose placeholder hash links as navigation', () => {
  const filesWithHashLinks = sourceFiles(join(frontendRoot, 'src'))
    .filter((path) => /href=\{?["']#["']\}?/.test(readFileSync(path, 'utf8')))

  assert.deepEqual(filesWithHashLinks, [])
})

test('app exposes canonical attender and teacher dashboard routes with legacy redirects', () => {
  const appSource = readRepoFile('frontend/src/App.jsx')

  assert.match(appSource, /path="\/demo\/dashboard\/attender"/)
  assert.match(appSource, /path="\/demo\/dashboard\/attender"[\s\S]*roles=\{\['attender', 'professor'\]\}/)
  assert.match(appSource, /path="\/demo\/dashboard\/teacher"/)
  assert.match(appSource, /path="\/demo\/dashboard\/teacher\/workshops"/)
  assert.match(appSource, /path="\/demo\/dashboard\/teacher\/workshops\/:id\/participants"/)
  assert.match(appSource, /path="\/dashboard\/attender"/)
  assert.match(appSource, /path="\/dashboard\/teacher"/)
  assert.match(appSource, /path="\/demo\/dashboard\/professor"[\s\S]*to="\/demo\/dashboard\/attender"/)
  assert.match(appSource, /path="\/demo\/dashboard\/referent"[\s\S]*to="\/demo\/dashboard\/teacher"/)
  assert.match(appSource, /path="\/dashboard\/professor"[\s\S]*to="\/demo\/dashboard\/attender"/)
  assert.match(appSource, /path="\/dashboard\/referent"[\s\S]*to="\/demo\/dashboard\/teacher"/)
  assert.match(appSource, /path="\/dashboard\/referent\/workshops\/:id\/participants"[\s\S]*WorkshopParticipantsRedirect/)
})

test('app exposes final support pages instead of placeholder navigation targets', () => {
  const appSource = readRepoFile('frontend/src/App.jsx')

  assert.match(appSource, /path="\/demo\/certificates"/)
  assert.match(appSource, /path="\/demo\/history"/)
  assert.match(appSource, /path="\/demo\/profile"/)
  assert.match(appSource, /path="\/demo\/resources"/)
  assert.match(appSource, /path="\/demo\/admin\/dashboard"/)
  assert.match(appSource, /path="\/demo\/admin\/workshops"/)
  assert.match(appSource, /path="\/certificates"[\s\S]*to="\/demo\/certificates"/)
  assert.match(appSource, /path="\/history"[\s\S]*to="\/demo\/history"/)
  assert.match(appSource, /path="\/profile"[\s\S]*to="\/demo\/profile"/)
  assert.match(appSource, /path="\/resources"[\s\S]*to="\/demo\/resources"/)
  assert.match(appSource, /path="\/register\/attender"[\s\S]*to="\/demo\/profile"/)
  assert.match(appSource, /path="\/admin\/dashboard"[\s\S]*to="\/demo\/admin\/dashboard"/)
  assert.match(appSource, /path="\/admin\/workshops"[\s\S]*to="\/demo\/admin\/workshops"/)
})

test('role shells link to all final pages reachable by that role', () => {
  const topNavSource = readRepoFile('frontend/src/components/TopNav.jsx')
  const dashboardShellSource = readRepoFile('frontend/src/components/DashboardShell.jsx')
  const adminShellSource = readRepoFile('frontend/src/components/AdminShell.jsx')

  for (const path of ['/catalog', '/demo/dashboard/attender', '/demo/history', '/demo/certificates', '/demo/resources', '/demo/profile']) {
    assert.match(dashboardShellSource, new RegExp(`to: '${path.replaceAll('/', '\\/')}'`))
  }

  for (const path of ['/catalog', '/demo/dashboard/teacher', '/demo/dashboard/teacher/workshops', '/demo/dashboard/teacher/workshops/new', '/demo/dashboard/teacher/analytics', '/demo/certificates', '/demo/resources', '/demo/profile']) {
    assert.match(dashboardShellSource, new RegExp(`to: '${path.replaceAll('/', '\\/')}'`))
  }

  for (const path of ['/demo/admin/dashboard', '/demo/admin/users', '/demo/admin/workshops', '/demo/admin/settings', '/demo/admin/audit', '/demo/certificates', '/demo/resources', '/demo/profile']) {
    assert.match(adminShellSource, new RegExp(`to: '${path.replaceAll('/', '\\/')}'`))
  }

  assert.match(topNavSource, /to: '\/demo\/resources'/)
  assert.doesNotMatch(topNavSource, /labelKey: 'nav\.resources', to: '\/'/)
  assert.doesNotMatch(dashboardShellSource, /register\/attender/)
})
