angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $datex, $settings, $comicsData) {
  //
  $settings.load();
  $datex.weekStartMonday = $settings.userOptions.weekStartMonday == 'T';
  //leggo l'elenco dei fumetti (per utente USER)
  $comicsData.read("USER");
})

.directive('buttonHref', function($location) {
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      elem.bind('click', function() {
        $location.path(attr.buttonHref).replace();
        scope.$apply();
      });
    }
  };
})

.controller('ComicsEditorCtrl', function($scope, $stateParams, $ionicNavBarDelegate, $comicsData) {
  //console.log($stateParams, $comicsData)
  $scope.periodicities = PERIODICITIES;
  //originale
  $scope.master = $comicsData.getComicsById($stateParams.comicsId);
  //aggiorno l'originale e torno indietro
  $scope.update = function(entry) {
    angular.copy(entry, $scope.master);
    $comicsData.update($scope.master);
    $comicsData.save();
    $ionicNavBarDelegate.back();
  };
  $scope.reset = function() {
    $scope.entry = angular.copy($scope.master);
  };
  $scope.cancel = function() {
    $ionicNavBarDelegate.back();
  };
  $scope.isUnique = function(entry) {
    return $comicsData.normalizeComicsName($scope.master.name) == $comicsData.normalizeComicsName(entry.name) || 
      $comicsData.isComicsUnique(entry);
  };
  $scope.reset();
})

//see releases-ctrl.js
// .controller('ReleasesEntryCtrl', function($scope, $stateParams, $location, $filter, $datex, $toast, $undoPopup, $timeout, $comicsData, $settings) {
//   $scope.entry = null;
//   $scope.releases = [];
//   $scope.purchasedVisible = $settings.filters.releases.purchasedVisible;
//   $scope.period = $settings.filters.releases.period; //week, month, everytime

//   //apre te template per l'editing dell'uscita
//   $scope.showAddRelease = function(item) {
//     $location.path("/app/release/" + item.id + "/new").replace();
//   };
//   //
//   $scope.removeRelease = function(rel) {
//     $comicsData.removeRelease(rel.entry, rel.release);
//     $comicsData.save();
//     //console.log("remove ", rel.index, $scope.releases)
//     $scope.releases.splice(rel.index, 1);

//     $timeout(function() {
//       $undoPopup.show({title: "Release removed", timeout: "long"}).then(function(res) {
//         if (res == 'ok') {
//           $comicsData.undoRemoveRelease();
//           $comicsData.save();
//           $scope.changeFilter($scope.purchasedVisible, $scope.period);
//         }
//       });
//     }, 250);
//   };
//   //
//   $scope.setPurchased = function(rel, value) {
//     rel.release.purchased = value;
//     $comicsData.save();

//     $toast.show(value == 'T' ? "Release purchased" : "Purchase canceled");
//   };
//   //
//   $scope.changeFilter = function(purchasedVisible, period) {
//     $scope.purchasedVisible = $settings.filters.releases.purchasedVisible = purchasedVisible;
//     $scope.period = $settings.filters.releases.period = period;
//     $scope.filterInfo = "";

//     var arr;
//     if ($stateParams.comicsId == null) {
//       arr = $comicsData.comics;
//     } else {
//       //uscite di un fumetto
//       $scope.entry = $comicsData.getComicsById($stateParams.comicsId);
//       arr = [ $scope.entry ];
//     }

//     //calcolo il range delle date in base a period
//     var dtFrom, dtTo;
//     var today = new Date();
//     var toastMsg, toastMsgEmpty;
//     if (period == 'week') {
//       dtFrom = $filter('date')($datex.firstDayOfWeek(today), 'yyyy-MM-dd');
//       dtTo = $filter('date')($datex.lastDayOfWeek(today), 'yyyy-MM-dd');
//       toastMsg = "This Week's Releases";
//       toastMsgEmpty = "No releases this week";
//     } else if (period == 'month') {
//       dtFrom = $filter('date')($datex.firstDayOfMonth(today), 'yyyy-MM-dd');
//       dtTo = $filter('date')($datex.lastDayOfMonth(today), 'yyyy-MM-dd');
//       toastMsg = "This Month's Releases";
//       toastMsgEmpty = "No releases this month";
//     } else {
//       toastMsg = "All releases";
//       toastMsgEmpty = "No releases";
//     }

//     var tot = 0;
//     $scope.releases = [];
//     for (var ii=0; ii<arr.length; ii++) {
//       tot += arr[ii].releases.length;
//       angular.forEach(arr[ii].releases, function(v, k) {
//         //console.log(arr[ii].name, v.date, dtFrom, dtTo)

//         if ($scope.purchasedVisible || v.purchased != 'T') {
//           if (!dtFrom || v.date >= dtFrom) {
//             if (!dtTo || v.date <= dtTo) {
//               $scope.releases.push( { entry: arr[ii], release: v, index: k } );
//             }
//           }
//         }
//       });
//     }

//     $scope.filterInfo = _.str.sprintf("%s results out of %s", $scope.releases.length, tot);

//     // if ($scope.releases.length > 0)
//     //   $toast.show(toastMsg);
//     // else
//     //   $toast.show(toastMsgEmpty);
//   };
//   //
//   var today = $filter('date')(new Date(), 'yyyy-MM-dd');
//   $scope.isExpired = function(release) {
//     return release.date && release.date < today;
//   }

//   $scope.changeFilter($scope.purchasedVisible, $scope.period);
// })
.controller('ReleaseEditorCtrl', function($scope, $stateParams, $ionicNavBarDelegate, $comicsData, $settings) {
  $scope.entry = $comicsData.getComicsById($stateParams.comicsId);
  //originale
  $scope.master = $comicsData.getReleaseById($scope.entry, $stateParams.releaseId);

  if ($settings.userOptions.autoFillReleaseNumber == 'T' && $scope.master.number == null) {
    var maxrel = _.max($scope.entry.releases, function(rel) { return rel.number; });
    //console.log(maxrel);
    if (_.isEmpty(maxrel)) {
      $scope.master.number = 1;
    } else if (maxrel.number > 0) {
      $scope.master.number = maxrel.number + 1;
    }
  }

  //aggiorno l'originale e torno indietro
  $scope.update = function(release) {

    //TODO eliminare eventuali notifiche create in precedenza
    //  con comicsId + number (master)

    //TODO se !purchased e !expired creare notifica locale
    // con comicsId + number (release)

    angular.copy(release, $scope.master);
    $comicsData.updateRelease($scope.entry, $scope.master);
    $comicsData.save();
    $ionicNavBarDelegate.back();
  };
  $scope.reset = function() {
    $scope.release = angular.copy($scope.master);
  };
  $scope.cancel = function() {
    $ionicNavBarDelegate.back();
  };
  $scope.isUnique = function(release) {
    return $stateParams.releaseId == release.number || $comicsData.isReleaseUnique($scope.entry, release);
  };
  $scope.reset();
})

.controller('OptionsCtrl', function($scope, $q, $datex, $ionicPopup, $undoPopup, $toast, $ionicPopover, $ionicModal, 
  $cordovaDevice, $cordovaFile, $cordovaToast, $file, $cordovaLocalNotification, $timeout, $filter, $comicsData, $settings) {
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
})
;
