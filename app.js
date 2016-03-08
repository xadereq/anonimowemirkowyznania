var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var config = require('./config.js');
var apiRouter = require('./api.js');
var adminRouter = require('./admin.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');
var userModel = require('./models/user.js');
var crypto = require('crypto');

const _port = 1337;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', apiRouter);
app.use('/sokytsinolop', adminRouter);

app.set('view engine', 'jade');

app.get('/', (req, res)=>{
  res.render('index');
});
app.post('/', (req, res)=>{
  var confession = new confessionModel();
  confession.text = req.body.text;
  confession.embed = req.body.embed;
  confession.auth = crypto.randomBytes(5).toString('hex');
  // TODO: DELCODE
  console.log(confession);
  confession.save((err)=>{
    if(err) res.send(err);
      res.render('index', {success: true, confession: confession});
  });
});
app.get('/reply/:confessionid', (req, res)=>{
  confessionModel.findById(req.params.confessionid, (err, confession)=>{
  if(err){res.json({success: false, response:{message: 'confession not found'}}); return;}
  res.render('reply', {confession: confession});
  });
});
app.post('/reply/:confessionid', (req, res)=>{
  confessionModel.findById(req.params.confessionid, (err, confession)=>{
    if(err){res.json({success: false, response:{message: 'confession not found'}}); return;}
    if(confession){
    var reply = new replyModel();
    reply.text = req.body.text;
    reply.embed = req.body.embed;
    reply.alias = req.body.alias || "Anon";
    if(reply.alias == confession.auth){
      reply.alias = "OP";
      reply.authorized = true;
    }
    reply.auth = crypto.randomBytes(5).toString('hex');
    reply.parentID = confession.entryID;
    reply.save((err)=>{
      if(err) res.send(err);
        res.render('reply', {success: true, reply: reply, confession: confession});
    });
    }else{
        res.json({success: false, response:{message: 'confession not found'}});
    }
  });
});
app.get('/cotojest', (req, res)=>{
  res.render('cotojest');
});
app.listen(_port, ()=>{
  console.log('listening on port '+_port);
});
