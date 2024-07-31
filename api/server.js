const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session')

const restrict = require('./middleware/restricted.js');

const authRouter = require('./auth/auth-router.js');
const jokesRouter = require('./jokes/jokes-router.js');

const server = express();

const sessionConfig = {
    name: 'monkey', // sid
    secret: 'keep it secret, keep it safe!',
    cookie: {
        maxAge: 1000 * 30, // cookie and session will be valid for 30 sec
        secure: false, // true in production
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: false, // GDPR laws against setting cookies automaticly
}

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(session(sessionConfig))

server.use('/api/auth', authRouter);
server.use('/api/jokes', restrict, jokesRouter); // only logged-in users should have access!



server.use((req, res) => {
    res.status(404).json({
        message: 'Page Not Found'
    })
})

module.exports = server;
