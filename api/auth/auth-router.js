const router = require('express').Router();
const db = require('../../data/dbConfig')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secrets = require('../../config/secret.js')
const User = require('./auth-modul.js')
const validation = require('./auth-midleware.js')

router.post('/register', validation.validateRegister, (req, res, next) => {
  const hashedPassword = bcrypt.hashSync(req.password, 2^8)
  User.registerUser(req.username, hashedPassword)
    .then(newUser => {
      res.status(201).json(newUser[0])
    })
    .catch(next)
});

router.post('/login', validation.validateLogin, (req, res, next) => {
  User.loginUser(req.username)
  .then(validUser => {
    if(validUser[0] && bcrypt.compareSync(req.password, validUser[0].password)){
      const token = generateToken(validUser[0])
      req.headers.authorization = token
      res.status(200).json({
        message: `welcome, ${validUser[0].username}`,
        token
      })
    }else{
      res.status(401).json({
        message: 'invalid credentials'
      })
    }
  })
  .catch(next)
  
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function generateToken(user) {
	const payload = {
		subject: user.id, // sub
		username: user.username,
    password: user.password
	}
  const options = {
		expiresIn: '8h',
	}
	
	return jwt.sign(payload, secrets.jwtSecret, options)
}


router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: 'Something wrong inside auth routers',
    err: err.message,
    stack: err.stack,
  })
})

module.exports = router;
