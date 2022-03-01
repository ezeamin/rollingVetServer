function isAdmin(req, res, next) {
  if (req.user.dni === "1") {
    return next();
  }
  return res.status(200).json({ message: "Unauthorized", code: 401 });
}

module.exports = isAdmin;
