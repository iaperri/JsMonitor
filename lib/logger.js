const morgan = require('morgan'),
  winston = require('winston'),
  DailyRotateFile = require('winston-daily-rotate-file'),
  path = require('../config/config').get('logPath'),
  { createLogger, format, transports } = require('winston'),
  { combine, timestamp, label, printf, prettyPrint } = format;

(function() {
  const myFormat = printf(info => {
    return `${info.timestamp} [${info.level}]: ${info.message}`;
  });

  const level = process.env.LOG_LEVEL || 'debug';
  const logger = winston.createLogger({
    format: combine(
      winston.format.colorize(),
      // label({ label: 'right meow!' }),
      timestamp(),
      // prettyPrint(),
      myFormat
    ),
    transports: [
      new winston.transports.Console({
        level: level,
        timestamp: true,
        colorize: true,
        handleExceptions: true,
        exitOnError: false,
      }),
      // new winston.transports.File({
      //   filename: 'application.log',
      //   handleExceptions: true,
      //   exitOnError: false,
      //   level: level,
      //   colorize: true,
      //   timestamp: true,
      //   // maxsize: 5242880, // 5MB
      //   // maxFiles: 5,
      // }),
      // new DailyRotateFile({
      //   level: 'debug',
      //   datePattern: 'YYYY-MM-DD',
      //   filename: 'degub_' + path,
      //   handleExceptions: false,
      //   json: true,
      //   maxsize: 10242880,
      //   maxFiles: 1,
      //   colorize: true
      // }),
      new DailyRotateFile({
        level: level,
        datePattern: 'YYYY-MM-DD',
        filename: './node.log', //path,
        handleExceptions: false,
        json: true,
        // maxsize: 5242880,
        maxFiles: 10,
        colorize: false
      }),
    ]
  });
  logger.stream = {
    write: function(message, encoding) {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
  };
  module.exports = logger;
})()
