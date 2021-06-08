const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv");
const auth = require('../middlewares/auth');

const User = require('../models/User');
const Category = require('../models/Category');
const Post = require('../models/Post');

// env config
dotenv.config();

router.get("/", auth, async (req, res) => {
    
    try{ 
        
        const posts = await Post.find({});

        const latestPosts = await Post.find().sort({_id: -1}).limit(5);

        const categories = await Category.find();

        const allUsers = await User.find();

        if(!posts || !categories || !latestPosts || !allUsers){
            throw new Error();
        }

        res.render('index', { data: { categories , posts, latestPosts, user: req.user, header: "Explore", allUsers: allUsers} })
    }
    catch(err) {
        console.log(err)
    }  
})


// login
router.get('/login', (req, res) => {
    res.render('user/login', { success_msg: req.flash('success'), error_msg: req.flash('error') });
})

router.post('/login', async (req, res) => {
    
   try{

        const userFound = await User.findOne({email: req.body.email});

        if(!userFound){
            req.flash('error', 'No user found. Retry')
            return res.render('user/login', {error_msg: req.flash('error')})
        }

        const user = await User.findByCredentials( req.body.email,  req.body.password);

        const token = await user.generateAuthToken();

        res.cookie('token', token, {
            expires: new Date(Date.now() + 6 * 3600000), // cookie will be removed after 2 hours
            httpOnly: true
        }).redirect('/')

   }
   catch(err){
        console.log(err);
        req.flash('error', 'Unable to login. Check Email/Password')
        res.render('user/login', {error_msg: req.flash('error')})
   }
})


/// signup 
router.get('/signup', (req, res) => {
    res.render('user/signup');
})

router.post('/signup', async (req, res) => {
    
    try {

        const newUser = new User(req.body);
        const name = req.body.name;
        newUser.usermeta.name = name;
        
        // hashing pasword
        let hashedPassword = await bcrypt.hash(req.body.password, 8);

        newUser.password = hashedPassword;
        await newUser.save()

        req.flash('success', "Account Created Successfully")

        res.redirect('/login')
        
    }
    catch(err){
        console.log(err)
        if(err.code == 11000){
            req.flash("error", "Email already registered with us")
            res.render('user/signup', {error_msg: req.flash('error'), formData:{email: req.body.email, name: req.body.name}});
        }
    }

})


//profile

router.get('/profile', auth, async (req, res) => {

    try{

        const user = req.user;
        res.render('user/profile', {data:{ user } })
    }
    catch(err){

    }
})


// profile edit 
router.get('/profile/edit', auth, async (req, res) => {

    try{

        const user = req.user;
        res.render('user/profile_edit', {data:{ user } })
    }
    catch(err){

    }
})

router.post('/profile/edit', auth, async (req, res) => {

    try{

        const user = req.user;
        
       const { name, phone, profession, bio} = req.body;

        user.usermeta.name = name;
        user.usermeta.phone =phone;
        user.usermeta.profession = profession;
        user.usermeta.bio = bio;
        await user.save();
        
        res.redirect('/profile/')
    }
    catch(err){
        console.log(err);
    }
})


// logout route
router.get("/logout", auth, (req, res) => {

    const user = req.user;
    const token = req.cookies['token'];
    user.tokens = [];
    user.save()

    req.flash("success", "You were logged out")
    res.cookie('token', token, {
        expires: new Date(Date.now()), // usetting the token ccokie in user browser
        httpOnly: true
    }).redirect('/login')


})

// my posts
router.get('/my-posts', auth, async (req, res) => {
    try{

        const posts = await Post.find({author: req.user._id.toString() });
        const latestPosts = await Post.find().sort({_id: -1}).limit(5);
        const categories = await Category.find();

        if(!posts || !categories || !latestPosts){
            throw new Error();
        }
       
        res.render('index', {data: { posts , latestPosts, categories, user: req.user, header: "My Posts"  }})

    }
    catch(err){
        console.log(err)
    }
})


// search posts
router.get('/search', auth, async (req, res) => {
    try{
        const query = req.query.query;

        const posts = await Post.find({$text: {$search: query}}).limit(10);

        const latestPosts = await Post.find().sort({_id: -1}).limit(5);
        const categories = await Category.find();

        const allUsers = await User.find();

        if(!posts || !categories || !latestPosts || !allUsers){
            throw new Error();
        }
       
        res.render('index', {data: { posts , latestPosts, categories, user: req.user, query, allUsers,header: `Search Results: ${query} `  }})

    }
    catch(err){
        console.log(err)
    }
})

router.get('/user/:id', auth, async (req, res) => {

    try{
        const _id = req.params.id;
        
        const user = await User.findById(_id);

        res.render('user/view_profile', {data:{ user: req.user, userProfile: user} })

    }
    catch(err){

    }

})

module.exports = router