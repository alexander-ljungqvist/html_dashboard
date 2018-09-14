'use strict'
var camera_array = [
  {
    name: "PYR01_PyrEntrance"
  }
  ,
  {
    name: "PYR03_V1Room1B"
  }
  ,
  {
    name: "PYR02_V1Room1A"
  }
  ,
  {
    name: "PYR04_PyramidV1Entrance"
  }
  ,
  {
    name: "PYR05_V1EmergencyExit"
  }
  ,
  {
    name: "Pyramid_Corridor"
  }
  ,
  {
    name: "Pyramid_V1_Entrance_2"
  }
  ,
  {
    name:"PYR10_V4Hallway"
  }
  ,
  {
    name:"PET02_Devroom"
  }
  ,
  {
    name:"PET03_Designroom"
  }
  ,
  {
    name:"PET01_PetraEntrance"
  }
  ,
  {
    name:"PYR09_V1ServerRoom"
  }
];

new Vue({
  el: '#doorev',
  data: {
    events: []
  },
  methods: {
    doorevents() {
      setInterval(() => {
        var self = this;
        getInfo("http://172.16.119.201:8080", function(request) {
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
      }, 5000);

    },
  },
  mounted: function() {
    this.doorevents();
  }
});
//HEll
new Vue({
  el: '#activeusers',
  data: {
    users: []
  },
  methods: {
    activeusers() {
      setInterval(() => {
        var self = this;
        var userArr = [];
        getInfo("http://127.0.0.1:5000/api/activeusers", function(request) {
          var response = request.currentTarget.response;
          var jsonUser = JSON.parse(response);
          console.log(jsonUser);
          for (var i = 0; i < jsonUser.length; i++) {
            userArr.push(jsonUser[i]);
          }
          self.users = userArr;
          userArr = [];

        });
      }, 20000);

    },
  },
  mounted: function() {
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
      setInterval(() => {
        var self = this;
        var roomnames = [];
        var myrooms = {};
        getInfo("http://172.16.8.230:3000/api/rooms", function(request) {
          var response = request.currentTarget.response;
          var roomresponse = JSON.parse(response);
          for (var i = 0; i < roomresponse.length; i++) {
            roomnames.push(roomresponse[i].name);
            myrooms[roomresponse[i].fullname] = [];
          }

          for (var i = 0; i < roomnames.length; i++) {
            getInfo("http://172.16.8.230:3000/api/rooms/" + roomnames[i] + "/events?to=" + moment(23, "HH").toISOString(), function(request) {
              var body = JSON.parse(request.currentTarget.response);
              for (var i = 0; i < body.length; i++) {
                body[i].timeStart = moment(body[i].timeStart).format("HH:mm")
                body[i].timeEnd = moment(body[i].timeEnd).format("HH:mm")
              }
              if (body.length != 0) {
                myrooms[body[0].room] = body;
              }
              self.rooms = myrooms;
            });
          }
        });
      }, 10000);
    },
  },
  mounted: function() {
    this.bookings();
  }
});

new Vue({
  el: '#camera_response_msg',
  data: {
    arrays_:[
      {
        name: "PYR01_PyrEntrance",
        state: false
      },
      {
        name: "PYR03_V1Room1B",
        state: false
      },
      {
        name: "PYR02_V1Room1A",
        state: false
      },
      {
        name:"PYR04_PyramidV1Entrance",
        state : false
      },
      {
        name:"PYR05_V1EmergencyExit",
        state : false
      },
      {
        name: "Pyramid_Corridor",
        state: false
      },
      {
        name: "Pyramid_V1_Entrance_2",
        state: false
      },
      {
        name: "PYR10_V4Hallway",
        state: false
      },
      {
        name:"PET02_Devroom",
        state: false
      },
      {
        name: "PET03_Designroom",
        state: false
      },
      {
        name: "PET01_PetraEntrance",
        state: false
      },
      {
        name:"PYR09_V1ServerRoom",
        state: false
      }
    ]
  },
  methods: {
    camera_response_update() {
      setInterval(() => {
        var self = this;
        getInfo("http://172.16.8.230:8081/mqtt_response", function(request) {
          var camera_decider = request.currentTarget.response;
          self.arrays_.forEach(function(element){
            if(element.name == camera_decider){
              element.state = true;
              console.log(element.name);
            }else{
              element.state = false;
            }
          });
        });
      }, 5000);

    },
  },
  mounted: function() {
    this.camera_response_update();
  }
});

function getInfo(addr, sucess) {
  var xhr = new XMLHttpRequest();
  if (!('withCredentials' in xhr)) xhr = new XDomainRequest();
  xhr.open('GET', addr);
  xhr.onerror= function(){
    console.log("Currently no changes available");
  }
  xhr.onload = sucess;
  xhr.send();
}
