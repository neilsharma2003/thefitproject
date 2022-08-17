const User = require('../models/credentials')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600
    })
}
module.exports.signup_get = async (req, res) => {
    let exists;
    res.render("signup", { exists })
}

module.exports.signup_post = async (req, res) => {
    let { email, username, password } = req.body

    try {
        if (await User.exists({ username: username }) || await User.exists({ email: email })) {
            console.log('Username or email already exists!')
            const exists = "Username or email already exists! Please login"
            res.render("signup", { exists })
        }
        else {
            let hashedpass = await bcrypt.hash(password, 10)
            password = hashedpass
            const user = await User.create({ email, username, password })
            const token = createToken(user._id)
            res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 })
            res.status(201).redirect('newuser')
        }
    }
    catch (err) {
        const exists = "Username or email already exists! Please login"
        console.log(err)
        res.status(400).render('signup', { exists })
    }
}

module.exports.login_post = async (req, res) => {
    let wrong
    const { username, password } = req.body
    try {
        const user = await User.login(username, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 })
        res.status(200).redirect('dashboard')
    }
    catch (err) {
        wrong = "Wrong username or password"
        res.render('login', { wrong })
    }
}

module.exports.login_get = async (req, res) => {
    let wrong
    res.render("login", { wrong })
}

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
}