var roomnames = [];
var myrooms = {};
var userArr = [];

function getInfo(addr, sucess) {
  var xhr = new XMLHttpRequest();
  if (!('withCredentials' in xhr)) xhr = new XDomainRequest();
  xhr.open('GET', addr);
  xhr.onload = sucess;
  xhr.send();
}

(function () {
  setInterval(updateDoor(), 5000);
  setInterval(updateKonf(), 10000);
})();

function updateDoor() {
  getInfo("http://172.16.119.201:8080", function (request) {
    var response = request.currentTarget.response;
    var body = JSON.parse(response);
    body = JSON.parse(body.mqtt_body);
    var events = [];
    var today = moment(1, "HH"); // 01:00 today
    for (var i = 0; i < body.length; i++) {
      if (body[i].Topic == "Securitas/DoorAccessGranted") {
        var m = moment(body[i].Payload.DateTime, 'YY/MM/DD hh:mm:ss');
        if (m.isAfter(today)) { // remove if object is not today
          events.push(body[i]);
        }
      }
    }
    door.events = events.reverse();
  }
  );
}

function updateKonf() {
  roomnames = [];
  myrooms = {};
  getInfo("http://172.16.8.230:3000/api/rooms", function (request) {
    var response = request.currentTarget.response;
    var rooms = JSON.parse(response);
    for (room of rooms) {
      roomnames.push(room.name);
      myrooms[room.fullname] = [];
    }
  }
  );
  setTimeout(function () {
    for (room of roomnames) {
      getInfo("http://172.16.8.230:3000/api/rooms/" + room + "/events?to=" + moment(23, "HH").toISOString(), function (request) {
        var body = JSON.parse(request.currentTarget.response);
        for (var i = 0; i < body.length; i++) {
          body[i].timeStart = moment(body[i].timeStart).format("HH:mm")
          body[i].timeEnd = moment(body[i].timeEnd).format("HH:mm")
        }
        if (body.length != 0) {
          myrooms[body[0].room] = body;
        }
      });
    }
    setTimeout(function () {
      konf.rooms = myrooms;
    }, 5000);
  }, 1000);
}