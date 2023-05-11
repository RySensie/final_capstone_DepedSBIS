'use strict';

var Mongoose = require('mongoose'),
  Config = require('../config');

var connection_string = '';

if (Config.env.dev) {
  connection_string =
    'mongodb://' +
    Config.mongodb_local.ip +
    ':' +
    Config.mongodb_local.port +
    '/' +
    Config.mongodb_local.app +
    '?authSource=admin';
  console.log('DATABASE CONNECTED @ ' + connection_string);
} else {
  connection_string =
    'mongodb+srv://' +
    Config.mongodb_production.username +
    ':' +
    Config.mongodb_production.password +
    '@' +
    Config.mongodb_production.ip +
    '/' +
    Config.mongodb_production.app

  console.log('');
  console.log('>>> *** PRODUCTION !!! ================================ !!! PRODUCTION');
  console.log('>>> *** PRODUCTION !!! CONNECTED TO PRODUCTION DATABASE !!! PRODUCTION');
  console.log(`>>> *** PRODUCTION !!! ADDRESS: ${ Config.mongodb_production.ip }`);
  console.log(`>>> *** PRODUCTION !!! DATABASE NAME: ${ Config.mongodb_production.app }`);
  console.log('>>> *** PRODUCTION !!! ================================ !!! PRODUCTION');
  console.log('');
}

Mongoose.Promise = global.Promise;
Mongoose.connect(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});