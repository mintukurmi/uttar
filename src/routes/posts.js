const express = require('express');
const router = new express.Router();
var moment = require('moment');
const auth = require('../middlewares/auth');
const dotenv = require('dotenv');
const Pusher = require('pusher');
var ObjectId = require('mongodb').ObjectID;

// Model imports
const Post = require('../models/Post');
const Category = require('../models/Category');

dotenv.config(); // env config


let pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER
});



router.get('/categories', auth, async(req, res) => {

    try {

        const categories = await Category.find({});

        res.send(categories)
        
    }
    catch(err){

    }
})


router.post('/create', auth, async (req, res) => {

    try{
    
        const post = new Post(req.body)
        post.author = req.user._id;

        post.save();

        res.status(201).send({success: "Post Successfully created", _id:post._id })

    }  
    catch(err){

    }
})



router.get('/', auth, async (req, res) => {

    try {

        const posts = await Post.find({});

        if(!posts){
            throw new Error();
        }

        res.render('index', { data: { posts } })
    }
    catch(err){

    }
})


router.get('/:id', auth, async (req, res) => {

    try{

        const categories = await Category.find({});

        const _id = req.params.id;
        const post = await Post.findById(_id);

        if(!post){
            throw new Error()
        }

        const ifViewed = post.views.viewers.includes(req.user._id);
        
        if(!ifViewed) {
            post.views.viewers.push(req.user._id);
            post.save();
            console.log( post.views.viewers)
        }
        
        res.render('post/post_view', { data: { post, categories, user: req.user } })
      
    }
    catch(err) {

    }
})


router.post('/:id/like', auth, async (req, res, next) => {
   
    try{
        const action = req.body.action;
        const counter = action === 'Like' ? 1 : -1;
        // Post.updateOne({_id: req.params.id}, {$inc: {'likes.likes_count': counter}}, {}, (err, numberAffected) => {
            
        //     res.send('');
        // });
    
        const post = await Post.findById(req.params.id);
    
        if(!post){
            throw new Error();
        }
    
        const liked = post.likes.liked_by.includes(req.user._id)
    
        if(!liked) {
            // post.likes.liked_by.push(req.user._id);
            // post.save();
            // console.log('liked add',post)
            await Post.findByIdAndUpdate(req.params.id, {
                $push: {
                    'likes.liked_by': req.user._id
                }
            }, { new: true });
        }
        else{

            await Post.findByIdAndUpdate(req.params.id, {
                $pull: {
                    'likes.liked_by': req.user._id
                }
            }, { new: true });
        }
    
    
        
        pusher.trigger('post-events', 'postAction', { action: action, postId: req.params.id }, req.body.socketId);
        res.send();
    }
    catch(err){
        console.log(err)
    }
});



router.post('/:id/comment', auth, async (req, res) => {

    try{

        const _id = req.params.id;  // post id
        const post = await Post.findById(_id);
        
        const comment = req.body.comment;
        const cid = new ObjectId();

        post.comments = post.comments.concat({_id: cid, comment: comment, author: req.user._id});   

        post.save()

        res.redirect('/posts/' + _id + '#' + cid)

    }
    catch(err){
        console.log(err)
    }
})


// comment like route

router.post('/:cid/like/:id', auth, async (req, res, next) => {
   
    try{
    
        const action = req.body.action;
        const counter = action === 'Like' ? 1 : -1;

        const pid = new ObjectId(req.params.cid); // comment id 
        const cid = new ObjectId(req.params.id);

        const post = await Post.findById({_id:pid});

    
      post.comments.findIndex((element, index) => {
        
        if(element._id.equals(cid)){
            // const comment = post.comments[index]
            console.log('read', post.comments[index])
            const liked = post.comments[index].likes.includes(req.user._id)
            if(!liked) {
                    post.comments[index].likes.push(req.user._id);
                    post.save();
                    console.log('like', post.comments[index])
                    return
            }
            if(liked) {
                post.comments[index].likes.findIndex((item, index) => {
                    if(req.user._id == item){
                        post.comments[index].likes.splice(index,1);
                        post.save();
                        console.log('unlike', post.comments[index])
                        return
                    }
                })
            }
            return
        }
    });

   

        // console.log("comment", req.user._id,_id,cid,_comment)

        // if(!post){
        // }
    
        // const liked = post.comments.likes.includes(req.user._id)
    
        // if(!liked) {
        //     // post.likes.liked_by.push(req.user._id);
        //     // post.save();
        //     // console.log('liked add',post)
        //     await Post.findByIdAndUpdate(req.params.id, {
        //         $push: {
        //             'likes': req.user._id
        //         }
        //     }, { new: true });
        // }
        // else{

        //     await Post.findByIdAndUpdate(req.params.id, {
        //         $pull: {
        //             'likes': req.user._id
        //         }
        //     }, { new: true });
        // }
    
    
        
        pusher.trigger('post-events', 'postAction', { action: action, postId: req.params.id }, req.body.socketId);
        res.send();
    }
    catch(err){
        console.log(err)
    }
});


module.exports = router