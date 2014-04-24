function meetingStruct(name, userId, meetingId, owner) {  
  this.name = name;
  this.userId = userId;
  this.meetingId = meetingId;
  this.owner = owner;
  this.people = [];
  this.status = "available";
  console.log("This is the owner:" + owner)
};

meetingStruct.prototype.addPerson = function(personID) {  
  if (this.status === "available") {
    this.people.push(personID);
  }
};

module.exports = meetingStruct;