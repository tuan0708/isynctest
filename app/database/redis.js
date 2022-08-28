var redis = require('redis');
require('dotenv').config();
var client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});
const logger = require('../configs/logger');
const errorLogger = logger.errorLogger;

client.on('connect', function () {
    errorLogger.info('Redis client connected');
    console.log('Redis client connected');
});

client.on('error', function (err) {
    errorLogger.info('Redis client error: ' + err);
    console.log('Redis client error: ' + err);
});

exports.client = client;