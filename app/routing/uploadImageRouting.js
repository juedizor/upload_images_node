var express = require("express"),
  uploadCtrl = require('../controller/uploadImagesCtrl'),
  particionMiddleware = require('../middlewares/particion_disponible'),
  multer = require('multer'),
  os = require('os'),
  config = require('../config/configuration').get(process.env.NODE_ENV);
//,
var upload = multer({
  dest: config.upload_file_dest
});

//var storage = multer.memoryStorage()
//var upload = multer({
//storage: storage
//})

var lyraImage = express.Router();

lyraImage.route("/rutas")
  .get(uploadCtrl.consultaImagenes)
  .post(particionMiddleware.middleware_disk, upload.single("myFile"), uploadCtrl.guardarImagen)

lyraImage.route("/rutas/:idDoc")
  .get(uploadCtrl.consultaImagenesPorIdDoc)

module.exports = lyraImage;
