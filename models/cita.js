const mongoose = require('mongoose');
const { Schema } = mongoose;

const citaSchema = new Schema({
  codigoCita: String,
  paciente: {
    dni: String,
    nombre: String,
    apellido: String,
    avatar: String,
  },
  codigoMascota: String,
  mascota: String,
  veterinario: String,
  fecha: String,
  hora: String,
  atendido: Boolean,
  comentarios: String,
});

module.exports = mongoose.model('Citas', citaSchema);
