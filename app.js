var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var apiRouter = require('./api.js');
var confessionModel = require('./models/confession.js');
const _port = 1337;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', apiRouter);

app.set('view engine', 'jade');

app.get('/', (req, res)=>{
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});
app.post('/', (req, res)=>{
  var confession = new confessionModel();
  confession.text = req.body.text;
  confession.embed = req.body.embed;
  // TODO: DELCODE
  console.log(confession);
  confession.save((err)=>{
    if(err) res.send(err);
      res.json({success: true, response: {message: 'confession created'}});
  });
});
app.listen(_port, ()=>{
  console.log('listening on port '+_port);
});
