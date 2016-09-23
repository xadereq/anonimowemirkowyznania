var mongoose = require('mongoose');
var wykop = require('./wykop.js');
var wykopController = require('./wykop.js');
var surveyController = require('./survey.js');
var actionController = require('./actions.js');
var tagController = require('./tags.js');
var auth = require('./authorization.js');
var config = require('../config.js');
var confessionModel = require('../models/confession.js');
var replyModel = require('../models/reply.js');
mongoose.connect(config.mongoURL, (err)=>{
  if(err) throw err;
});
const types = {
  1: 'confession',
  2: 'reply',
  'confession':1,
  'reply':2
};
class Queue {
  constructor() {
    this.stack = [];
    setInterval(()=>{
      if(this.stack.length>0){
        this.processElement(this.stack[0][0], this.stack[0][1]);//confession and user object
      }
    }, 5000);
  }
  addToQueue(type, el, user){
    if(!type||!el)return;
    el.type = types[type];
    this.stack.push([el, user]);
  }
  processElement(el, user){
    if(el.status == 1)return this.stack.splice(0,1);
    switch (el.type) {
      case 1:
        confessionModel.findById(el._id).populate('survey').exec((err, confession)=>{
          if(err) return this.stack.splice(0,1);;
          if(confession.entryID && confession.status==1){
            return this.stack.splice(0,1);
          }
          if(confession.status == -1){
            return this.stack.splice(0,1);
          }
          if(confession.survey){
            //this part is totally fucked up, i should probaby do something about it ://
            if(confession.embed){
              surveyController.uploadAttachment(confession.embed, function(attachment){
                if(attachment.success){
                  confession.embedHash = attachment.hash;
                  surveyController.acceptSurvey(confession, user, function(result){
                    if(!result.success){
                      surveyController.wykopLogin();
                    }
                    if(result.success)wykopController.addNotificationComment(confession, user);
                    if(result.success)return this.stack.splice(0,1);
                  });
                }
              });
            }else{
              surveyController.acceptSurvey(confession, user, function(result){
                if(!result.success){
                  surveyController.wykopLogin();
                }
                if(result.success)wykopController.addNotificationComment(confession, user);
                if(result.success)return this.stack.splice(0,1);
              });
            }
            //{"error":{"code":62,"message":"Limit przekroczony"}}
            //error:{code: 1, field: null, message_en: "", message_pl: "Twój limit dodawania komentarzy został wyczerpany",…}
          }else{
            wykopController.acceptConfession(confession, user, function(result){
              if(result.success)wykopController.addNotificationComment(confession, user);
              return console.log(result);
            });
          }
        });
        break;
      case 2:
      replyModel.findById(req.params.reply_id).populate('parentID').exec((err, reply)=>{
        if(err) return this.stack.splice(0,1);
        if(reply.commentID){
          return this.stack.splice(0,1);
        }
        if(reply.status == -1){
          return this.stack.splice(0,1);
        }
        wykopController.acceptReply(reply, user, function(result){
          res.json(result);
        });
      });
        break;
      default:
      return;
    }
  }
}

var q = new Queue();
var user = {_id: '56e6edd9172d123568f0334d',
   username: 'sokytsinolop',
   password: 'Moderuje100',
   authorized: true };
confessionModel.findById('57e4ef919c4ecaf2c468ee8a').select({_id: 1, status:1}).exec((err, confession)=>{
  if(err) return console.log(err);
  q.addToQueue('confession', confession, user);
});
