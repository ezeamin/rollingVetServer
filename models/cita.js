const mongoose = require('mongoose');
const { Schema } = mongoose;

const citaSchema = new Schema({
  codigoCita: {
    type: String,
    unique: true,
    required: true,
  },
  dni: {
    type: String,
    maxlength: 8,
    required: true,
  },
  paciente: {
    nombre:  {
      type: String,
      maxlength: 20,
      required: true,
    },
    apellido:  {
      type: String,
      maxlength: 20,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  codigoMascota:  {
    type: String,
    required: true,
  },
  mascota: {
    type: String,
    required: true,
  },
  veterinario: {
    type: String,
    required: true,
  },
  fecha: {
    type: String,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  atendido: {
    type: Boolean,
    required: true,
  },
  comentarios: String,
});

module.exports = mongoose.model('Citas', citaSchema);
