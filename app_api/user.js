let router = require('express').Router();
let securePassword = require('secure-password');
let pwd = securePassword();
let jwt = require('jsonwebtoken');
let { User } = require('../database');
let config = require('../config');

// Get a JSON web token with the user's name and e-mail encoded within the token.
function getTokenForUser(user) {
  let token = jwt.sign({ name: user.name, email: user.email }, config.jsonWebTokenSecret);
  return token;
}

router.post('/register', async (req, res) => {
  try {
    let user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: req.body.password ? pwd.hashSync(Buffer.from(req.body.password)) : undefined
    });

    res.status(201).send({ token: getTokenForUser(user) });
  }
  catch(e) {
    // TODO: This error reporting can be improved a lot.
    if (e.name == 'ValidationError' || e.name == 'MongoError') {
      res.status(400);
    }
    else {
      console.log('unexpected error', e.message);
      res.status(500);
    }

    res.send(e.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    let isMatch = false;

    // If the user exists, check if the password matches.
    if (user) {
      var password = Buffer.from(req.body.password);
      var hash = Buffer.from(user.passwordHash);
      var verifyResult = pwd.verifySync(password, hash);

      // Password is a match.
      if (verifyResult === securePassword.VALID) {
        isMatch = true;
      }
      // Password is a match, but needs to be rehashed.
      else if (verifyResult === securePassword.VALID_NEEDS_REHASH) {
        isMatch = true;
        // Do this asynchronously, we don't need to wait for it to complete before we returning a response.
        pwd.hash(password).then((hash) => {
          user.passwordHash = hash;
          user.save();
        });
      }
    }

    if (isMatch) {
      res.status(200).send({ token: getTokenForUser(user) });
    }
    else {
      res.status(401).send('Incorrect username or password');
    }
  }
  catch(e) {
    console.log('unexpected error', e);
    res.status(500).send(e.message);
  }
});

router.post('/logout', (req, res) => {
  // We don't need to do anything here, the client handles the logout by deleting its token.
  res.send();
});

router.get('/profile', async (req, res, next) => {
  // Return a 401 if there's no authentication token.
  if (!req.token) {
    res.status(401).send();
    return;
  }

  try {
    let decoded = jwt.verify(req.token, config.jsonWebTokenSecret);
    let user = await User.findOne({ email: decoded.email }, '-passwordHash', { lean: true });

    if (user) {
      res.send(user);
    }
    else {
      res.status(401).send();
    }
  }
  catch (e) {
    console.log('unexpected error', e.message);
    res.status(500).send();
  }
});

module.exports = router;
