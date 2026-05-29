export function canAccessRole(userRole, allowedRoles) {
  if (!allowedRoles) {
    return Boolean(userRole)
  }

  return allowedRoles.includes(userRole)
}
