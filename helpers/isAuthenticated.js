function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(200).json({ message: "Unauthorized", code: 401 });
}

module.exports = isAuthenticated;
