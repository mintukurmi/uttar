const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    avatar: {
        id: String,
        url: String
    }
    },
    {
        timestamps: true
    })


const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;