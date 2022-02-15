const express = require("express");
const router = express.Router();

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

      DbCitas.find({atendido: false }, (err,docs) => {
        let qtyCitas = docs.filter(cita => {return(cita.paciente.dni === req.params.dni)}).length;

        res.status(200).json({ mascotas: qtyMascotas, citas: qtyCitas });
      });
    }
  });
})

router.get("/api/user/pacientes/mascotas/:dni", isAuthenticated, (req, res) => {
  DbPacientes.findOne({ dni: req.params.dni }, (err, doc) => {
    if (doc) {
      res.status(200).json({ mascotas: doc.mascotas });
    }
    else {
      res.status(500).json({ ok: false });
    }
  });
});

router.put("/api/user/guardarPlan/:dni/:codigoMascota", isAuthenticated, (req, res) => {
  DbPacientes.findOne({ dni: req.params.dni }, (err, doc) => {
    if (doc) {
      let mascota = doc.mascotas.find(mascota => mascota.codigoMascota === req.params.codigoMascota);
      if (mascota) {
        mascota.plan = req.body.plan;
        doc.save((err, mascota) => {
          if (err) {
            res.status(500).json({ ok: false });
          }
          else {
            res.status(200).json({ ok: true });
          }
        });
      }
      else {
        res.status(500).json({ ok: false });
      }
    }
    else {
      res.status(500).json({ ok: false });
    }
  });
});

//citas 

router.get("/api/citasProgramadas/:dni", isAuthenticated, (req, res) => {
  DbCitas.find({atendido: false }, (err, docs) => {
    if(err) res.status(500).json({ ok: false });
    else {
      let citas = docs.filter(cita => {return(cita.paciente.dni === req.params.dni)});
      res.status(200).json({ citas: citas });
    }
  });
});

router.get("/api/citasRegistro/:dni", isAuthenticated, (req, res) => {
  DbCitas.find({atendido: true }, (err, docs) => {
    if(err) res.status(500).json({ ok: false });
    else {
      let citas = docs.filter(cita => {return(cita.paciente.dni === req.params.dni)});
      res.status(200).json({ citas: citas });
    }
  });
});

module.exports = router;
