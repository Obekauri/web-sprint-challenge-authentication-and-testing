const router = require('express').Router();
const db = require('../../data/dbConfig')
const bcrypt = require('bcryptjs')

router.post('/register', (req, res) => {
  const { username, password } = req.body
  
  if(username.trim() && password.trim()){
    // Check username into database
    db('users')
      .where('username', username)
      .then(user => {
        if(!user.length){
          const hashedPassword = bcrypt.hashSync(password, 12)
          // Insert new user into db
          db('users')
            .insert(
              {
                'username': username,
                'password': hashedPassword
              }
            )
            .then(user => {
              res.status(201).json(user)
            })
            .catch(err => {
              res.status(404).json({
                message: 'User can not added',
                err: err.message,
                stack: err.stack
              })
            })
        }else{
          res.json('username taken')
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

router.post('/login', (req, res) => {
  res.json({message: 'POST LOGIN REQUEST'})
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



module.exports = router;
