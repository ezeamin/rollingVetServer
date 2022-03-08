const express = require("express");
const router = express.Router();

const validar = require("../helpers/validar");
const isAuthenticated = require("../helpers/isAuthenticated");
const isAdmin = require("../helpers/isAdmin");

const DbPrecios = require("../models/precios");

router.get("/api/precios", (req, res) => {
  DbPrecios.find({}, (err, precios) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        precios,
      });
    }
  });
});

router.put("/api/precios", isAuthenticated, isAdmin, (req, res) => {
  if (!validar(req.body)){
    res.status(500).json({
      ok: false,
      mensaje: "Datos inválidos",
    });
    return;
  }

  DbPrecios.findOneAndUpdate(
    { plan: req.body.plan },
    req.body,
    { new: true },
    (err, precios) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        res.status(200).json({
          ok: true,
        });
      }
    }
  );
});

module.exports = router;
