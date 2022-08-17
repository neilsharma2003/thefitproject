const User = require('../models/credentials')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { userInfo, routines, exercises_db, cardio, hypertrophy, powerlifting, calisthenics } = require('../models/fitness')

require('dotenv').config()

module.exports.newuser_get = async (req, res) => {
    res.render('newuser')
}
module.exports.newuser_post = async (req, res) => {
    let user = res.locals.user
    let user_req_body = req.body
    let starter_workout = {}
    starter_workout.username = user.username
    user_req_body.username = user.username
    if (user_req_body.FitnessMode == 'cardio') {
        starter_workout.workout = cardio
        starter_workout.workout_name = 'Default Cardio'
    }
    else if (user_req_body.FitnessMode == 'hypertrophy') {
        starter_workout.workout = hypertrophy
        starter_workout.workout_name = 'Default Hypertrophy'
    }
    else if (user_req_body.FitnessMode == 'powerlifting') {
        starter_workout.workout = powerlifting
        starter_workout.workout_name = 'Default Powerlifting'
    }
    else if (user_req_body.FitnessMode == 'calisthenics') {
        starter_workout.workout = calisthenics
        starter_workout.workout_name = 'Default Calisthenics'
    }
    const user_info = new userInfo(user_req_body)
    const workout_info = new routines(starter_workout)
    await user_info.save()
        .then(resp => console.log(resp))
        .catch(err => console.log(err))
    await workout_info.save()
        .then(resp => console.log(resp))
        .catch(err => console.log(err))
    res.redirect('dashboard')
}
module.exports.dashboard_get = async (req, res) => {
    try {
        if (res.locals.user) {
            const fitnessUser = await userInfo.findOne({ username: res.locals.user.username })
            const allWorkouts = await routines.find({ username: res.locals.user.username }).exec()
            res.status(200).render('dashboard', { allWorkouts })
        }
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.personalinfo_get = async (req, res) => {
    let wrong
    const fitnessUser = await userInfo.findOne({ username: res.locals.user.username })
    res.render('personalinfo', { fitnessUser, wrong })
}
module.exports.passwordreset_post = async (req, res) => {
    const { currentpass, newpass, confirmnewpass } = req.body
    const username = res.locals.user.username
    const user = await User.findOne({ username })
    const auth = await bcrypt.compare(currentpass, user.password)
    if (auth && newpass == confirmnewpass) {
        user.password = await bcrypt.hash(newpass, 10)
        user_submit = new User(user)
        user_submit.save()
            .then(resp => {
                console.log(resp)
                res.redirect('dashboard')
            })
            .catch(err => console.log(err))
    }
    else {
        let fitnessUser = await userInfo.findOne({ username: res.locals.user.username })
        let wrong = "Invalid password or new passwords don't match"
        res.render('personalinfo', { fitnessUser, wrong })
    }
}
module.exports.newworkout_get = async (req, res) => {
    res.render('addworkout')
}
module.exports.newworkout_put = async (req, resp) => {
    const query = req.body.query.split(' ')
    let exercises_array = []
    for (let i = 0; i < exercises_db.length; i++) {
        if (exercises_db[i].name.includes(query[0] || exercises_db[i].name.includes(query[query.length - 1]))) {
            exercises_array.push(exercises_db[i])
        }
    }
    resp.json(exercises_array)
}
module.exports.newworkout_post = async (req, res) => {
    try {
        const req_workout = req.body
        const user = res.locals.user.username
        let workout_name = req_workout[req_workout.length - 1].workout_name
        req_workout.pop()
        let workout_for_mongo = {}
        workout_for_mongo.username = user
        workout_for_mongo.workout_name = workout_name
        workout_for_mongo.workout = req_workout
        workout_submit = new routines(workout_for_mongo)
        workout_submit.save()
            .then(resp => {
                console.log(resp)
                res.send(resp)
            })
            .catch(err => console.log(err))
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.addexercise_get = async (req, res) => {
    const _id = req.params.id
    const oneWorkout = await routines.findById({ _id })
    res.render('addexercise', { oneWorkout })
}
module.exports.addexercise_put = async (req, resp) => {
    const _id = req.params.id
    const exercise = req.body
    console.log(exercise)
    try {
        let oneWorkout = await routines.findById({ _id })
        let list_of_ex = oneWorkout.workout
        list_of_ex.push(exercise)
        oneWorkout.workout = list_of_ex
        oneWorkout_updated = new routines(oneWorkout)
        oneWorkout_updated.save()
            .then(res => resp.json(res))
            .catch(err => console.log(err))
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.workout_get = async (req, res) => {
    const _id = req.params.id
    try {
        const oneWorkout = await routines.findById({ _id })
        res.status(200).render('workout', { oneWorkout })
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.workout_delete = async (req, resp) => {
    const _id = req.params.id
    try {
        await routines.findByIdAndDelete({ _id }).then(res => resp.json({ res }))
        console.log("Item deleted!")
    }
    catch (err) {
        console.log(err)
    }
}
module.exports.editworkout_get = async (req, res) => {
    const _id = req.params.id
    try {
        const oneWorkout = await routines.findById({ _id })
        res.render('editworkout', { oneWorkout })
    }
    catch (err) {
        console.log(err)
        res.render('404')
    }
}
module.exports.editworkout_put = async (req, resp) => {
    const _id = req.params.id
    let new_workout = req.body
    let submit_json = {}
    submit_json.workout_name = new_workout[new_workout.length - 1].workout_name
    new_workout.pop()
    let workout_json = []
    for (let i = 0; i < new_workout.length; i++) {
        for (let j = 0; j < exercises_db.length; j++) {
            if (exercises_db[j].name == new_workout[i].name) {
                workout_json.push(exercises_db[j])
            }
        }
        workout_json[i].sets = new_workout[i].sets
    }
    submit_json.workout = workout_json
    let username = (await routines.findById({ _id })).username
    await routines.deleteOne({ _id: _id })
    submit_json.username = username
    const submit_model = new routines(submit_json)
    submit_model.save()
        .then(res => resp.json(res))
        .catch(err => console.log(err))
}
