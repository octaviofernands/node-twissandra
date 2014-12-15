config = require('../config/main');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client(config.db);

module.exports = client;