new Vue({
  el: '#doorev',
  data: {
    events: []
  },
  methods: {
    doorevents() {
      setInterval(() => {
        var self = this;
        getInfo("http://172.16.119.201:8080", function (request) {
          var response = request.currentTarget.response;
          var body = JSON.parse(response);
          body = JSON.parse(body.mqtt_body);
          var eventarr = [];
          var today = moment(1, "HH"); // 01:00 todayƒ
          for (var i = 0; i < body.length; i++) {
            if (body[i].Topic == "Securitas/DoorAccessGranted") {
              var m = moment(body[i].Payload.DateTime, 'YY/MM/DD hh:mm:ss');
              if (m.isAfter(today)) { // remove if object is not today
                eventarr.push(body[i]);
              }
            }
          }
          self.events = eventarr.reverse();
        });
      }, 1000);

    },
  },
  mounted: function () {
    this.doorevents();
  }
});


new Vue({
  el: '#activeusers',
  data: {
    users: []
  },
  methods: {
    activeusers() {
      setInterval(() => {
        var self = this
        var userArr = [];
        self.users = [];
        getInfo("https://jsonplaceholder.typicode.com/posts", function (request) {
          var response = request.currentTarget.response;
          var jsonUser = JSON.parse(response);
          for (var i = 0; i < jsonUser.length; i++) {
            userArr.push(jsonUser[i]);
          }
          self.users = userArr;
          userArr = [];

        });
      }, 10000);

    },
  },
  mounted: function () {
    this.activeusers();
  }
});

new Vue({
  el: '#konf',
  data: {
    rooms: {}
  },
  methods: {
    bookings() {
      roomnames = [];
      myrooms = {};
      var self= this;
      getInfo("http://172.16.8.230:3000/api/rooms", function (request) {
        var response = request.currentTarget.response;
        var roomresponse = JSON.parse(response);
        for (room of roomresponse) {
          roomnames.push(room.name);
          myrooms[room.fullname] = [];
        }
      });
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
          self.rooms = myrooms;
        }, 5000);
      }, 1000);
    },
  },
  mounted: function () {
    this.bookings();
  }
});

function getInfo(addr, sucess) {
  var xhr = new XMLHttpRequest();
  if (!('withCredentials' in xhr)) xhr = new XDomainRequest();
  xhr.open('GET', addr);
  xhr.onload = sucess;
  xhr.send();
}