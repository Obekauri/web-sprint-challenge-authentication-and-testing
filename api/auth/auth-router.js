const router = require('express').Router();
const db = require('../../data/dbConfig')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secrets = require('../../config/secret.js')

router.post('/register', (req, res, next) => {
  const { username, password } = req.body
  
  if(
    (typeof username === 'string' && typeof password === 'string') &&
    (username.trim() && password.trim().length > 3)
  ){
    // Check username into database
    db('users')
      .where('username', username)
      .then(user => {
        if(!user.length){
          const hashedPassword = bcrypt.hashSync(password, 7)
          // Insert new user into db
          db('users')
            .insert(
              {
                'username': username,
                'password': hashedPassword
              }
            )
            .then(userId => {
              db('users')
                .where('id', userId)
                .then(displayUser => {
                  res.body = displayUser
                  res.status(201).json(displayUser)
                })
                .catch(next)
            })
            .catch(next)
        }else{
          res.json({
            message: 'username taken'
          })
        }
      })

  }else{
    res.status(500).json({
      message: "username and password required"
    })
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body

  if(!username || !password){
    res.status(404).json({
      message: 'username and password required'
    })
  } else {
    db('users')
      .where('username', username)
      .first()
      .then(userValid => {
        if(userValid && bcrypt.compareSync(password, userValid.password)){
          const token = generateToken(userValid)
          req.session.token = token
          res.status(200).json({
            message: `welcome, ${username}`,
            token
          })
        }else{
          res.status(400).json({
            message: "invalid credentials"
          })
        }
      })
      .catch(next)
  }
  
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
