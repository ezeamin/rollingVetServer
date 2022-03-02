const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const validar = require("../helpers/validar");
const isAuthenticated = require("../helpers/isAuthenticated");
const generarCodigo = require("../helpers/generarCodigo");

const DbPacientes = require("../models/paciente");
const DbCitas = require("../models/cita");
const DbFechas = require("../models/fechas");

router.get("/api/qty", isAuthenticated, (req, res) => {
  DbPacientes.countDocuments({}, (err, count) => {
    let pacientes = count;
    if (pacientes != 0) pacientes--;

    if (err) {
      res.status(500).json({ ok: false });
      return;
    }

    DbCitas.countDocuments({ atendido: false }, (err, count) => {
      let citas = count;

      res.status(200).json({
        ok: true,
        pacientes: pacientes,
        citas: citas,
      });
    });
  });
});

router.get("/api/pacientes/:min", isAuthenticated, (req, res) => {
  let min = req.params.min;

  if (min === "-1") {
    DbPacientes.find({ dni: { $ne: 1 } }, (err, pacientes) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        res.status(200).json({
          ok: true,
          pacientes,
        });
      }
    });
    return;
  }

  let info = DbPacientes.find({ dni: { $ne: 1 } })
    .sort({ apellido: 1, nombre: 1 })
    .skip(min)
    .limit(5);
  info.exec((err, pacientes) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        pacientes,
      });
    }
  });
});

router.get("/api/paciente/:dni", isAuthenticated, (req, res) => {
  DbPacientes.findOne({ dni: req.params.dni }, (err, paciente) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        paciente,
      });
    }
  });
});

router.delete("/api/pacientes/:dni", isAuthenticated, (req, res) => {
  DbPacientes.findOneAndDelete({ dni: req.params.dni }, (err, paciente) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      res.status(200).json({
        ok: true,
        paciente,
      });
    }
  });
});

router.put("/api/pacientes/editar", isAuthenticated, (req, res) => {
  let datos = {
    dni: req.body.dni,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    genero: req.body.genero,
    email: req.body.email,
    avatar: req.body.avatar,
  };

  if (!validar(datos))
    res.status(500).json({
      ok: false,
      mensaje: "Datos inválidos",
    });

  DbPacientes.findOne({ dni: req.body.dni }, (err, paciente) => {
    if (!err && paciente) {
      DbCitas.updateMany(
        { dni: req.body.dni },
        {
          $set: {
            dni: datos.dni,
            paciente: {
              nombre: datos.nombre,
              apellido: datos.apellido,
              avatar: datos.avatar,
            },
          },
        },
        (err, cita) => {}
      );
    }
  });

  DbPacientes.findOneAndUpdate(
    { dni: req.body.dni },
    datos,
    { new: true },
    (err, paciente) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        res.status(200).json({
          ok: true,
          paciente,
        });
      }
    }
  );
});

router.put("/api/pacientes/editarPass", isAuthenticated, (req, res) => {
  let datos = {
    password: req.body.password,
  };

  console.log(req.body);

  if (!validar(datos))
    res.status(500).json({
      ok: false,
      mensaje: "Datos inválidos",
    });

  datos.password = bcrypt.hashSync(req.body.password, 10);

  DbPacientes.findOneAndUpdate(
    { dni: req.body.dni },
    datos,
    { new: true },
    (err, paciente) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        res.status(200).json({
          ok: true,
          paciente,
        });
      }
    }
  );
});

router.get(
  "/api/pacientes/:dni/:codigoMascota",
  isAuthenticated,
  (req, res) => {
    DbPacientes.findOne({ dni: req.params.dni }, (err, paciente) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        const mascota = paciente.mascotas.find(
          (mascota) => mascota.codigoMascota === req.params.codigoMascota
        );
        res.status(200).json({
          ok: true,
          mascota,
        });
      }
    });
  }
);

router.delete(
  "/api/pacientes/:dni/:codigoMascota",
  isAuthenticated,
  (req, res) => {
    DbPacientes.findOne({ dni: req.params.dni }, (err, paciente) => {
      if (err) {
        res.status(500).json({
          ok: false,
          err,
        });
      } else {
        const mascota = paciente.mascotas.find(
          (mascota) => mascota.codigoMascota === req.params.codigoMascota
        );
        if (mascota) {
          paciente.mascotas.splice(paciente.mascotas.indexOf(mascota), 1);
          paciente.save();

          DbCitas.find(
            { codigoMascota: req.params.codigoMascota, atendido: false },
            (err, citas) => {
              if (err) {
                res.status(500).json({
                  ok: false,
                  err,
                });
              } else {
                citas.forEach((cita) => {
                  const fecha = cita.fecha;
                  const hora = cita.hora;

                  DbFechas.findOne({ fecha: fecha }, (err, doc) => {
                    if (doc) {
                      doc.ocupados = doc.ocupados.filter(
                        (ocupado) => ocupado !== hora
                      );
                      doc.save();
                    }
                  });

                  cita.remove();
                });
              }
            }
          );
        }

        res.status(200).json({ ok: true });
      }
    });
  }
);

router.put("/api/pacientes/mascota/:dni", isAuthenticated, (req, res) => {
  if (!validar(req.body))
    res.status(500).json({
      ok: false,
      mensaje: "Datos inválidos",
    });

  DbPacientes.findOne({ dni: req.params.dni }, (err, paciente) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    } else {
      let mascota = req.body;

      if (mascota.codigoMascota === "") {
        //nueva mascota
        mascota.codigoMascota = generarCodigo();
        mascota.plan = "Sin plan";
        paciente.mascotas.push(mascota);
      } else {
        //editar mascota
        const mascotaIndex = paciente.mascotas.findIndex(
          (mascota) => mascota.codigoMascota === req.body.codigoMascota
        );

        let prevPlan = paciente.mascotas[mascotaIndex].plan;
        if (mascota.plan === "") mascota.plan = prevPlan; //editado desde user, no se carga plan y se mantiene el anterior

        paciente.mascotas[mascotaIndex] = mascota;

        DbCitas.updateMany(
          { codigoMascota: req.body.codigoMascota },
          {
            $set: {
              mascota: req.body.nombre,
            },
          },
          (err, cita) => {}
        );
      }

      paciente.save();
      res.status(200).json({ code: 200 });
    }
  });
});

//user

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

module.exports = router;
