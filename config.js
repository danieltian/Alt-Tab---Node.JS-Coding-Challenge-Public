let path = require('path');
let fs = require('fs');
let argv = require('minimist')(process.argv.slice(2));

const defaultConfigFile = './app.config.json';

class Config {
  constructor() {
    this.isValid = true;

    // Use the config file set from the command line.
    if (argv.config) {
      let cfg = require(path.resolve(argv.config));
      Object.assign(this, cfg);
    }
    // Use the default config file.
    else if (fs.existsSync('./app.config.json')) {
      let cfg = require('./app.config.json');
      Object.assign(this, cfg);
    }
    // No config file found, show an error message.
    else {
      console.error(`Config file not found! Either create app.config.json or pass in a path using --config=/path/to/config.json`)
      this.isValid = false;
      // Don't need to process the rest, since without a config file the required properties won't exist.
      return;
    }

    // Database URL must exist to connect to the database.
    if (!this.databaseUrl) {
      console.error(`'databaseUrl' property is required in the config file`);
      this.isValid = false;
    }
    // JSON web token secret must exist in order to encode/decode the user token.
    if (!this.jsonWebTokenSecret) {
      console.error(`'jsonWebTokenSecret' property is required in the config file`);
      this.isValid = false;
    }
  }
}

module.exports = new Config();
