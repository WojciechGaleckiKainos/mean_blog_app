const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const INVALID_CREDENTIALS = 'Invalid authentication credentials!';

exports.registerUser = (req, res, next) => {
  console.log('Received signup request');
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json();
        })
        .catch(err => {
          res.status(401).json({
            message: INVALID_CREDENTIALS
          });
        });
    });
};

exports.loginUser = (req, res, next) => {
  console.log('Received login request');
  let fetchedUser;
  User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        returnAuthFailedResponse(res);
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(compare => {
      if (!compare) {
        returnAuthFailedResponse(res);
      }
      const token = jwt.sign(
        {email: fetchedUser.email, userId: fetchedUser._id},
        'secret_development_value',
        {expiresIn: '1h'}
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      returnAuthFailedResponse(res);
    });
};

function returnAuthFailedResponse(res) {
  return res.status(401).json({
    message: INVALID_CREDENTIALS
  });
}
