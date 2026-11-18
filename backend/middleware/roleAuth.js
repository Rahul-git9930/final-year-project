module.exports = function(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let effectiveRoles = [req.user.role];

    if (req.user.role === 'super_admin') {
      effectiveRoles = [...effectiveRoles, 'admin', 'librarian'];
    }

    if (req.user.role === 'college_admin') {
      effectiveRoles = [...effectiveRoles, 'admin'];
    }

    if (req.user.role === 'hod') {
      effectiveRoles = [...effectiveRoles, 'librarian'];
    }

    const allowed = roles.some(role => effectiveRoles.includes(role));

    if (!allowed) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to perform this action.' 
      });
    }

    next();
  };
};
