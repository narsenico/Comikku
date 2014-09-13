angular.module('starter.controllers')
.controller('OptionsCtrl', [
	'$scope', '$q', '$datex', '$ionicPopup', '$undoPopup', '$toast', '$ionicPopover', '$ionicModal', 
  '$cordovaDevice', '$cordovaFile', '$cordovaToast', '$file', '$cordovaLocalNotification', '$timeout', '$filter', 
  '$comicsData', '$settings',
function($scope, $q, $datex, $ionicPopup, $undoPopup, $toast, $ionicPopover, $ionicModal, 
  $cordovaDevice, $cordovaFile, $cordovaToast, $file, $cordovaLocalNotification, $timeout, $filter, 
  $comicsData, $settings) {
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
      title: 'Week starting day',
      templateUrl: 'weekStartMonday.html',
      scope: $scope,
      buttons: [{
        text: 'Cancel',
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
      title: 'App starts with',
      templateUrl: 'defaultUrl.html',
      scope: $scope,
      buttons: [{
        text: 'Cancel',
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
  //
  $scope.test = function($event) {

    // window.plugin.notification.local.add(
    //   { id: 't001', message: 'test message', title: 'test title' }
    // , function() { console.log("add ", arguments) } );

    // $ionicPopup.alert({
    //   title: 'Test',
    //   template: window.localStorage.getItem('USER_comics')
    // });

    // $undoPopup.show({title: "Comics delted", timeout: 0}).then(function(res) {
    //   console.log(res)
    // });

    //$toast.show("This week");

    //$ionicPopover.fromTemplate('<ion-popover-view><ion-header-bar><h1 class="title">My Popover Title</h1></ion-header-bar><ion-content>content</ion-content></ion-popover-view>', { scope: $scope }).show($event);
    try {
      // $comicsData.backupDataToFile().then(function(result) {
      //     console.log("bck res " + result);
      //     $scope.testresult = result;
      // }, function(err) {
      //     console.log("bck err " + err);
      //     $scope.testresult = err;
      // });

      // $comicsData.getLastBackup().then(function(result) {
      //     console.log("bck res " + result);
      //     $scope.testresult = result;
      // }, function(err) {
      //     console.log("bck err " + err);
      //     $scope.testresult = err;
      // });

      //$cordovaToast.showShortBottom("test me");

      // $file.readFileMetadata("backup.json").then(
      //   function(metadata) {
      //     console.log("rmd ok " + JSON.stringify(metadata));
      //     $file.readFileAsText("backup.json").then(
      //       function(result) {
      //         console.log("text " + result);
      //       },
      //       function(error) {
      //         console.log("read err " + error.code);
      //       }
      //     );
      //   },
      //   function(error) {
      //     console.log("rmd err" + error.code);
      //   }
      // );

      // $file.writeFile("test.json", "prova prova\nciao\n.").then(
      //   function(result) {
      //     console.log("wrt " + result);
      //   },
      //   function(error) {
      //     console.log("wrt err" + error.code);
      //   }
      // );

      //$comicsData.addNotification("2014-08-30");

      // var q = $q.defer();
      // $timeout(function() { q.resolve(true) }, 2000);
      // $q.allSettled(q).then(function(res) {console.log(res);});
      // console.log("sett");

    } catch (e) {
      console.log("TEST ERR" + e);
    }
  };
}]);