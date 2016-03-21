var config = require('./config.js');
var Wykop = require('wykop-es6');
var wykop = new Wykop(config.wykop.key, config.wykop.secret);
wykop.login(config.wykop.connection).then(function(res){
  console.log('logged In');
});
module.exports = wykop;
