const express = require("express");
const router = express.Router();

const validar = require("../helpers/validar");

const DbPacientes = require("../models/paciente");
const DbCitas = require("../models/cita");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(200).json({ message: "Unauthorized", code: 401 });
};

router.get("/api/user/qty/:dni", isAuthenticated, (req, res) => {
  DbPacientes.findOne({ dni: req.params.dni }, (err, doc) => {
    if (doc) {
      let qtyMascotas = doc.mascotas.length;

      DbCitas.find({ dni: req.params.dni, atendido: false }, (err, citas) => {
        let qtyCitas = citas.length;

        res.status(200).json({ mascotas: qtyMascotas, citas: qtyCitas });
      });
    }
  });
});

router.get("/api/user/pacientes/mascotas/:dni", isAuthenticated, (req, res) => {
  DbPacientes.findOne({ dni: req.params.dni }, (err, doc) => {
    if (doc) {
      res.status(200).json({ mascotas: doc.mascotas });
    } else {
      res.status(500).json({ ok: false });
    }
  });
});

router.put(
  "/api/user/guardarPlan/:dni/:codigoMascota",
  isAuthenticated,
  (req, res) => {
    if (!validar(req.body))
      res.status(500).json({
        ok: false,
        mensaje: "Datos inválidos",
      });

    DbPacientes.findOne({ dni: req.params.dni }, (err, doc) => {
      if (doc) {
        let mascota = doc.mascotas.find(
          (mascota) => mascota.codigoMascota === req.params.codigoMascota
        );
        if (mascota) {
          mascota.plan = req.body.plan;
          doc.save((err, mascota) => {
            if (err) {
              res.status(500).json({ ok: false });
            } else {
              res.status(200).json({ ok: true });
            }
          });
        } else {
          res.status(500).json({ ok: false });
        }
      } else {
        res.status(500).json({ ok: false });
      }
    });
  }
);

//citas

router.get("/api/citasProgramadas/:dni", isAuthenticated, (req, res) => {
  DbCitas.find({ dni: req.params.dni, atendido: false }, (err, citas) => {
    if (err) res.status(500).json({ ok: false });
    else {
      console.log(citas);
      res.status(200).json({ ok: true, citas: citas });
    }
  });
});

router.get("/api/citasRegistro/:dni", isAuthenticated, (req, res) => {
  DbCitas.find({ dni: req.params.dni, atendido: true }, (err, citas) => {
    if (err) res.status(500).json({ ok: false });
    else {
      res.status(200).json({ ok: true, citas: citas });
    }
  });
});

module.exports = router;
