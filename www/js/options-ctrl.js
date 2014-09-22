angular.module('starter.controllers')
.controller('OptionsCtrl', [
	'$scope', '$q', '$datex', '$ionicPopup', '$undoPopup', '$toast', '$ionicPopover', '$ionicModal', 
  '$file', '$timeout', '$filter', 
  '$comicsData', '$settings', '$ionicNavBarDelegate', '$translate',
function($scope, $q, $datex, $ionicPopup, $undoPopup, $toast, $ionicPopover, $ionicModal, 
  $file, $timeout, $filter, 
  $comicsData, $settings, $ionicNavBarDelegate, $translate) {
  //
  $scope.version = null;
  $scope.lastBackup = 'not found';
  $scope.currentUser = $comicsData.uid;
  //
  if (window.cordova) {
    window.cordova.getAppVersion(function (version) {
      $scope.version = version;
    });
  }

  //
  $scope.userOptions = $settings.userOptions;
  //console.log($scope.userOptions)
  $scope.optionsChanged = function() {
    $datex.weekStartMonday = $scope.userOptions.weekStartMonday == 'T';
    $settings.save();    
  };
  //
  $scope.chooseWeekStart = function() {
    $scope.weekStartPopup = $ionicPopup.show({
      templateUrl: 'weekStartMonday.html',
      scope: $scope,
      buttons: [{
        text: $filter('translate')('Cancel'),
        type: 'button-default',
        onTap: function(e) { return false; }
      }]
    });
    $scope.weekStartPopup.then(function(res) {
      if (res) {
        $scope.optionsChanged();
      }
    });
  };
  //
  $scope.chooseDefaultUrl = function() {
    $scope.defaultUrlPopup = $ionicPopup.show({
      templateUrl: 'defaultUrl.html',
      scope: $scope,
      buttons: [{
        text: $filter('translate')('Cancel'),
        type: 'button-default',
        onTap: function(e) { return false; }
      }]
    });
    $scope.defaultUrlPopup.then(function(res) {
      if (res) {
        $scope.optionsChanged();
      }
    });
  };
  //
  $scope.resetOptions = function() {
    $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Reset to default Settings?'
    }).then(function(res) {
      if (res) {
        $settings.loadDefault();
        $settings.save();
        $scope.userOptions = $settings.userOptions;
        $toast.show("Settings reset to default");
      }
    });
  };
  //
  $scope.deleteAllData = function() {
    $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Delete all data?'
    }).then(function(res) {
      if (res) {
        $comicsData.clear();
        $comicsData.save();
        $toast.show("Data deleted");
      }
    });
  };
  //
  $scope.repairData = function() {
    $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Repair data?'
    }).then(function(res) {
      if (res) {
        $comicsData.repairData();
        $comicsData.save();
        $comicsData.read($comicsData.uid, true);
        $toast.show("Data repaired");
      }
    });
  };
  //
  $scope.readLastBackup = function() {
    if (window.cordova) {
      $comicsData.getLastBackup().then(function(result) {
        $scope.lastBackup = $filter('date')(result.modificationTime, 'medium');
      }, function(error) {
        console.log('readLastBackup ' + JSON.stringify(error));
        $scope.lastBackup = 'not found';
      });
    }
  };
  //
  $scope.backup = function() {
    $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Backup data? Previous backup will be overridden.'
    }).then(function(res) {
      if (res) {
        $comicsData.backupDataToFile().then(function(res) {
          $scope.readLastBackup();
          $toast.show("Backup complete");
        }, function(error) {
          $toast.show("Write error " + error.code);
        });
      }
    });
  };
  //
  $scope.restore = function() {
    $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Restore data from backup? Current data will be overridden.'
    }).then(function(res) {
      if (res) {
        $comicsData.restoreDataFromFile().then(function(res) {
          $toast.show("Restore complete");
        }, function(error) {
          $toast.show("Read error " + error.code);
        });
      }
    });
  };
  //
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  //
  $scope.readLastBackup();

  //DEBUG
  //
  $scope.fakeEntries = function() {
    // $comicsData.update( $comicsData.newComics( { id: "new", name: "One Piece", publisher: "Star Comics" } ) );
    // $comicsData.update( $comicsData.newComics( { id: "new", name: "Naruto", publisher: "Planet Manga" } ) );
    // $comicsData.update( $comicsData.newComics( { id: "new", name: "Dragonero", publisher: "Bonelli" } ) );
    // $comicsData.update( $comicsData.newComics( { id: "new", name: "Gli incredibili X-Men", publisher: "Marvel Italia" } ) );
    var dd = new Date();
    for (var ii=1; ii<=100; ii++) {
      var cc = $comicsData.newComics( { id: "new", name: "Comics " + ii, publisher: "Fake" } );
      $comicsData.update(cc);
      var rr = $comicsData.newRelease( { comicsId: cc.id, number: 1, date: $filter('date')(dd, 'yyyy-MM-dd') } );
      $comicsData.updateRelease(cc, rr);

      dd.setDate(dd.getDate() + 1);
    }
    $comicsData.save();
    $toast.show($comicsData.comics.length + " fake comics created");
  };
  //
  $scope.switchUser = function() {
    if ($comicsData.uid == "USER")
      $comicsData.read("DEBUG");
    else
      $comicsData.read("USER");
    $scope.currentUser = $comicsData.uid;
    $scope.readLastBackup();
    $toast.show("Hello " + $scope.currentUser);
  };
  // //TEST POPOVER MENU
  // $ionicPopover.fromTemplateUrl('my-popover.html', {
  //   scope: $scope,
  // }).then(function(popover) {
  //   $scope.popover = popover;
  // });
  // $scope.openPopover = function($event) {
  //   $scope.popover.show($event);
  // };  
  //
  $scope.test = function($event) {

    // $scope.openPopover($event)

    // try {
      console.log("TR" +
         $filter('translate')('COMICS_TITLE'));

    // } catch (e) {
    //   console.log("TEST ERR" + e);
    // }
  };
}]);