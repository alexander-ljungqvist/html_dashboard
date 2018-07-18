var time_re = new RegExp("(\d+/\d+/\d+)\s+(\d+:\d+):\d+");

function getInfo(addr, sucess) {
  var xhr = new XMLHttpRequest();
  if (!('withCredentials' in xhr)) xhr = new XDomainRequest();
  xhr.open('GET', addr);
  xhr.onload = sucess;
  xhr.send();
}

(function(){
  getInfo("http://172.16.119.201:8080", function(request){
      var response = request.currentTarget.response;
      var body = JSON.parse(response);
      body = JSON.parse(body.mqtt_body);
      var events = [];
      var today = moment(1, "HH"); // 01:00 today
      for (var i = 0; i < body.length; i++) {
        if(body[i].Topic == "Securitas/DoorAccessGranted"){
          var m = moment(body[i].Payload.DateTime, 'YY/MM/DD hh:mm:ss');
          if(m.isAfter(today)){ // remove if object is not today
            events.push(body[i]);
          }
        }
      }
      door.events = events.reverse();
    }
  );
})();
