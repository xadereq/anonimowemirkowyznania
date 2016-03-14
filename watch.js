var express = require('express');
var watchRouter = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
watchRouter.use((req, res, next)=>{
  var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.secret, function(err, user) {
      if(err)return res.json({ success: false, message: 'Failed to authenticate token.' });
      req.user = user;
      next();
  });
  }
});
watchRouter.get('/:confessionid', (req, res)=>{
   confessionModel.findById(req.params.confessionid).populate('_followers', 'username').exec((err, confession)=>{
      if(err)res.send(err);
      res.render('watch', {confession, user: req.user});
    });
});
watchRouter.post('/:confessionid', (req, res)=>{
  confessionModel.findOneAndUpdate({_id: req.params.confessionid}, {$addToSet: {_followers: req.user._doc._id}}, {upsert: true, returnNewDocument: true}, (err, confession)=>{
    if(err) throw err;
    res.render('watch', {confession, user: req.user, success: true});
  });
});
watchRouter.post('/:confessionid/unfollow', (req, res)=>{
  confessionModel.findOneAndUpdate({_id: req.params.confessionid}, {$pull: {_followers: req.user._doc._id}}, {upsert: true, returnNewDocument: true}, (err, confession)=>{
    if(err) throw err;
    res.json(confession);
    res.render('watch', {confession, user: req.user, success: true});
  });
});


module.exports = watchRouter;
