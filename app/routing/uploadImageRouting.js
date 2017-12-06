var express = require("express"),
  uploadCtrl = require('../controller/uploadImagesCtrl'),
  particionMiddleware = require('../middlewares/particion_disponible'),
  multer = require('multer'),
  os = require('os');


//upload = multer({
//dest: os.homedir() + "/temp"
//});

var storage = multer.memoryStorage()
var upload = multer({
  storage: storage
})

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var lyraImage = express.Router();

lyraImage.route("/rutas")
  .get(uploadCtrl.consultaImagenes)
  .post(particionMiddleware.middleware_disk, upload.single("myFile"), uploadCtrl.guardarImagen)

lyraImage.route("/rutas/:idDoc")
  .get(uploadCtrl.consultaImagenesPorIdDoc)

module.exports = lyraImage;
