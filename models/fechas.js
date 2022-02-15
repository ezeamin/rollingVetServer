const mongoose = require('mongoose');
const { Schema } = mongoose;

const fechasSchema = new Schema({
  fecha: String,
  ocupados: [String],
});

module.exports = mongoose.model('Fechas', fechasSchema);
