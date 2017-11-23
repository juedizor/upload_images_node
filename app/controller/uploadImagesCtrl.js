/**
  Se crea el controlador que recibira la imagen del servicio y
  realizara las validaciones respectivas y enviara la imagen y
  la ruta al modelo para que sea almacenada en el server
*/

var uploadImage = require("../model/rutaImagenes"),
    fs = require('fs');

var modelRutaImagen = uploadImage.rutaImagenesModel;
var ruta = "/home/julio/imagenes_lyra/";


function guardarImagen(req, res) {
  modelRutaImagen.findOne({idDoc:req.body.id_doc}, function(err, dataRutaImagen){
    if(err) return res.status(500).send(err);
    console.log(dataRutaImagen)
    if(dataRutaImagen != null) {


    }else{
      if(req.files){
        // debe copiar el file en la ruta
        var file = ruta + req.files.myFile.originalFilename;
        fs.mkdir(ruta, function(err){
          if(err){
              if(err.code === 'EEXIST'){
                return openCopyFile(req, res, file);
              }else{
                deleteFile(req.files.myFile.path);
                return res.status(500).send("Error creando directorio "+ruta);
              }
          }else{
            return openCopyFile(req, res, file);
          }
        });
      }else{
        return res.status(500).send('Falta la imagen del documento');
      }

    }
  })

}

function openCopyFile(req, res, file){
  fs.open(file, 'w', function(err, data){
    if (err) {
      return res.status(500).send('Error abriendo archivo '+file);
    }else{
      return copyFile(req, res, file);
    }
  })
}

function copyFile(req, res, file){
  fs.copyFile(req.files.myFile.path,
    file,
    function(err) {
      if(err) {
        deleteFile(req.files.myFile.path);
        return res.status(500).send(err);
      }

      // guarda la imagen con la ruta
      var rutaImagenes = new modelRutaImagen({
        idDoc: req.body.id_doc,
        ruta: "/home/julio/imagenes_lyra/"+req.files.myFile.originalFilename
      });

      rutaImagenes.save(function(err, rutaImagenes){
        if(err) {
          deleteFile(req.files.myFile.path);
          return res.status(500).send ("Error al realizar el cargue de la imagen");
        }
        deleteFile(req.files.myFile.path);
        return res.status(200).jsonp(rutaImagenes);
      });
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
