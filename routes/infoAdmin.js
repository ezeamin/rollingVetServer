const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const validar = require("../helpers/validar");

const DbPacientes = require("../models/paciente");
const DbCitas = require("../models/cita");
const DbFechas = require("../models/fechas");
const DbPrecios = require("../models/precios");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(200).json({ message: "Unauthorized", code: 401 });
};

const isAdmin = (req, res, next) => {
  if (req.user.dni === "1") {
    return next();
  }
  return res.status(200).json({ message: "Unauthorized", code: 401 });
};

const generarCodigo = () => {
  let codigo = "";
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

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

router.get("/api/pacientes", isAuthenticated, (req, res) => {
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
});

router.get("/api/pacientes/:dni", isAuthenticated, (req, res) => {
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
    password: bcrypt.hashSync(req.body.password, 10),
    avatar: req.body.avatar,
  };

  if(!validar(datos)) res.status(500).json({
    ok: false,
    mensaje: "Datos inválidos",
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
  if(!validar(req.body)) res.status(500).json({
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
      }

      paciente.save();
      res.status(200).json({ code: 200 });
    }
  });
});

//citas

router.get("/api/citasProgramadas", isAuthenticated, (req, res) => {
  DbCitas.find({ atendido: false }, (err, citas) => {
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

router.get("/api/citasRegistro", isAuthenticated, (req, res) => {
  DbCitas.find({ atendido: true }, (err, citas) => {
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

  if(!validar(cita)) res.status(500).json({
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
  if(!validar(req.body)) res.status(500).json({
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

//precios

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
  if(!validar(req.body)) res.status(500).json({
    ok: false,
    mensaje: "Datos inválidos",
  });
  
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
