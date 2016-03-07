var express = require('express');
var apiRouter = express.Router();
var mongoose = require('mongoose');
var config = require('./config.js');
var Wykop = require('wykop-es6');
var wykop = new Wykop(config.wykop.key, config.wykop.secret);
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');

wykop.login(config.wykop.connection).then(function(res){
  console.log(res);
  console.log('logged In');
});
mongoose.connect(config.mongoURL, (err)=>{
  if(err) throw err;
});


/* api router */
apiRouter.use((req, res, next)=>{
  console.log('API requested');
  //BASIC authorization
  if(req.headers.authorization != config.authString){
    console.log('cannot authorize');
    res.json({success: false, response: {message: 'authorization required'}});
    return;
  }
  next();
});
apiRouter.get('/', (req, res)=>{
  res.json({success: true, response: {message: 'API is working!'}});
});
apiRouter.route('/confession').get((req, res)=>{
  confessionModel.find((err, confessions)=>{
    if(err) res.send(err);
    res.json(confessions);
  });
});
apiRouter.route('/confession/accept/:confession_id').get((req, res)=>{
  console.log(req.params.confession_id);
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) res.send(err);
    if(confession.entryID){
      res.json({success: false, response: {message: 'It\'s already added', entryID: confession.entryID}});
      console.log('already added');
      return;
    }
    var entryBody = `#anonimowemirkowyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć anonimowo](http://p4nic.usermd.net/reply/${confession._id}) \nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( http://p4nic.usermd.net ) \n **Po co to?** \n Dzięki temu narzędziu możesz dodać wpis pozostając anonimowym.`;
    wykop.request('Entries', 'Add', {post: {body: entryBody, embed: confession.embed}}, (err, response)=>{
      if(err) throw err;
      confession.entryID = response.id;
      confession.accepted = true;
      confession.save((err)=>{
        if(err) res.send(err);
        res.json({success: true, response: {message: 'Entry added', entryID: response.id}});
      });
    });
  });
});
apiRouter.route('/reply').get((req, res)=>{
  reply.find((err, replies)=>{
    if(err) res.send(err);
    res.json(replies);
  });
});
apiRouter.route('/reply/accept/:reply_id').get((req, res)=>{
  console.log(req.params.reply_id);
  replyModel.findById(req.params.reply_id, (err, reply)=>{
    if(err) res.send(err);
    if(reply.authorized){
      var authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**';
    }
    var entryBody = `**${reply.alias}**: ${reply.text}\n\nTo jest anonimowy komentarz${authorized}`;
    wykop.request('Entries', 'AddComment', {params: [reply.parentID], post: {body: entryBody, embed: reply.embed}}, (err, response)=>{
      if(err) throw err;
      reply.commentID = response.id;
      reply.accepted = true;
      reply.save((err)=>{
        if(err) res.send(err);
        res.json({success: true, response: {message: 'Reply added', commentID: response.id}});
      });
    });
  });
});
module.exports = apiRouter;
