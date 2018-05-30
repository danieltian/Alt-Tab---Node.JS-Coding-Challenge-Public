let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: [true, 'You must provide an e-mail address.'] },
  name: { type: String, required: [true, 'You must provide a name.'] },
  passwordHash: { type: String, unique: true, required: [true, 'You must provide a password.'] },
});

let User = mongoose.model('User', userSchema);

module.exports = User;
