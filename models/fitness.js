const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserInfoSchema = new Schema({
    username: { type: String, required: true },
    calories: { type: Number },
    yearsofFitness: { type: String },
    goals: { type: String },
    FitnessMode: { type: String },
}, { timestamps: true })

const WorkoutSchema = new Schema({
    username: { type: String, required: true },
    workout_name: { type: String, required: true },
    workout: { type: {}, required: true },
},
    { timestamps: true })


const userInfo = mongoose.model('UserFitInfo', UserInfoSchema)
const routines = mongoose.model('WorkoutRoutines', WorkoutSchema)

const exercises_db = [] // redacted exercise catalogue parsed from DB

const cardio = []
const hyptertrophy = []
const powerlifting = []
const calisthenics = []

module.exports = { userInfo, routines, exercises_db, cardio, hypertrophy, powerlifting, calisthenics }
