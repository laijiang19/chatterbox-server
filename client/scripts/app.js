var app = {};

app.parameters = window.location.search.replace(/%20/g, ' '); //?username=[input]
app.currentUser = _.escape(app.parameters.substr(10)); //[input]
// app.server = 'https://api.parse.com/1/classes/chatterbox';
app.server = 'http://localhost:3000/messages';
app.currentState = {}; //last 100 messages from server
app.currentRoom = 'defaultRoom';
app.allRooms = {};
app.allRoomsLength = 0;
app.first = true; //check if all rooms are initiated the first time around
app.friend = undefined; //current friend

app.init = function() {
  $('.spinner').hide();
  app.addRoom('defaultRoom');
  app.allRooms.defaultRoom = 'defaultRoom';
  app.fetch();
  $('#roomSelect').change(function(event) { //listens to change of room
    app.currentRoom = $('#roomSelect option:selected').text();
    app.fetch();
    event.preventDefault();
  });
};

app.send = function(message){
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {

    },
    error: function (data) {
      console.error('chatterbox: Failed to send message \n data: ');
      console.dir(data);
    }
  });
  $('.spinner').show();
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      app.clearMessages(); //clear all the messages on current page
      app.currentState = {}; //zeros the current state object
      // var pData = JSON.parse(data);
      for (var i = 0; i < data.results.length; i++) {
        var obj = data.results[i];
        var insertObj = {'username': _.unescape(obj.username), 'text': _.unescape(obj.text)};
        obj.roomname = _.unescape(obj.roomname);
        if (app.currentState[obj.roomname] !== undefined) {
          (app.currentState[obj.roomname]).push(insertObj);
        } else {
          app.currentState[obj.roomname] = [insertObj];
        }
      }
      app.allRooms = {};
      for (var key in app.currentState) {
        app.allRooms[key] = key;
      }
      app.addAllRooms();
      app.messageToRoom();
    },
    error: function (data) {
      console.error('chatterbox: Failed to receive message \n data: ');
    }
  });
  $('.spinner').hide();
};

app.clearTextbox = function(myTextboxID) {
  $('#' + myTextboxID).val('');
};

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.clearRooms = function() {
  $('#roomSelect').children().remove();
};

app.addMessage = function(message) {
  if (message.username === app.friend){
    $('#chats').prepend('<div class = "chat friend"><div class = username>' + _.escape(message.username) + '</div><div>' + _.escape(message.text) + '</div></div>');
  }
  else {
    $('#chats').prepend('<div class = chat><div class = username>' + _.escape(message.username) + '</div><div>' + _.escape(message.text) + '</div></div>');
  }
  $('.chat').off();
  $('.chat').click(function(event){
    if ($(this).hasClass('friend')){
      app.friend = undefined;
    }
    else {
      app.friend = $($(this).children()[0]).text();
    }
    event.preventDefault();
  });
};

app.addRoom = function(room, allRoom) {
  if (app.allRooms[room] === undefined){
    app.allRooms[room] = room;
    $('#roomSelect').append($('<option>'+_.escape(room)+'</option>'));
    app.allRoomsLength++;
  }
  if (!allRoom){
    $('#roomSelect').val(room).attr('selected',true);
    app.currentRoom = room;
  }
};

// app.addFriend = function(friend) {
//   // friends[friend] = friends[friend] || 0;
//   // friends[friend]++;
//   app.friend = friend;
// };

app.handleSubmit = function(message, room) {
  var obj = {};
  obj.text = _.escape(message);
  obj.username = app.currentUser;
  obj.roomname = _.escape(room || app.currentRoom);
  app.send(obj);
};

app.messageToRoom = function(){
  _.each(app.currentState[app.currentRoom], function(obj){
    app.addMessage(obj);
  });
};

app.addAllRooms = function () {
  if (app.first){
    for (var key in app.allRooms) {
      app.allRoomsLength++;
      $('#roomSelect').append($('<option>'+_.escape(key)+'</option>'));
    }
    app.first = false;
  }
  else {
    app.allRoomsLength = 0;
    for (var prop in app.allRooms){
      app.allRoomsLength++;
      app.addRoom(prop, true);
    }
  }
};

app.spamOneRoom = function(room) {
    var size = Math.floor(100/app.allRoomsLength);
    for (var i = 0; i < size; i++) {
      app.handleSubmit(randomMessage(), room);
    }
};

app.spamAllRooms = function() {
  for (var key in app.allRooms) {
    app.spamOneRoom(key);
    setTimeout(function() {}, 1000);
  }
};

// random tweet generator
var opening = ['just', '', '', '', '', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'last night i', 'the president', 'that wizard', 'a ninja', 'a seedy old man'];
var verbs = ['drank', 'drunk', 'deployed', 'got', 'developed', 'built', 'invented', 'experienced', 'fought off', 'hardened', 'enjoyed', 'developed', 'consumed', 'debunked', 'drugged', 'doped', 'made', 'wrote', 'saw'];
var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of'];
var nouns = ['cat', 'koolaid', 'system', 'city', 'worm', 'cloud', 'potato', 'money', 'way of life', 'belief system', 'security system', 'bad decision', 'future', 'life', 'pony', 'mind'];
var tags = ['#techlife', '#burningman', '#sf', 'but only i know how', 'for real', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];

var randomMessage = function(){
  return [randomElement(opening), randomElement(verbs), randomElement(objects), randomElement(nouns), randomElement(tags)].join(' ');
};

var randomElement = function(array){
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

$(function() {
  $('#send').submit(function(event){
    var mess = $('#message').val();
    app.handleSubmit(mess);
    app.clearTextbox('message');
    event.preventDefault();
  });

  $('#newRoom').submit(function(event){
    var roomName = $('#roomName').val().trim();
    app.addRoom(roomName);
    app.clearTextbox('roomName');
    event.preventDefault();
  });

  app.init();

  setInterval(function() {
    app.fetch();
  }, 1000);
});



