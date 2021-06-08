const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const userSchema = new mongoose.Schema({
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
    date: { 
        type: String 
    },
    avatar: {
        id: String,
        url: {
            type: String,
            default: "https://res.cloudinary.com/tremedy/image/upload/c_scale,w_90/v1582207349/avatars/man_2_lvablz.png"
        }
        
    },
    blocked: {
        type: Boolean,
        default: false
    },
    usermeta: {
        name: String,
        phone: String,
        profession: String,
        bio: String,
        socialLinks:{
            fb: String,
            ig: String,
            twitter: String
        }
    },
    liked_posts:{
        type: [String],
        trim: true
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
    }, {
        timestamps: true
    })



// hiding sensitive info from user
userSchema.methods.toJSON = function () {

    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


// generate auth token function
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString(), role: "User"}, process.env.JWT_SECRET, { expiresIn: '6h' })

    user.tokens = user.tokens.concat({ token })

    await user.save()

    return token
}


// custom login function for user
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("msg",'User Not Found')
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}


const User = mongoose.model('User', userSchema);

module.exports = User;