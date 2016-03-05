var Wykop = require('wykop-es6');
var wykop = new Wykop('Vqoy4XvILb', '1CCpKUkUSL');

wykop.login('yRhi0Dm2N9VguXPjkYC0').then(function(res){
  console.log(res);
  console.log('logged In');
});

var confessionModel = require('./models/confession.js');

function getAcceptedConfessions(){
  confessionModel.findOne({"accepted": true, entryID: null}, (err, confession)=>{
    if(err){console.error(err); return;}
    if(!confession){
      return
    }
    if(confession.entryID){
      res.json({success: false, response: {message: 'It\'s already added', entryID: confession.entryID}});
      console.log('already added');
      return;
    }
    var entryBody = '#anonimowemirkowyznania \n'+confession.text+'\n\n Post dodany za pomocą skryptu AnonimoweMirkoWyznania ( http://p4nic.usermd.net ) \n **Po co to?** \n Dzięki temu narzędziu możesz dodać wpis pozostając anonimowym.';
    wykop.request('Entries', 'Add', {post: {body: entryBody, embed: confession.embed}}, (err, response)=>{
      if(err) throw err;
      confession.entryID = response.id;
      confession.save((err)=>{
        if(err) res.send(err);
        return true;
      });
    });
  });
}
getAcceptedConfessions();
setInterval(()=>{
  getAcceptedConfessions();
}, 30000);
