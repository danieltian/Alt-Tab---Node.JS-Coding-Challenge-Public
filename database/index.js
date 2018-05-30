let mongoose = require('mongoose');
let User = require('./models/User');
let config = require('../config');

class Database {
  constructor() {
    this.User = User;
    // Initialize the User model. This will create indexes for any properties marked as unique in the schema.
    User.init();
  }

  async connect() {
    console.log('connecting to database server...');
    await mongoose.connect(config.databaseUrl);
    console.log('connected to database server');
  }
}

module.exports = new Database();
