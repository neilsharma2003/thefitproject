const jwt = require('jsonwebtoken')
const User = require('./models/credentials')

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err)
                res.redirect('/login')
            }
            else {
                next()
            }
        })
    }
    else {
        res.redirect('/login')
    }

}

const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null
                console.log(err.message)
                next()
            }
            else {
                const user = await User.findById(decodedToken.id)
                res.locals.user = user
                next()
            }
        })
    }
    else {
        res.locals.user = null
        next()
    }
}

module.exports = { requireAuth, checkUser }