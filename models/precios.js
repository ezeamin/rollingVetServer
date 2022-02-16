const mongoose = require('mongoose');
const { Schema } = mongoose;

const preciosSchema = new Schema({
  plan: String,
  precio: {
    type: Number,
    required: true,
  },
  precioTotal: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Precios', preciosSchema);
