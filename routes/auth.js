const express = require("express");
const passport = require("passport");
const router = express.Router();

const validar = require("../helpers/validar");
const isAuthenticated = require("../helpers/isAuthenticated");

router.post("/api/signup", (req, res) => {
  if (!validar(req.body)) {
    res.status(500).json({
      ok: false,
      code: 500,
      message: "Datos inválidos",
    });
    return;
  }

  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    return res.status(200).json(user);
  })(req, res);
});

router.post("/api/signin", (req, res) => {
  passport.authenticate("local-login", {
    successRedirect: "/api/success",
    failureRedirect: "/api/error",
  })(req, res);
});

router.get("/api/error", (req, res) => {
  res.status(401).json({ message: "Unauthorized", code: 1 });
});

router.get("/api/success", (req, res) => {
  res.status(200).json({ message: "Success", code: 200 });
});

router.delete("/api/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "Success", code: 200 });
});

router.get("/api/auth", isAuthenticated, (req, res) => {
  res.status(200).json({
    user: {
      email: req.user.email,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      genero: req.user.genero,
      dni: req.user.dni,
      mascotas: req.user.mascotas,
      avatar: req.user.avatar,
    },
    code: 200,
  });
});

router.get("/api/isAdmin", (req, res) => {
  if (req.user.dni == "1") res.status(200).json({ isAdmin: true, code: 200 });
  else res.status(200).json({ isAdmin: false, code: 200 });
});

module.exports = router;
