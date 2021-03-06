const express = require("express");
const router = express.Router();

const validar = require("../helpers/validar");
const isAuthenticated = require("../helpers/isAuthenticated");
const isAdmin = require("../helpers/isAdmin");
const generarCodigo = require("../helpers/generarCodigo");

const DbCitas = require("../models/cita");
const DbFechas = require("../models/fechas");

router.get("/api/citasProgramadas/:min", isAuthenticated, isAdmin, (req, res) => {
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

router.get("/api/citasRegistro/:min", isAuthenticated, isAdmin, (req, res) => {
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

  if (!validar(cita)){
    res.status(500).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

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
  DbCitas.findOne({ codigoCita: req.params.codigoCita }, (err, cita) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        cita: cita,
      });
    }
  });
});

router.put("/api/citas/:codigoCita", isAuthenticated, isAdmin, (req, res) => {
  if (!validar(req.body)){
    res.status(500).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

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
        DbFechas.findOne({ fecha: cita.fecha }, (err, doc) => {
          if (doc.ocupados.length === 1)
            DbFechas.deleteOne({ fecha: cita.fecha });
        });

        res.status(200).json({
          ok: true,
        });
      }
    }
  );
});

router.delete("/api/citas/paciente/:dni", isAuthenticated, (req, res) => {
  if (req.user.dni !== "1" && req.params.dni !== req.user.dni) {
    res.status(401).json({
      ok: false,
      err: {
        message: "Unauthorized",
      },
    });
    return;
  }

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

              if (doc.ocupados.length === 0)
                DbFechas.deleteOne({ fecha: fecha });
              else doc.save();
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

            if (doc.ocupados.length === 0) DbFechas.deleteOne({ fecha: fecha });
            else doc.save();
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
    if (req.user.dni !== "1" && req.params.dni !== req.user.dni) {
      res.status(401).json({
        ok: false,
        err: {
          message: "Unauthorized",
        },
      });
      return;
    }

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
    if (req.user.dni !== "1" && req.params.dni !== req.user.dni) {
      res.status(401).json({
        ok: false,
        err: {
          message: "Unauthorized",
        },
      });
      return;
    }

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
