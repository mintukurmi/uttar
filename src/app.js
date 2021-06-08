
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const flash = require('connect-flash');
const session = require('express-session');
const moment = require('moment');
// const paginate = require('handlebars-paginate');
const cookieParser = require('cookie-parser')

// const cloudinary = require('cloudinary')

require('./configs/db/mongoose');
require('./middlewares/socket');

// models
const Category = require('./models/Category');
const User = require('./models/User');


// express init
const app = express(); 
const server = http.createServer(app);
const io = socketio(server);


app.use(cookieParser());   // config cookie parser

// bodyParser config
app.use(bodyParser.urlencoded({ extended: false }))   // parse application/x-www-form-urlencoded
app.use(bodyParser.json())   // parse application/json


// express session init
app.use(session({
    secret: 'thisisasecret', 
    expires: new Date(Date.now() + (1800 * 1000)),
    resave: true,
    saveUninitialized: true
  }))

// logging
// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
  })
  
  // setup the logger
  app.use(morgan('combined', { stream: accessLogStream }))
  

//connect flash init
app.use(flash());

// Global variables

app.use( function(req, res, next){
    
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    
    next();
})  


// define paths for express config
const publicDirPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');


//setting up the view engine and changing views dir
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// post time resolver
hbs.registerHelper('formatDate', function (date, format) { 
  // return moment(date).format(format);
  return moment(date).fromNow();
 });

 // helper to return category name
 hbs.registerHelper('dispCategoriesColor', function (categories, cat) { 
    for(j=0; j<categories.length; j++){
      if(categories[j]._id == cat){
          return categories[j].color;
          }
    }  
 });

// helper to return category name
 hbs.registerHelper('dispCategoriesName', function (categories, cat) { 
    for(j=0; j<categories.length; j++){
      if(categories[j]._id == cat){
          return categories[j].name;
          }
    }  
 });

 // helper to calculate viewers
 hbs.registerHelper('calculateViewers', function (viewers) { 
  return viewers.length;
});

// helper to calculate likes
hbs.registerHelper('calculateLikes', function (likes) { 
  return likes.length;
});

// helper to calculate likes
hbs.registerHelper('likeBtnToggle', function (user, likes) { 
  if(likes != []){
      if(likes.includes(user._id)){
          return "fa-thumbs-up";
      }
      else{
        return "fa-thumbs-o-up"
      }
  }
  else{
    return 'fa-thumbs-o-up'
  } 
});

// helper to calculate likes
hbs.registerHelper('likeBtnTextToggle', function (user, likes) { 
  if(likes != []){
      if(likes.includes(user._id)){
          return "Liked";
      }
      else{
        return "Like"
      }
  }
  else{
    return 'Like'
  } 
});

// helper to split and display name
hbs.registerHelper('dispUserName', function (user) { 
  const name = user.usermeta.name.split(" ");
  return name[0]
});

// helper to count the comments
hbs.registerHelper('countComments', function (comments = []) { 
  return comments.length == 0 ? 'No' : comments.length
});

// helper to get user name
hbs.registerHelper('showPostAuthor', function (users = [], id) { 
    
    for(i=0; i<users.length; i++){
      if(users[i]._id == id){
        return users[i].usermeta.name
      }
    }  
});

// helper to get user name
hbs.registerHelper('showPostAuthorProfile', function (users = [], id) { 
    
  for(i=0; i<users.length; i++){
    if(users[i]._id == id){
      return users[i].avatar.url
    }
  }  
});

// serving public assets
app.use(express.static(publicDirPath));

app.use('/posts', express.static(publicDirPath));

app.use('/profile', express.static(publicDirPath));
app.use('/profile/edit', express.static(publicDirPath));
app.use('/search', express.static(publicDirPath));
app.use('/user', express.static(publicDirPath));

// Routes Variables
const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');


// variables
const port = process.env.PORT || 3000;


// Routers configs
app.use('/', indexRouter);
app.use('/posts', postsRouter);


app.listen(port, () => {
    console.log('Server running on port ' + port)
})