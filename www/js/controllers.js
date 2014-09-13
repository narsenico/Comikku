angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $datex, $settings, $comicsData) {
  //
  $settings.load();
  $datex.weekStartMonday = $settings.userOptions.weekStartMonday == 'T';
  //leggo l'elenco dei fumetti (per utente USER)
  $comicsData.read("USER");
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
  //
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  $scope.reset();
})

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
;
