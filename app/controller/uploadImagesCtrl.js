/**
  Se crea el controlador que recibira la imagen del servicio y
  realizara las validaciones respectivas y enviara la imagen y
  la ruta al modelo para que sea almacenada en el server
*/

var uploadImage = require("../model/rutaImagenes"),
  fs = require('fs'),
  path = require('path'),
  os = require('os');

var modelRutaImagen = uploadImage.rutaImagenesModel;
var ruta = "";

function guardarImagen(req, res) {
  modelRutaImagen.findOne({
    idDoc: req.body.id_doc
  }, function(err, dataRutaImagen) {
    if (err) return res.status(500).send(err);
    if (dataRutaImagen != null) {
      return realizarProcesoCargueImagen(req, res, true);
    } else {
      return realizarProcesoCargueImagen(req, res, false);
    }
  })
}

function realizarProcesoCargueImagen(req, res, exits) {
  if (!isEmpty(req.file)) {
    // debe copiar el file en la ruta
    var pathExt = path.extname(req.file.originalname)
    var nameFile = req.body.id_doc + pathExt;
    ruta = res.locals.dir_copia;
    var file = ruta + "/" + nameFile;
    return openCopyFile(req, res, file, exits, nameFile);
  } else {
    return res.status(500).send('Falta la imagen del documento');
  }
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

function openCopyFile(req, res, file, exits, nameFile) {
  fs.open(file, 'w', function(err, data) {
    if (err) {
      return res.status(500).send('Error abriendo archivo ' + file);
    } else {
      return copyFile(req, res, file, exits, nameFile);
    }
  })
}

function copyFile(req, res, file, exits, nameFile) {
  var src = fs.createReadStream(req.file.path);
  var dest = fs.createWriteStream(file);

  src.pipe(dest);
  src.on('end', function() {
    if (exits) {
      var query = {
        idDoc: req.body.id_doc
      };
      modelRutaImagen.findOneAndUpdate(query, {
          ruta: ruta + "/" + nameFile
        }, {
          new: true
        },
        function(err, modelRutaImagen) {
          deleteFile(req.file.path);
          if (err) {
            return res.status(500).send(err);
          }
          return res.status(200).jsonp(modelRutaImagen);

        })
    } else {
      // guarda la imagen con la ruta
      var rutaImagenes = new modelRutaImagen({
        idDoc: req.body.id_doc,
        ruta: ruta + "/" + nameFile
      });

      rutaImagenes.save(function(err, rutaImagenes) {
        deleteFile(req.file.path);
        if (err) {
          return res.status(500).send("Error al realizar el cargue de la imagen");
        }
        return res.status(200).jsonp(rutaImagenes);
      });
    }
  });
  src.on('error', function(err) {
    return res.status(500).send(err);
  });

}

function deleteFile(path) {
  fs.unlinkSync(path);
}

function consutarImagenIdDoc(req, res) {
  modelRutaImagen.find({
    idDoc: req.params.id_doc
  }, function(err, modelRutaImagen) {
    if (err) return res.status(500).send("Error con busqueda de registros para el idDoc " + req.params.id_doc);
    return res.status(200).jsonp(modelRutaImagen);
  })
}

function consutarImagenes(req, res) {
  modelRutaImagen.find(function(err, data) {
    if (err) return res.status(500).send("Error con busqueda de registros");
    return res.status(200).jsonp(data);
  })
}

module.exports.guardarImagen = guardarImagen;
module.exports.consultaImagenesPorIdDoc = consutarImagenIdDoc;
module.exports.consultaImagenes = consutarImagenes;
