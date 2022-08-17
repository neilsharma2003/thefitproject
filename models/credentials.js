const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const userSchema = new Schema({
    email: { type: String, required: [true, 'Please enter an email'], unique: true },
    username: { type: String, required: [true, 'Please enter an username'], unique: true },
    password: { type: String, required: [true, 'Please enter an password'] }
}, { timestamps: true })

userSchema.statics.login = async function (username, password) {
    const user = await this.findOne({ username })
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user
        }
    }
    else {
        throw Error('Incorrect username or password')
    }
    throw Error('Incorrect username or password')
}

const User = mongoose.model('User', userSchema)

module.exports = User