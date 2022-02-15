const mongoose = require('mongoose');
const { Schema } = mongoose;

const preciosSchema = new Schema({
  plan: String,
  precio: Number,
  precioTotal: Number,
});

module.exports = mongoose.model('Precios', preciosSchema);
