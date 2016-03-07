var express = require('express');
var adminRouter = express.Router();
var mongoose = require('mongoose');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');

adminRouter.use((req, res, next)=>{
  //authorize
  next();
});
adminRouter.get('/', (req, res)=>{
  res.json({success:false});
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
