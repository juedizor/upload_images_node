var particiones = require('../model/particiones'),
  fs = require('fs'),
  dir = require('path-reader'),
  moment = require('moment'),
  logger = require('../log/logger').logger,
  config = require('../config/configuration').get(process.env.NODE_ENV),
  HttpStatus = require('http-status-codes');

var particionesModel = particiones.particionesModel;
var cantMaxDir = config.params_cargue_images.cantMaxDir;
var idParticion = config.params_cargue_images.idParticion;

function getDiscoDisponible(req, res, next) {
  particionesModel.findOne({
    id_particion: idParticion++,
    disponible: true
  }, function(err, dataParticion) {
    if (err) {
      logger.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("No hay disco disponible " + err)
    };

    if (dataParticion == null) {
      idParticion = 1;
      /*
        no existe la particion siguiente, por tanto busca una particion con findOne,
        para asi traer la primera de las particiones siempre y cuando la disponibilidad de
        almacenamiento este en true
      */
      particionesModel = particiones.particionesModel;
      particionesModel.findOne({
        disponible: true
      }, function(err, particionesModel) {
        if (err) {
          logger.error(err);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }

        if (particionesModel == null) {
          logger.error("No hay disco disponible");
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("No hay disco disponible");
        }

        return seleccionarParticion(req, res, particionesModel, next);

      });
    } else {
      /*
       *  encontro una particion siguiente disponible,
          procede a activarla actualizando su modelo
       */
      return seleccionarParticion(req, res, dataParticion, next);
    }
  });

}

function seleccionarParticion(req, res, dataParticion, next) {
  var data = dataParticion;

  var rutas = dir.subdirs(data.ruta_particion, function(err, subdirs) {
    //console.log("Particion disponible " + data.ruta_particion)
    //  console.log(cant++)
    if (subdirs.length <= 0) {
      // creamos el directorio donde se va a almacenar la imagen
      var dateActual = moment().unix();
      var directorio = data.ruta_particion + "/" + dateActual;


      fs.mkdir(directorio, function(err) {
        if (err) {
          logger.error(err);
          if (err.code !== 'EEXIST') {
            logger.error("Error creando directorio " + ruta);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error creando directorio " + ruta);
          }
        } else {
          // en este punto no existe, creado inicialmente
          res.locals.dir_copia = directorio;
          res.locals.disk = data;
          next();
        }
      });


    } else {

      var existeDirDisponible = false; // variable par saber si se obtuvo un directorio disponible

      // verifica la cantidad de archivos que tenga cada directorio listado

      for (var i = 0; i < subdirs.length; i++) {
        // verificamos cuantos archivos tiene el directorio
        // si posee mas de 1024 archivos no se elige este para guardar
        var files = dir.files(subdirs[i], {
          sync: true
        });

        //console.log("directorio " + subdirs[i] + " tiene " + files.length + " archivos")
        if (files.length <= 0) {
          res.locals.dir_copia = subdirs[i];
          res.locals.disk = data;
          existeDirDisponible = true;
          break;
        } else {
          if (files.length >= cantMaxDir) {
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
            logger.error(err);
            if (err.code !== 'EEXIST') {
              logger.error("Error creando directorio " + ruta);
              return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error creando directorio " + ruta);
            } else {
              res.locals.dir_copia = directorio;
              res.locals.disk = data;
              next();
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
}



module.exports.middleware_disk = getDiscoDisponible;
