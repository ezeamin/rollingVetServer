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
    avatar: String,
  },
  codigoMascota:  {
    type: String,
    unique: true,
    required: true,
  },
  mascota: String,
  veterinario: String,
  fecha: String,
  hora: String,
  atendido: Boolean,
  comentarios: String,
});

module.exports = mongoose.model('Citas', citaSchema);
