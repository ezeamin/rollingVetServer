const express = require("express");
const router = express.Router();

const DbFechas = require("../models/fechas");

const isAuthenticated = require("../helpers/isAuthenticated");

router.get("/api/fechas/:fecha", isAuthenticated, (req, res) => {
  DbFechas.find({ fecha: req.params.fecha }, (err, fecha) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        datos: fecha[0] ? fecha[0].ocupados : null,
      });
    }
  });
});

router.put("/api/fechas", isAuthenticated, (req, res) => {
  DbFechas.findOne({ fecha: req.body.fecha }, (err, doc) => {
    if (doc) {
      doc.ocupados.push(req.body.hora);
      doc.save();
    } else {
      let doc = new DbFechas({
        fecha: req.body.fecha,
        ocupados: [req.body.hora],
      });
      doc.save();
    }
  });

  res.status(200).json({ ok: true, datos: req.body });
});

module.exports = router;
