/**
  Se crea el controlador que recibira la imagen del servicio y
  realizara las validaciones respectivas y enviara la imagen y
  la ruta al modelo para que sea almacenada en el server
*/

var uploadImage = require("../model/rutaImagenes"),
  particiones = require('../model/particiones'),
  fs = require('fs'),
  path = require('path'),
  os = require('os'),
  diskspace = require('diskspace');

var modelRutaImagen = uploadImage.rutaImagenesModel;
var particionModel = particiones.particionesModel;
var KB = 1024;
var porcentajeDisponibilidad = 10;
var cant = 1;

function guardarImagen(req, res) {
  return realizarProcesoCargueImagen(req, res);
}

function realizarProcesoCargueImagen(req, res) {
  if (!isEmpty(req.file)) {
    // debe copiar el file en la ruta
    var pathExt = path.extname(req.file.originalname)
    var nameFile = req.body.id_doc + pathExt;
    var ruta = res.locals.dir_copia;
    var file = ruta + "/" + nameFile;
    return openCopyFile(req, res, file, nameFile, ruta);
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

function openCopyFile(req, res, file, nameFile, ruta) {
  fs.open(file, 'w', function(err, data) {
    if (err) {
      return res.status(500).send('Error abriendo archivo ' + file);
    } else {
      fs.writeFile(file, req.file.buffer, function(err, success) {
        if (err) {
          return res.status(500).send("Error escribiendo imagen " + file);
        }
        var dataImgResult = {
          id_doc: req.body.id_doc,
          ruta_img: file
        }

        // aqui se almaceno la imagen fisicamente en disco,
        // ahora pasa a verificar disponibilidad del disco en porcentaje
        diskspace.check(ruta, function(err, result) {
          if (err) {
            console.log(err)
            deleteFile(file); // elimina el archivo por haber ocurrido un error y notifica el error al cliente
            return res.status(500).send(err);
          }

          /*
           *  captura los totales en megas
           */
          var total = result.total / KB;
          var used = result.used / KB;
          var free = result.free / KB;
          //console.log("total (MB): " + total + "\n" + "used (MB): " + used + "\n" + "free (MB): " + free)

          var porcDispo = (free * 100) / total; // calcula el porcentaje disponible del disco
          porcDispo = Math.round(porcDispo); // redondea el porcentaje
          var disk = res.locals.disk; // captura los datos del disco que se esta manipulando

          // se verifica que el porcentaje disponible no supere el parametrizado
          if (porcDispo >= porcentajeDisponibilidad) {
            // supero el porcentaje parametrizado, procede a realizar el proceso de desactivar el disco
            console.log("exitoso " + file);
            return res.status(200).jsonp(dataImgResult);
          } else {
            return activarDiscos(req, res, false, file, dataImgResult);
          }

        });
      });
    }
  })
}


function activarDiscos(req, res, noDisponible, file, dataImgResult) {
  var disk = res.locals.disk; // disco que se esta manipulando
  var idParticionManipulada = disk.id_particion; // particion que se esta manipulando
  var query = {
    id_particion: idParticionManipulada
  };

  // busqueda de la particion que se esta manipulando para desactivarla
  particionModel.findOneAndUpdate(query, {
      disponible: noDisponible
    }, {
      new: true
    },
    function(err, data) {
      if (err) {
        /*
         *  Ocurrio un error en desactivar el disco que se esta manipulando
            elimina el archivo copiado y notifica al cliente el error
         */
        console.log(err)
        deleteFile(file);
        return res.status(500).send(err);
      } else {
        /**
         *  en este punto se desactivo el disco que se esta manipulando,
            y el proceso debio finalizar exitosamente, notificando al cliente
            el resultado
         */

        console.log("exitoso " + file);
        return res.status(200).jsonp(dataImgResult);


      }
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
