var express = require('express');
var conversationRouter = express.Router();
var confessionModel = require('./models/confession.js');
var conversationController = require('./controllers/conversations.js');
conversationRouter.get('/:confessionid/new', (req, res)=>{
  confessionModel.findById(req.params.confessionid, (err, confession)=>{
    if(err) return res.sendStatus(404);
    conversationController.createNewConversation(confession, (err, conversationid)=>{
      if(err) return res.send(500);
      res.redirect(`/conversation/${conversationid}`);
    });
  });
});
conversationRouter.get('/:conversationid/:auth?', (req, res)=>{
  if(!req.params.conversationid){
    return res.sendStatus(400);
  }
  conversationController.getConversation(req.params.conversationid, req.params.auth, req.params.auth?true:false, (err, conversation)=>{
    if(err) return res.send(err);
    res.render('conversation', {conversation});
  });
});
conversationRouter.post('/:conversationid/:auth?', (req, res)=>{
  if(!req.params.conversationid){
    return res.sendStatus(400);
  }
  conversationController.newMessage(req.params.conversationid, req.params.auth, req.body.text, (err)=>{
    if(err)return res.send(err);
    conversationController.getConversation(req.params.conversationid, req.params.auth, req.params.auth?true:false, (err, conversation)=>{
      if(err) return res.send(err);
      res.render('conversation', {conversation});
    });
  })
});
module.exports = conversationRouter;
