/*+
  Creacion del esquema donde se van a almacenar informacion de la imagen
  con la direccion fisica en disco de la imagen relacionada.

  Tipos de datos soportados en el schema.

  String
  Number
  date
  Buffer
  Boolean
  Mixed
  Objectid
  Array
*/
var mongoose = require("mongoose"),
    Schema = mongoose.Schema;


var rutaImages = new Schema({
  idDoc: {type: String},
  ruta: {type: String}
});

module.exports.rutaImagenesModel = mongoose.model("ruta_imagenes", rutaImages);
