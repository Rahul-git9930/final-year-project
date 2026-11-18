module.exports = async function(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    if (req.user.role === 'super_admin') {
      req.collegeId = req.headers['x-college-id'] || req.query.collegeId || req.body?.college;
      return next();
    }

    if (!req.user.college) {
      return res.status(403).json({ message: 'College is not assigned to this user' });
    }

    req.collegeId = req.user.college;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Unable to determine college scope' });
  }
};
