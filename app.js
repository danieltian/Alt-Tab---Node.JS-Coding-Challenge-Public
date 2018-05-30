'use strict';

let express = require('express');
let app = express();
let userRouter = require('./app_api/user');
let bodyParser = require('body-parser');
let bearerToken = require('express-bearer-token');
let config = require('./config');
let database = require('./database');

app.use(bodyParser.json());
app.use(bearerToken());

function setUpClient() {
  app.use(express.static('app_client'));
  app.use(express.static('public'));
}

function setUpApi() {
  app.use('/api', userRouter);
}

function startWebServer() {
  app.listen(8080, () => console.log('web server running on http://localhost:8080'));
}

// If the config file is not valid, stop the app.
if (!config.isValid) {
  process.exit(1);
}

database.connect();
setUpClient();
setUpApi();
startWebServer();

module.exports = app;
