function meetingStruct(name, userId, meetingId) {  
  this.name = name;
  this.userId = userId;
  this.meetingId = meetingId;
  this.owner = userId;
  this.people = [];
  this.status = "available";
};

meetingStruct.prototype.addPerson = function(clientId, userId) {  
  if (this.status === "available") {
    this.people.push({"clientId" : clientId, "userId" : userId});
  }
};

meetingStruct.prototype.removePerson = function(clientId, userId) {
  var i = this.people.length;
  while(i--){
    if(this.people[i].clientId === clientId){
      break;
    }
  }
  if(i >= 0){
    this.people.splice(i, 1);
  }
};

module.exports = meetingStruct;