const db = require('../../data/dbConfig.js')

const validateRegister = async (req, res, next) => {
    try{
        const { username, password } = req.body
        if(
            !username || !password ||
            typeof username != 'string' || typeof password != 'string' ||
            !username.trim() || !password.trim()
        ){
            res.status(500).json({
                message: "username and password required"
            })
        } else {
            req.username = username
            req.password = password
            db('users')
                .where('username', username)
                .then(userFound => {
                    !userFound.length? next(): res.status(400).json({
                        message: 'username taken'
                    })
                })
        }
    }catch(err){
        next(err)
    }

}

const validateLogin = async (req, res, next) => {
    try{
        const { username, password } = req.body
        if(!username || !password){
            res.status(404).json({
                message: 'username and password required'
            })
        }else{
            req.username = username
            req.password = password
            next()
        }
    }catch(err){
        next(err)
    }
}
  
  module.exports = {
    validateRegister,
    validateLogin
  };