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
var ruta = os.homedir() + "\\imagenes_lyra\\";


function guardarImagen(req, res) {
  modelRutaImagen.findOne({idDoc:req.body.id_doc}, function(err, dataRutaImagen){
    if(err) return res.status(500).send(err);
    if(dataRutaImagen != null) {
      if(!isEmpty(req.files)) {
        return realizarProcesoCargueImagen(req, res, true);
      }
    }else{
      return realizarProcesoCargueImagen(req, res, false);
    }
  })
}

function realizarProcesoCargueImagen(req, res, exits) {
  if(!isEmpty(req.files)) {
    // debe copiar el file en la ruta
    var pathExt = path.extname(req.files.myFile.name)
    var file = ruta + req.body.id_doc + pathExt;
    fs.mkdir(ruta, function(err){
      if(err){
          if(err.code === 'EEXIST'){
            return openCopyFile(req, res, file, exits);
          }else{
            deleteFile(req.files.myFile.path);
            return res.status(500).send("Error creando directorio "+ruta);
          }
      }else {
        return openCopyFile(req, res, file, exits);
      }
    });
  }else{
    return res.status(500).send('Falta la imagen del documento');
  }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function openCopyFile(req, res, file, exits){
  fs.open(file, 'w', function(err, data){
    if (err) {
      return res.status(500).send('Error abriendo archivo '+file);
    }else {
      return copyFile(req, res, file, exits);
    }
  })
}

function copyFile(req, res, file, exits){
  fs.copyFile(req.files.myFile.path,
    file,
    function(err) {
      if(err) {
        deleteFile(req.files.myFile.path);
        return res.status(500).send(err);
      }

      if(exits){
          var query = { idDoc: req.body.id_doc };
          modelRutaImagen.findOneAndUpdate (query,
            {ruta: ruta + req.files.myFile.originalFilename},
            {new: true},
            function(err, modelRutaImagen){
                deleteFile(req.files.myFile.path);
                if(err){
                  return res.status(500).send(err);
                }
                return res.status(200).jsonp(modelRutaImagen);

          })
      }else{
        // guarda la imagen con la ruta
        var rutaImagenes = new modelRutaImagen({
          idDoc: req.body.id_doc,
          ruta: ruta + req.files.myFile.originalFilename
        });

        rutaImagenes.save(function(err, rutaImagenes){
          deleteFile(req.files.myFile.path);
          if(err) {
            return res.status(500).send ("Error al realizar el cargue de la imagen");
          }
          return res.status(200).jsonp(rutaImagenes);
        });
      }


    });
}

function deleteFile(path){
  fs.unlinkSync(path);
}

function consutarImagenIdDoc(req, res){
  modelRutaImagen.find({idDoc: req.params.id_doc}, function(err, modelRutaImagen){
    if(err) return res.status(500).send("Error con busqueda de registros para el idDoc "+req.params.id_doc);
    return res.status(200).jsonp(modelRutaImagen);
  })
}

function consutarImagenes(req, res){
  modelRutaImagen.find(function(err, data){
    if(err) return res.status(500).send("Error con busqueda de registros");
    return res.status(200).jsonp(data);
  })
}

module.exports.guardarImagen = guardarImagen;
module.exports.consultaImagenesPorIdDoc = consutarImagenIdDoc;
module.exports.consultaImagenes = consutarImagenes;
