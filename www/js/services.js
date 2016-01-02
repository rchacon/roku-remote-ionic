angular.module('ionic.utils', [])

.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    getObjects: function(key) {
      return JSON.parse($window.localStorage[key] || '[]');
    }
  }
}]);

angular.module('roku.services', ['ionic.utils'])

.factory('Roku', function ($http, $localStorage) {
  // Support CRUD operations for object:
  // [{ipAddress: '192.168.0.5', name: 'Bedroom'}, {...}]
  // where `ipAddress` is unique
  var getIndex = function (ipAddress) {
    var rokus = findAll();
    for (var i = 0; i < rokus.length; i++) {
      if (rokus[i].ipAddress == ipAddress) {
        return i;
      }
    }
    return null;
  };

  var findAll = function() {
    return $localStorage.getObjects('roku');
  };

  var findOne = function(ipAddress) {
    var index = getIndex(ipAddress);

    if (index === null) { return null; }

    var rokus = findAll();
    return rokus[index];
  };

  return {
    keypress: function(roku, key) {
      var url = 'http://'+roku.ipAddress+':8060/keypress/'+key;
      $http.post(url);
    },
    activate: function (roku) {
      if (findOne(roku.ipAddress) === null) { return false; }

      $localStorage.set('active', roku.ipAddress);
      return true;
    },
    getActive: function () {
      ipAddress = $localStorage.get('active', 'none');

      if (ipAddress === 'none') { return null; }

      return findOne(ipAddress);
    },
    findAll: findAll,
    findOne: findOne,
    remove: function (roku) {
      var index = getIndex(roku.ipAddress);

      if (index === null) { return false; }

      var rokus = findAll();
      rokus.splice(index, 1);
      // update data store
      $localStorage.setObject('roku', rokus);
      return true;
    },
    update: function(roku) {
      var index = getIndex(roku.ipAddress);

      if (index === null) { return false; }

      var rokus = findAll();
      rokus[index].name = roku.name;
      // update data store
      $localStorage.setObject('roku', rokus);
      return true;
    },
    add: function(roku) {
      var knownRoku = findOne(roku.ipAddress);
      if (knownRoku !== null) { return false; }

      var rokus = findAll();
      rokus.push(roku);
      // update data store
      $localStorage.setObject('roku', rokus);
      return true;
    }
  };
});
