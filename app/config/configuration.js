var config = {
  production: {
    port: 8080,
    bd: {
      host: 'mongodb://localhost/',
      nameBD: 'imagenes_lyra'
    },
    upload_file_dest: '/media/julio/Documentos/temp',
    params_cargue_images: {
      kb: 1024,
      cantMaxDir: 1024,
      idParticion: 1,
      porcentajeDisponibilidad: 10
    }
  },
  dev: {
    port: 3000,
    bd: {
      host: 'mongodb://localhost/',
      nameBD: 'imagenes_lyra'
    },
    upload_file_dest: '/media/julio/Documentos/temp',
    params_cargue_images: {
      kb: 1024,
      cantMaxDir: 5,
      idParticion: 1,
      porcentajeDisponibilidad: 80
    }
  }
}

exports.get = function get(env) {
  return config[env] || config.dev;
}
