var door = new Vue({
  el: '#doorev',
  data: {
    events: []
  }
})

var konf = new Vue({
  el: '#konf',
  data: {
    rooms: {}
  }
})

new Vue({
  el: '#activeusers',
  data: {
    users: []
  },
  methods: {
    time() {
      setInterval(() => {
        var self = this
        self.users = [];
        self.getInfo("https://jsonplaceholder.typicode.com/posts", function (request) {
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
    getInfo(addr, sucess) {
      var xhr = new XMLHttpRequest();
      if (!('withCredentials' in xhr)) xhr = new XDomainRequest();
      xhr.open('GET', addr);
      xhr.onload = sucess;
      xhr.send();
    },
  },
  mounted: function () {
    this.time();
  }
});