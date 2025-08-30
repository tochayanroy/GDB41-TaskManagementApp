const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    image: {
       type: String, 
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User