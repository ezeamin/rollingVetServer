const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const mascotaSchema = new Schema({
  codigoMascota: String,
  especie: String,
  raza: String,
  nombre: {
    type: String,
    maxlength: 20,
  },
  fechaNac: String,
  sexo: String,
  plan: String,
});

const userSchema = new Schema({
  email: {
    type: String,
    maxlength: 35,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    maxlength: 20,
    required: true,
  },
  apellido: {
    type: String,
    maxlength: 20,
    required: true,
  },
  genero: {
    type: String,
    required: true,
  },
  dni: {
    type: String,
    unique: true,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  mascotas: {
    type: [mascotaSchema],
    required: true,
  },
  incorporacion: {
    type: String,
    required: true,
  },
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, 10)
};

userSchema.methods.comparePassword = (password,password2) =>{
  return bcrypt.compareSync(password, password2);
};

module.exports = mongoose.model('Pacientes', userSchema);
