var winston = require('winston'),
  os = require('os'),
  moment = require('moment');

var rutaLogs = os.homedir() + "/logs/load_image/";

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({
      filename: rutaLogs + moment().format('YYYYMMDD') + '_error.log',
      level: 'error',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      colorize: false
    }),
    new winston.transports.File({
      filename: rutaLogs + moment().format('YYYYMMDD') + '_info.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      colorize: false
    }),
    new winston.transports.Console({
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});


module.exports.logger = logger;
