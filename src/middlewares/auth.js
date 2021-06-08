const Admin = require('../models/Admin');
const Post = require('../models/Post');
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//dotenv config
dotenv.config()

const auth = async (req, res, next) => {

    
    try{

       const token = req.cookies['token'];
       
       // if token not found on user cookies, we ask the user to log in
       if(!token){
            req.flash('error', 'Please login first')
            return res.redirect('/login')
       }

       const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
        if(decoded.role == 'Admin'){
                const admin = await Admin.findOne({ _id: decoded._id , 'tokens.token': token })
            
                if (!admin) {
                    throw new Error()
                }

            req.user = admin;
        }
        else if (decoded.role == 'User') {
                const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

                if (!user) {
                    throw new Error()
                }
             req.user = user;
            }
        
        // const name = req.user.name.split(" ");
        
        // req.user.fname = name[0]
        // req.token = token;
        // req.role = decoded.role

        
        next()
    }
    catch(error){
        console.log(error)
        req.flash("error", "Some error occured")
        res.redirect('/login') 
    }
    
}


module.exports = auth