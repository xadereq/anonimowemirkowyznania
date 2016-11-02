const express = require('express');
const request = require('request');
const config = require('./config.js');
const analysisSchema = require('./models/analysis.js');;
var analizatorRouter = express.Router();
checkCodeHomepay = function(code, cb){
  request.get(`http://homepay.pl/API/check_code.php?usr_id=${config.analizator.userid}&acc_id=${config.analizator.accid}&code=${code}`, (err, response, body)=>{
    if(err||response.statusCode !== 200)return cb(err);
    return cb(null, body);
  });
}
checkCodeSimpay = function(code, number, cb){
  request({method: 'POST', url: 'https://simpay.pl/api/1/status', form: JSON.stringify({params: {auth: {key: 'ab14fae7', secret: 'acfe12ad2442844f8262eba8bfd1996d'}, service_id: '1879', number, code}}), json:true}, (err, response, body)=>{
    if(err||response.statusCode !== 200)return cb('API SMS nie jest dostępne, sprobuj ponownie pozniej.');
    if(body.error[0])return cb(body.error[0].error_name);
    cb(null, body.respond.status);
  });
}
analizatorRouter.get('/', (req, res)=>{
  res.render('./analizator/index');
});
analizatorRouter.get('/regulamin', (req, res)=>{
  res.render('./analizator/regulamin');
});
analizatorRouter.post('/', (req, res)=>{
  if(!req.body.username||!req.body.code)return res.render('./analizator/result', {err:'Proszę podać nick i kod z SMS'});
  checkCodeSimpay(req.body.code, '7136', (err, codeResult)=>{
    if(err)return res.render('./analizator/result', {err});
    codeResult==='OK'?message='Twoje konto zostanie wkrotce sprawdzone, a wyniki dodane na mikroblog pod tagiem #mirkoanalizator.':message='Kod niepoprawny';
    if(codeResult==='OK'){
      var analysis = new analysisSchema();
      analysis.username = req.body.username;
      analysis.entryId = -1;
      analysis.save();
    }
    res.render('./analizator/result', {err: null, message});
  });
});
module.exports = analizatorRouter;
