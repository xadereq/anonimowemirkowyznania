var express = require('express');
var jwt = require('jsonwebtoken');
var adminRouter = express.Router();
var mongoose = require('mongoose');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');
var userModel = require('./models/user.js');
//authoriztion
adminRouter.get('/login', (req, res)=>{
  res.render('./admin/login.jade');
});
adminRouter.post('/login', (req, res)=>{
  userModel.findOne({
    username: req.body.username
  }, (err, user)=>{
    if(err) throw err;

    if(!user){
      res.json({success:false, response:{message: 'user not found'}});
      return;
    }
    if(user.password == req.body.password){
      //success login
      var token = jwt.sign(user, config.secret, {expiresIn: 1440*60});
      res.cookie('token', token);
      res.redirect('/confessions');
    }else{
      res.json({success:false, response:{message: 'wrong password'}});
      return;
    }
  });
});

adminRouter.use((req, res, next)=>{
  var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
  if (err){
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    }else{
      req.decoded = decoded;
      next();
    }
  });
  }else{
    return res.status(403).send({
      success: false,
      response: {message: 'No token provided.'}
    });
  }
  });
adminRouter.get('/', (req, res)=>{
  res.json({success:true, response:{message:'authorized'}});
});
adminRouter.get('/confessions', (req, res)=>{
  confessionModel.find().sort({_id: -1}).limit(100).exec((err, confessions)=>{
    if(err) res.send(err);
    res.render('./admin/confessions.jade', {confessions: confessions});
  });
});
adminRouter.get('/replies', (req, res)=>{
  replyModel.find().sort({_id: -1}).limit(100).exec((err, replies)=>{
    if(err) res.send(err);
    res.render('./admin/replies.jade', {replies: replies});
  });
});
module.exports = adminRouter;
