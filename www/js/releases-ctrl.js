angular.module('starter.controllers')
.controller('ReleasesEntryCtrl', [
	'$scope', '$ionicModal', '$timeout', '$location', '$undoPopup', '$utils', '$datex', '$toast', '$stateParams', 
	'$debounce', '$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', '$filter', '$comicsData', '$settings', 
	'$dateParser',
function($scope, $ionicModal, $timeout, $location, $undoPopup, $utils, $datex, $toast, $stateParams, 
	$debounce, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, $filter, $comicsData, $settings,
	$dateParser) {

	//comics selezionato (se arrivo dal menu laterale, sarà sempre null)
  $scope.entry = null;
  //filtri
  $scope.purchasedVisible = $settings.filters.releases.purchasedVisible;
  $scope.period = $settings.filters.releases.period; //week, month, everytime
	//
	$scope.debugMode = $settings.userOptions.debugMode == 'T';
	//
	$scope.currentBar = 'title';
	//
  $scope.releases = [];
	//
	$scope.selectedReleases = [];

  //apre te template per l'editing dell'uscita
  $scope.showAddRelease = function(item) {
    $location.path("/app/release/" + item.id + "/new").replace();
  };
  //
  $scope.removeReleaseEntry = function(rel) {
  	//TODO gestire cancellazione multipla
    // $comicsData.removeRelease(rel.entry, rel.release);
    // $comicsData.save();
    // //console.log("remove ", rel.index, $scope.releases)
    // $scope.releases.splice(rel.index, 1);

    // $timeout(function() {
    //   $undoPopup.show({title: "Release removed", timeout: "long"}).then(function(res) {
    //     if (res == 'ok') {
    //       $comicsData.undoRemoveRelease();
    //       $comicsData.save();
    //       $scope.changeFilter($scope.purchasedVisible, $scope.period);
    //     }
    //   });
    // }, 250);
  };
  //
  $scope.setPurchased = function(release, value) {
    release.purchased = value;
    $comicsData.save();

    $toast.show(value == 'T' ? "Release purchased" : "Purchase canceled");
  };
  //
  $scope.getComicsById = function(comicsId) {
  	return $comicsData.getComicsById(comicsId);
  };
  //
  $scope.changeFilter = function(purchasedVisible, period) {
    $scope.purchasedVisible = $settings.filters.releases.purchasedVisible = purchasedVisible;
    $scope.period = $settings.filters.releases.period = period;
    $scope.filterInfo = "";

    //estraggo tutt le releases
    var rels = $comicsData.getReleases($stateParams.comicsId == null ? null : 
    	[($scope.entry = $comicsData.getComicsById($stateParams.comicsId))]);

    //TODO raggruppare per period
    var grps = _.groupBy(rels, function(rel) {
    	if (rel.date) {
	    	return $datex.firstDayOfWeek($dateParser(rel.date, 'yyyy-MM-dd'));
    	} else {
    		return $datex.getMax();
    	}
    });

    $scope.groups = grps;
  };
	//
	$scope.showHeaderBar = function() {
		$scope.selectedReleases = [];
		$scope.currentBar = 'title'
	};
	//
	$scope.clickRelease = function(release) {
		if ($scope.currentBar == 'options') {
			$scope.selectRelease(release);
		} else {
			//TODO $location.path("/app/releases/" + item.id).replace();
		}
	};
	//
	$scope.selectRelease = function(release) {
		//cerco l'indice dell'elemento selezionato
		var idx = $utils.indexFindWhere($scope.selectedReleases, {comicsId: release.comicsId, number: release.number});

		//se è già selezionato lo rimuovo
		if (idx >= 0) {
			$scope.selectedReleases.splice(idx, 1);
		} else {
			$scope.selectedReleases.push(release);
		}

		//nascondo la barra di navigazione (e mostro quella delle opzioni) se c'è almeno un elemento selezionato
		if ($scope.selectedReleases.length == 0) {
	    $scope.showHeaderBar();
			$scope._deregisterBackButton && $scope._deregisterBackButton();
  		$scope._deregisterBackButton = null;
		} else {
			$scope.canEdit = ($scope.selectedReleases.length == 1);
			if ($scope.currentBar != 'options') {
				$scope.currentBar = 'options';
				$scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() { 
					$scope.showHeaderBar();
					$scope.$apply(); //altrimenti non vengono aggiornati 
					$scope._deregisterBackButton && $scope._deregisterBackButton();
	    		$scope._deregisterBackButton = null;
				}, 100);}
		}
	}
	//
	$scope.isSelected = function(release) {
		return $utils.indexFindWhere($scope.selectedReleases, {comicsId: release.comicsId, number: release.number}) >= 0;
	};

  //
  var today = $filter('date')(new Date(), 'yyyy-MM-dd');
  $scope.isExpired = function(release) {
    return release.date && release.date < today;
  }
  //
  $scope.changeFilter($scope.purchasedVisible, $scope.period);
	//aspetto un attimo prima di nascondere la barra originale altrimenti non funziona
	$timeout(function() { $ionicNavBarDelegate.showBar(false); }, 250);
	//deregistro l'evento sul back all'uscita
	$scope.$on('$destroy', function() { $scope._deregisterBackButton && $scope._deregisterBackButton(); });

}]);