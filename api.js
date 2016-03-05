var express = require('express');
var apiRouter = express.Router();
var mongoose = require('mongoose');
var Wykop = require('wykop-es6');
var wykop = new Wykop('Vqoy4XvILb', '1CCpKUkUSL');
var confessionModel = require('./models/confession.js');

wykop.login('yRhi0Dm2N9VguXPjkYC0').then(function(res){
  console.log(res);
  console.log('logged In');
});
// dSyhTEay61JNy4tnDA2V
mongoose.connect('mongodb://mo1247_test:dSyhTEay61JNy4tnDA2V@mongo6.mydevil.net:27017/mo1247_test', (err)=>{
  if(err) throw err;
});


/* api router */
apiRouter.use((req, res, next)=>{
  console.log('API requested');
  //BASIC authorization
  if(req.headers.authorization != 'Basic RmlsaXA6bW9kZXJ1amUxMjM='){
    console.log('cannot authorize ')
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
    var entryBody = '#anonimowemirkowyznania \n'+confession.text+'\n\n Post dodany za pomocą skryptu AnonimoweMirkoWyznania ( http://p4nic.usermd.net ) \n **Po co to?** \n Dzięki temu narzędziu możesz dodać wpis pozostając anonimowym.';
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
module.exports = apiRouter;
