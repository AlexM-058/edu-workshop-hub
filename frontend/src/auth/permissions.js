export function canAccessRole(userRole, allowedRoles) {
  if (!allowedRoles) {
    return Boolean(userRole)
  }

  return allowedRoles.includes(userRole)
}

export function dashboardPathForRole(userRole) {
  if (userRole === 'admin') {
    return '/demo/admin/dashboard'
  }

  if (userRole === 'teacher' || userRole === 'referent') {
    return '/demo/dashboard/teacher'
  }

  if (userRole === 'attender' || userRole === 'professor') {
    return '/demo/dashboard/attender'
  }

  return '/sign-in'
}
