var express = require('express');
var apiRouter = express.Router();
var mongoose = require('mongoose');
var wykop = require('./wykop.js');
var wykopController = require('./controllers/wykop.js');
var actionController = require('./controllers/actions.js');
var tagController = require('./controllers/tags.js');
var auth = require('./controllers/authorization.js');
var config = require('./config.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');

mongoose.connect(config.mongoURL, (err)=>{
  if(err) throw err;
});
/* api router */
apiRouter.get('/', (req, res)=>{
  res.json({success: true, response: {message: 'API is working!'}});
});
apiRouter.get('/participants/:entry_id', (req, res)=>{
  wykopController.getParticipants(req.params.entry_id, (err, participants)=>{
    if(err)return res.json(err);
    res.json(participants);
  });
});
apiRouter.use(auth);
apiRouter.route('/confession').get((req, res)=>{
  confessionModel.find((err, confessions)=>{
    if(err) res.send(err);
    res.json(confessions);
  });
});
apiRouter.route('/confession/accept/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) res.send(err);
    if(confession.entryID && confession.status==1){
      res.json({success: false, response: {message: 'It\'s already added', entryID: confession.entryID, status: 'danger'}});
      return;
    }
    if(confession.status == -1){
      res.json({success: false, response: {message: 'It\'s marked as dangerous, unmark first', status: 'danger'}});
      return;
    }
    var entryBody = `#anonimowemirkowyznania \n${confession.text}\n\n [Kliknij tutaj, aby odpowiedzieć w tym wątku anonimowo](${config.siteURL}/reply/${confession._id}) \n[Kliknij tutaj, aby wysłać OPowi anonimową wiadomość prywatną](${config.siteURL}/conversation/${confession._id}/new) \nPost dodany za pomocą skryptu AnonimoweMirkoWyznania ( ${config.siteURL} ) Zaakceptował: ${req.decoded._doc.username} \n **Po co to?** \n Dzięki temu narzędziu możesz dodać wpis pozostając anonimowym.`;
    wykop.request('Entries', 'Add', {post: {body: tagController.trimTags(entryBody, confession.tags), embed: confession.embed}}, (err, response)=>{
      if(err){
        //{"error":{"code":11,"message":"Niepoprawny klucz użytkownika"}}
        res.json({success: false, response: {message: JSON.stringify(err), status: 'warning'}});
        if(err.error.code==11){
          throw(err);
        }
        return;
      }
      confession.entryID = response.id;
      wykop.request('Entries', 'AddComment', {params: [response.id], post: {body: `Zaplusuj ten komentarz, aby otrzymywać powiadomienia o odpowiedziach w tym wątku. [Kliknij tutaj, jeśli chcesz skopiować listę obserwujących](${config.siteURL}/followers/${confession._id})`}}, (err, notificationComment)=>{
        if(err)return console.log(err);
      actionController(req.decoded._doc._id, 1, function(err, actionId){
        if(err)return err;
        confession.actions.push(actionId);
        confession.status = 1;
        confession.addedBy = req.decoded._doc.username;
        confession.notificationCommentId = notificationComment.id;
        confession.save((err)=>{
          if(err) res.json({success: false, response: {message: err}});;
          res.json({success: true, response: {message: 'Entry added', entryID: response.id, status: 'success'}});
          });
        });
      });
    });
  });
});
apiRouter.route('/confession/danger/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) return res.json(err);
    confession.status==-1?confession.status=0:confession.status=-1;
    var status = confession.status==0?'warning':'danger';
    var actionType = confession.status==0?3:2;
    actionController(req.decoded._doc._id, actionType, function(err, actionId){
      if(err)return err;
      confession.actions.push(actionId);
      confession.save((err)=>{
        if(err) return res.json({success: false, response: {message: err}});
        res.json({success: true, response: {message: 'Zaaktualizowano status', status: status}});
      });
    });
  });
});
apiRouter.route('/confession/tags/:confession_id/:tag').get((req, res)=>{
  //there's probably more clean way to do this.
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err)return res.send(err);
    actionController(req.decoded._doc._id, 9, function(err, actionId){
    if(err)return err;
    confessionModel.update({_id: req.params.confession_id}, {$set: {tags: tagController.prepareArray(confession.tags, req.params.tag)}, $push:{actions: actionId}}, (err)=>{
      if(err)return res.json({success: false, response: {message: err}});
      res.json({success: true, response: {message: 'Tagi zaaktualizowano'}});
    });
    });
  });
});
apiRouter.route('/confession/delete/:confession_id').get((req, res)=>{
  confessionModel.findById(req.params.confession_id, (err, confession)=>{
    if(err) return res.send(err);
    wykopController.deleteEntry(confession.entryID, (err, result, deletedEntry)=>{
      if(err) return res.json({success: false, response: {message: err.error.message}});
        actionController(req.decoded._doc._id, 5, function(err, actionId){
          if(err)return err;
          confession.actions.push(actionId);
          confession.status = -1;
          confession.save((err)=>{
            if(err)return res.json({success: false, response: {message: err}});
            res.json({success: true, response: {message: `Usunięto wpis ID: ${result.id}`}});
            wykopController.sendPrivateMessage('sokytsinolop', `${req.decoded._doc.username} usunął wpis \n ${JSON.stringify(deletedEntry)}`, (err,res)=>{
              console.log(err, res);
            });
          });
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
  replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply)=>{
    if(err) return console.log(err);
    if(reply.commentID){
      res.json({success: false, response: {message: 'It\'s already added', commentID: reply.commentID, status: 'danger'}});
      return;
    }
    if(reply.status == -1){
      res.json({success: false, response: {message: 'It\'s marked as dangerous, unmark first', status: 'danger'}});
      return;
    }
    var authorized = '';
    if(reply.authorized){
      authorized = '\n**Ten komentarz został dodany przez osobę dodającą wpis (OP)**';
    }
    var entryBody = `**${reply.alias}**: ${reply.text}\n\nTo jest anonimowy komentarz.${authorized}\nZaakceptował: ${req.decoded._doc.username}`;
    wykopController.getFollowers(reply.parentID.entryID, reply.parentID.notificationCommentId, (followers)=>{
      if(followers.length > 0)entryBody+=`\n! Wołam obserwujących: ${followers.map(function(f){return '@'+f;}).join(', ')}`;
      wykop.request('Entries', 'AddComment', {params: [reply.parentID.entryID], post: {body: entryBody, embed: reply.embed}}, (err, response)=>{
        if(err){res.json({success: false, response: {message: JSON.stringify(err), status: 'warning'}}); return;}
        reply.commentID = response.id;
        reply.status = 1;
        reply.addedBy = req.decoded._doc.username;
        actionController(req.decoded._doc._id, 8, function(err, actionId){
          if(err)return;
          reply.parentID.actions.push(actionId);
          reply.parentID.save();
        });
        reply.save((err)=>{
          if(err) res.json({success: false, response: {message: err}});
          res.json({success: true, response: {message: 'Reply added', commentID: response.id, status: 'success'}});
        });
      });
    });
  });
});
apiRouter.route('/reply/danger/:reply_id').get((req, res)=>{
  replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply)=>{
    if(err) return console.log(err);
    var message = '';
    reply.status==-1?reply.status=0:reply.status=-1;
    var status = reply.status==0?'warning':'danger';
    var actionType = reply.status==0?3:2;
    reply.save((err)=>{
      if(err) res.json({success: false, response: {message: err}});
      actionController(req.decoded._doc._id, actionType, function(err, actionId){
        if(err)return;
        reply.parentID.actions.push(actionId);
        reply.parentID.save();
      });
      res.json({success: true, response: {message: 'Status zaaktualizowany', status: status}});
    });
  });
});
module.exports = apiRouter;
