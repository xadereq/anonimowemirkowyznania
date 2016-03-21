var wykop = require('../wykop.js');
wykopController = {
  getFollowers: function(entryID, notificationCommentId, cb){
    var followers = '!';
    wykop.request('Entries', 'Index', {params: [entryID]}, (err, entry)=>{
      if(err)return console.log(err);
      for(i in entry.comments){
        var current = entry.comments[i];
        if (current.id == notificationCommentId){
          if(current.voters){
            for(i in current.voters){
              followers+=`@${current.voters[i].author} `;
            }
          }
        }
      }
      cb(followers);
    });
  }
}
module.exports = wykopController;
