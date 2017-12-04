var particiones = require('../model/particiones'),
  diskspace = require('diskspace'),
  fs = require('fs'),
  dir = require('path-reader')
moment = require('moment');

var particionesModel = particiones.particionesModel;
var KB = 1024;

function getDiscoDisponible(req, res, next) {
  particionesModel.findOne({
    disponible: true,
    disk_guardar: true
  }, function(err, data) {
    if (err) return res.status(500).send("No hay disco disponible")

    var rutas = dir.subdirs(data.ruta_particion, function(err, subdirs) {

      if (subdirs.length <= 0) {
        // creamos el directorio donde se va a almacenar la imagen
        var dateActual = moment().unix();
        var directorio = data.ruta_particion + "/" + dateActual;


        fs.mkdir(directorio, function(err) {
          if (err) {
            if (err.code !== 'EEXIST') {
              return res.status(500).send("Error creando directorio " + ruta);
            }
          } else {
            // en este punto no existe, creado inicialmente
            res.locals.dir_copia = directorio;
            res.locals.disk = data;
            next();
          }
        });


      } else {
        // verifica la cantidad de archivos que tenga cada directorio listado
        var existeDirDisponible = false; // variable par saber si se obtuvo un directorio disponible

        for (var i = 0; i < subdirs.length; i++) {
          // verificamos cuantos archivos tiene el directorio
          // si posee mas de 1024 archivos no se elige este para guardar
          var files = dir.files(subdirs[i], {
            sync: true
          });

          if (files.length <= 0) {
            res.locals.dir_copia = subdirs[i];
            res.locals.disk = data;
            existeDirDisponible = true;
            break;
          } else {
            if (files.length >= 5) {
              continue;
            }

            res.locals.dir_copia = subdirs[i];
            res.locals.disk = data;
            existeDirDisponible = true;
            break;
          }
        }

        if (!existeDirDisponible) {
          // no hay directorio disponible, entonces creamos uno nuevo
          // creamos el directorio donde se va a almacenar la imagen
          var dateActual = moment().unix();
          var directorio = data.ruta_particion + "/" + dateActual;


          fs.mkdir(directorio, function(err) {
            if (err) {
              if (err.code !== 'EEXIST') {
                return res.status(500).send("Error creando directorio " + ruta);
              }
            } else {
              // en este punto no existe, creado inicialmente
              res.locals.dir_copia = directorio;
              res.locals.disk = data;
              next();
            }
          });
        } else {
          next();
        }
      }
    });
  })

}
module.exports.middleware_disk = getDiscoDisponible;
