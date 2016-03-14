var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var config = require('./config.js');
var Wykop = require('wykop-es6');
var wykop = new Wykop(config.wykop.key, config.wykop.secret);
var md5 = require('md5');
var apiRouter = require('./api.js');
var adminRouter = require('./admin.js');
var watchRouter = require('./watch.js');
var confessionModel = require('./models/confession.js');
var replyModel = require('./models/reply.js');
var userModel = require('./models/user.js');
var crypto = require('crypto');

const _port = 1337;
const connectURL = 'http://localhost:1337/connect';
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/follow', watchRouter);

app.set('view engine', 'jade');

app.get('/', (req, res)=>{
  res.render('index');
});
app.post('/', (req, res)=>{
  var confession = new confessionModel();
  confession.text = req.body.text;
  confession.embed = req.body.embed;
  confession.auth = crypto.randomBytes(5).toString('hex');
  confession.save((err)=>{
    if(err) res.send(err);
      res.render('index', {success: true, confession: confession});
  });
});
app.get('/login', (req, res)=>{
  var redirectURL = encodeURIComponent(new Buffer(connectURL).toString('base64'));
  var secureKey = md5(config.wykop.secret+connectURL);
  res.redirect(`http://a.wykop.pl/user/connect/appkey,${config.wykop.key},userkey,,secure,${secureKey},redirect,${redirectURL}`);
});
app.get('/connect', (req, res)=>{
  //req.query.connectData
  var authDetails = JSON.parse(new Buffer(req.query.connectData, 'base64').toString('utf-8'));
  wykop.request('User', 'Login', {post: {accountkey: authDetails.token}}).then(function(response){
    console.log(response);
    userModel.findOneAndUpdate({username: response.login}, {avatar: response.avatar, userkey: response.userkey}, {upsert: true}, (err, loggedUser)=>{
      if(err) throw err;
      var token = jwt.sign(loggedUser, config.secret, {expiresIn: 1440*60});
      res.cookie('token', token);
      res.redirect('/');
    });
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
