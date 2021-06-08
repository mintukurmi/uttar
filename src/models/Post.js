const mongoose = require('mongoose');
const moment = require('moment');

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    comments:[{
            comment:{
                type:String,
                required: true
            },
            author: String,
            likes: [String],
            views: [String],
            lastUpdated:{
                type: Date,
                default: moment().format()
            },
            
        }],
    likes: {
        likes_count: Number,
        liked_by: [String]
    },
    categories: [String],
    views:{
        viewers: [String]
    }
},
{
    timestamps: true
})

postSchema.index({title: 'text', description: 'text'});


const Post = mongoose.model('Post', postSchema);

module.exports = Post