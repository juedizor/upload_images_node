var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require('mongoose'),
  routingLyra = require('./routing/uploadImageRouting'),
  cors = require('cors'),
  compression = require('compression'),
  logger = require('./log/logger').logger,
  config = require('./config/configuration').get(process.env.NODE_ENV);


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use(compression());
app.use('/api', routingLyra);


mongoose.Promise = global.Promise;
// Connection to DB
mongoose.connect(config.bd.host + config.bd.nameBD, {
    useMongoClient: true
  },
  function(err, res) {
    if (err) throw err;
    logger.info('Conexión exitosa BD');
  });

// Start server
const server = app.listen(config.port, function(err, success) {
  if (err) throw err;
  logger.info('Arranque de server exitoso puerto: ' + config.port);
});
