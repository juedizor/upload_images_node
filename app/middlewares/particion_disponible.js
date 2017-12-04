var particiones = require('../model/particiones'),
  diskspace = require('diskspace'),
  fs = require('fs'),
  dir = require('path-reader');

var particionesModel = particiones.particionesModel;
var KB = 1024;

function getDiscoDisponible(req, res) {
  particionesModel.find({
    disponible: true
  }, function(err, data) {
    getDiskFree(data)


    /*
        diskspace.check(data.ruta_particion, function(err, result) {
          if (err) return res.status(500).send("Error con el disco " + data.ruta_particion);
          console.log(result)
          var total = result.total / KB;
          var used = result.used / KB;
          var free = result.free / KB;
          console.log("total: " + total + "\n" + "used:  " + used + "\n" + "free: " + free);
        });
        */

  })

}


function getDiskFree(data) {
  for (var i = 0; i < data.length; i++) {
    var rutaParticion = data[i].ruta_particion;
    var files = dir.files(rutaParticion, {
      sync: true
    });
    
  }

}

function getCantFiles() {

}

module.exports.middleware_disk = getDiscoDisponible;
