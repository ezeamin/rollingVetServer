const express = require("express");
const router = express.Router();

const validar = require("../helpers/validar");
const isAuthenticated = require("../helpers/isAuthenticated");
const generarCodigo = require("../helpers/generarCodigo");

const DbCitas = require("../models/cita");
const DbFechas = require("../models/fechas");

router.get("/api/citasProgramadas/:min", isAuthenticated, (req, res) => {
  let min = req.params.min;

  let citas = DbCitas.find({ atendido: false })
    .sort({ fecha: 1, hora: 1 })
    .skip(min)
    .limit(3);
  citas.exec((err, citas) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        citas,
      });
    }
  });
});

router.get("/api/citasRegistro/:min", isAuthenticated, (req, res) => {
  let min = req.params.min;

  let citas = DbCitas.find({ atendido: true })
    .sort({ fecha: -1, hora: 1 })
    .skip(min)
    .limit(3);
  citas.exec((err, citas) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        citas,
      });
    }
  });
});

router.post("/api/citas", isAuthenticated, (req, res) => {
  const codigoCita = generarCodigo();

  const cita = new DbCitas({
    codigoCita: codigoCita,
    fecha: req.body.fecha,
    hora: req.body.hora,
    atendido: false,
    codigoMascota: req.body.codigoMascota,
    dni: req.body.dni,
    paciente: {
      nombre: req.body.paciente.nombre,
      apellido: req.body.paciente.apellido,
      avatar: req.body.paciente.avatar,
    },
    mascota: req.body.mascota,
    veterinario: req.body.veterinario,
    comentarios: req.body.comentarios,
  });

  if (!validar(cita))
    res.status(500).json({
      ok: false,
      mensaje: "Datos inválidos",
    });

  DbCitas.create(cita, (err, cita) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        cita,
      });
    }
  });
});

router.get("/api/citas/:codigoCita", isAuthenticated, (req, res) => {
  DbCitas.find({ codigoCita: req.params.codigoCita }, (err, cita) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        cita: cita[0],
      });
    }
  });
});

router.put("/api/citas/:codigoCita", isAuthenticated, (req, res) => {
  if (!validar(req.body))
    res.status(500).json({
      ok: false,
      mensaje: "Datos inválidos",
    });

  DbCitas.findOneAndUpdate(
    { codigoCita: req.params.codigoCita },
    req.body,
    { new: true },
    (err, cita) => {
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

router.delete("/api/citas/paciente/:dni", isAuthenticated, (req, res) => {
  DbCitas.find(
    {
      dni: req.params.dni,
      atendido: false,
    },
    (err, docs) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        docs.forEach((cita) => {
          const fecha = cita.fecha;
          const hora = cita.hora;

          DbFechas.findOne({ fecha: fecha }, (err, doc) => {
            if (doc) {
              doc.ocupados = doc.ocupados.filter((ocupado) => ocupado !== hora);
              doc.save();
            }
          });

          cita.remove();
        });

        res.status(200).json({
          ok: true,
        });
      }
    }
  );
});

router.delete("/api/citas/:codigoCita", isAuthenticated, (req, res) => {
  DbCitas.findOneAndDelete(
    { codigoCita: req.params.codigoCita },
    (err, cita) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        const fecha = cita.fecha;
        const hora = cita.hora;

        DbFechas.findOne({ fecha: fecha }, (err, doc) => {
          if (doc) {
            doc.ocupados = doc.ocupados.filter((ocupado) => ocupado !== hora);
            doc.save();
          }
        });

        res.status(200).json({
          ok: true,
        });
      }
    }
  );
});

//user

router.get(
  "/api/citasProgramadas/user/dni/:dni/:min",
  isAuthenticated,
  (req, res) => {
    let min = req.params.min;

    let data = DbCitas.find({ dni: req.params.dni, atendido: false })
      .sort({ fecha: 1, hora: 1 })
      .skip(min)
      .limit(3);
    data.exec((err, citas) => {
      if (err) res.status(500).json({ ok: false });
      else {
        res.status(200).json({ ok: true, citas: citas });
      }
    });
  }
);

router.get(
  "/api/citasRegistro/user/dni/:dni/:min",
  isAuthenticated,
  (req, res) => {
    let min = req.params.min;

    let data = DbCitas.find({ dni: req.params.dni, atendido: true })
      .sort({ fecha: -1, hora: 1 })
      .skip(min)
      .limit(3);
    data.exec((err, citas) => {
      if (err) res.status(500).json({ ok: false });
      else {
        res.status(200).json({ ok: true, citas: citas });
      }
    });
  }
);

module.exports = router;
