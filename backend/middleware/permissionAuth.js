const ROLE_PERMISSIONS = {
  super_admin: ['*'],
  college_admin: [
    'college.view', 'college.manage',
    'department.view', 'department.manage',
    'user.view', 'user.manage',
    'audit.view'
  ],
  hod: [
    'department.view', 'department.manage',
    'faculty.view', 'student.view'
  ],
  faculty: ['faculty.view', 'student.view', 'attendance.manage', 'marks.manage'],
  librarian: ['library.manage', 'student.view'],
  student: ['student.profile', 'library.use'],
  member: ['library.use'],
  accountant: ['fee.view', 'fee.manage', 'payment.manage'],
  placement_officer: ['placement.manage', 'student.view'],
  hostel_manager: ['hostel.manage', 'student.view'],
  admin: ['*']
};

module.exports = function(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const explicitPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    const rolePermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const permissions = [...explicitPermissions, ...rolePermissions];

    const allowed = permissions.includes('*') ||
      requiredPermissions.every(permission => permissions.includes(permission));

    if (!allowed) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }

    next();
  };
};

module.exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
