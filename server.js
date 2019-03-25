"use strict";
var express = require("express"),
  bodyParser = require("body-parser"),
  errorHandler = require('errorhandler'),
  units = require('./lib/units'),
  app = express(),
  mongo = require('./lib/mongo'),
  passport = require('passport'),
  ensure = require('./passport/attachAuthenticationStatus'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  routes = require('./routes/index')(passport),
  chokidar = require('chokidar'),
  schedule = require('node-schedule'),
  timeout = require('connect-timeout'),
  flash = require('connect-flash'),
  initPassport = require('./passport/init'),
  logger = require('./lib/logger'),
  IP_FILE_PATH = './ip_maps/mapping.json';
const MongoStore = require('connect-mongo')(session);

var config = '';
(() => {
  let env = 'dev',
    param = process.argv[2];
  if (param) {
    env = param;
  }
  logger.info(`environment: ${env}, param: ${param}`);

  require('./config/env.js').setEnv(env);
  config = require('./config/config.js');
})();

const mongoUrl = config.get('mongoUrl');
const path = config.get('logPath');
logger.debug(`path ${path}`);
logger.info(`mongourl ${mongoUrl}`);

app.use(cookieParser());
app.use(session({
  secret: "It\'s my secret key 012345",

  cookie: {
    maxAge: 1000 * 60 * 60 * 9,
    activeDuration: 1000 * 60 * 60 * 9,
    httpOnly: false,
    rolling: true
  },
  store: new MongoStore({
    url: `${mongoUrl}/data`,
    ttl: 1000 * 60 * 60
  })
}));

logger.debug('out!');
app.use(passport.initialize());
app.use(passport.session());

app.use(timeout(120000));

// app.use(morgan('tiny', { stream: logger.stream }));

// app.use(morgan('dev', {
//   stream: process.stdout
// }));

// app.use(morgan('dev', {
//   skip: function (req, res) {
//       return res.statusCode >= 400;
//   }, stream: process.stdout
// }));

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates

app.use(flash());

// Initialize Passport
initPassport(passport);
app.use(ensure);

// var router = express.Router();
app.use(express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/dist', express.static(__dirname + '/dist'));
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/services', express.static(__dirname + '/services'));
app.use('/utils', express.static(__dirname + '/utils'));
app.use(bodyParser.json({
  limit: '1mb'
}));
app.use(bodyParser.urlencoded({
  limit: '1mb'
}));

app.set('views', __dirname + '/public/views');
app.set('view engine', 'jade');


app.use(function(req, res, next) {
  logger.info(`${[req.method]} ${req.url} from ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
  next();
});

app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.use('/', routes);


app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});


app.use(function(req, res, next) {
  if (!req.timedout) next();
  else {
    logger.error(`request ${req.connection.remoteAddress} timed out`);
  }
});



// Send current time to all connected clients
// function sendTime() {
//   io.emit('time', { time: new Date().toJSON() });
// }

app.listen(3000, function() {
  logger.info("All right ! I am alive at Port 3000.");
  schedule.scheduleJob('01 00 * * *',
    function() {
      logger.info('running opening hours task');
      require("./lib/openinghours.js").storeNewOpeningHours();
    });
  schedule.scheduleJob('30 18 * * *',
    function() {
      logger.info('running mongo export notes');
      mongo && mongo.export('notes');
    });
  //every 30 min
  schedule.scheduleJob('1 * * * *',
    function() {
      require("./lib/extracolumns").storeExtraColumns();
    });
  mongo.connect(mongoUrl, "data", function() {
    logger.info('connected to mongo db');

    require("./lib/openinghours").storeNewOpeningHours();
    require("./lib/extracolumns").storeExtraColumns();

  });
});
