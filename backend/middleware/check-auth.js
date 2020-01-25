const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // token - Bearer value
    jwt.verify(token, 'secret_development_value');
    next();
  } catch (error) {
    res.status(401).json();
  }
};
