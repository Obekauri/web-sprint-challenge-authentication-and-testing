const db = require('../../data/dbConfig')

function registerUser(username, password) {
  return db('users')
    .insert({
        username: username,
        password: password
    })
    .then(userId => {
        return db('users')
            .where('id', userId[0])
    })

}


function loginUser(username) {
    return db('users')
        .where({
            username: username
        })
}

module.exports = {
    registerUser,
    loginUser
}