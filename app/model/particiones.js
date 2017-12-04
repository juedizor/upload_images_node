var mongoose = require("mongoose"),
  Schema = mongoose.Schema;


var particiones = new Schema({
  id_particion: {
    type: Number
  },
  ruta_particion: {
    type: String
  },
  disponible: {
    type: Boolean
  },
  disk_guardar: {
    type: Boolean
  }
});

module.exports.particionesModel = mongoose.model("particiones", particiones);
