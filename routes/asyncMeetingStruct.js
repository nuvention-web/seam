function meeting(name, userId, MeetingId, owner) {  
  this.name = name;
  this.userId = userId;
  this.meetingId = meetingId;
  this.owner = owner;
  this.people = [];
  this.status = "available";
};

meeting.prototype.addPerson = function(personID) {  
  if (this.status === "available") {
    this.people.push(personID);
  }
};

module.exports = meeting;  