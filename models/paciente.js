const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const mascotaSchema = new Schema({
  codigoMascota: {
    type: String,
    unique: true,
    required: true,
  },
  especie: String,
  raza: String,
  nombre: {
    type: String,
    maxlength: 20,
    required: true,
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
  genero: String,
  dni: {
    type: String,
    unique: true,
    required: true,
  },
  avatar: String,
  mascotas: [mascotaSchema],
  incorporacion: String,
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, 10)
};

userSchema.methods.comparePassword = (password,password2) =>{
  return bcrypt.compareSync(password, password2);
};

module.exports = mongoose.model('Pacientes', userSchema);
