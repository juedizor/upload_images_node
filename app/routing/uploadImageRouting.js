var express = require("express"),
    uploadCtrl = require('../controller/uploadImagesCtrl'),
        multer = require('multer'),
        upload = multer();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var lyraImage = express.Router();

lyraImage.route("/rutas")
  .get(uploadCtrl.consultaImagenes)
  .post(multipartMiddleware, uploadCtrl.guardarImagen)

lyraImage.route("/rutas/:idDoc")
  .get(uploadCtrl.consultaImagenesPorIdDoc)

module.exports = lyraImage;
