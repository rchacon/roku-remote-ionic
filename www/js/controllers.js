angular.module('roku.controllers', [])

.controller('DiscoverCtrl', function($scope, $ionicHistory, $state, Roku) {
  // initialize error message
  $scope.error = '';

  // initialize roku
  $scope.roku = {
    name: '',
    ipAddress: ''
  };

  // Disable submit button if `true`
  $scope.invalidRoku = function() {
    if ($scope.roku.name.length === 0) { return true; }

    if ($scope.roku.ipAddress.length === 0) { return true; }

    var re = /((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$/;
    matches = re.exec($scope.roku.ipAddress);
    if (matches === null) { return true; }

    return false;
  };

  $scope.addRoku = function(roku) {
    var knownRoku = Roku.findOne(roku.ipAddress);
    if (knownRoku) {
      $scope.error = 'This IP belongs to: ' + knownRoku.name;
      return;
    }

    success = Roku.add(roku);

    if (success) {
      $scope.error = '';
      $ionicHistory.clearCache().then(function() {
        $state.go('tab.devices', {}, { reload: true });
      });
    }
    else {
      $scope.error = 'There was an error adding your roku';
    }
  };
})

.controller('RemoteCtrl', function($scope, Roku) {
  $scope.roku = Roku.getActive();

  $scope.keypress = function(key) {
    Roku.keypress($scope.roku, key);
    console.log('Sending ' + key + ' to ' + $scope.roku.ipAddress);
  };
})

.controller('DevicesCtrl', function($scope, $ionicHistory, $state, Roku) {
  $scope.rokus = Roku.findAll().reverse();

  var activeRoku = Roku.getActive();
  if (activeRoku !== null) {
    $scope.activeIP = activeRoku.ipAddress;
  }
  else {
    $scope.activeIP = null;
  }

  $scope.deleteRoku = function(roku) {
    // Prevent user from deleting active Roku.
    if (roku.ipAddress !== $scope.activeIP) {
      console.log('Deleting: ' + roku.ipAddress);
      var success = Roku.remove(roku);
      if (success) {
        $scope.rokus = Roku.findAll().reverse();
      }
    }

  };

  $scope.activateRoku = function(roku) {
    var success = Roku.activate(roku);
    if (success) {
      console.log('Active Roku: ' + roku.ipAddress);
      $scope.activeIP = roku.ipAddress;
      $ionicHistory.clearCache().then(function() {
        $state.go('tab.remote', {}, { reload: true });
      });
    }
    else {
      console.log('You tried to activate an invalid IP: ' + roku.ipAddress);
    }
  };
});
