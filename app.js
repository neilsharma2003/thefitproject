require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const authRouter = require('./routes/authRouter')
const crudRouter = require('./routes/crudRouter')
const { requireAuth, checkUser } = require('./authmiddleware')
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const User = require('./models/credentials')
const dbURI = process.env.DB_URI

mongoose.connect(dbURI, () => console.log('DB connection made'))
    .then(app.listen(process.env.PORT || 4000, console.log('Listening on port')))
    .catch(err => console.log(err))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())

app.get('*', checkUser)
app.post('*', checkUser)
app.get('/', (req, res) => {
    res.render('index')
})

app.use(authRouter)
app.use(crudRouter)

app.use((req, res, next) => {
    res.status(404).render('404')
})
