angular.module('starter.controllers')
.controller('ReleasesEntryCtrl', [
	'$scope', '$ionicModal', '$timeout', '$location', '$undoPopup', '$utils', '$datex', '$toast', '$stateParams', 
	'$debounce', '$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', '$filter', '$comicsData', '$settings', 
	'$dateParser',
function($scope, $ionicModal, $timeout, $location, $undoPopup, $utils, $datex, $toast, $stateParams, 
	$debounce, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, $filter, $comicsData, $settings,
	$dateParser) {

	//se true mostro solo wishlist (senza data) e scadute, e non acquistate
	var isWishlist = ($location.url() == '/app/wishlist');
  //
  var applyFilter = function() {
    var items = [];

    //estraggo tutt le releases
    var rels = $comicsData.getReleases($stateParams.comicsId == null ? null : 
    	[$scope.entry]);
    var grps;

    if (isWishlist) {
    	rels = _.filter(rels, function(rel) {
    		return (rel.purchased != 'T' && (!rel.date || $scope.isExpired(rel)));
    	});

	    grps = _.groupBy(rels, function(rel) {
	    	if (rel.date) {
		    	return  'lll';
	    	} else {
	    		return 'zzz';
	    	}
	    });

    } else {

	    //TODO raggruppare per settimana/mese dalla settimana/mese corrente
	    //	oppure senza gruppo, dal giorno corrente
	    grps = _.groupBy(rels, function(rel) {
	    	if (rel.date) {
		    	return  $datex.firstDayOfWeek($dateParser(rel.date, 'yyyy-MM-dd')).getTime();
	    	} else {
	    		return 'zzz';
	    	}
	    });
  	}

    //creo un array che contiene sia le intestazioni del gruppo che i dati per non essere costretto
    //	ad utilzzare ng-repeat innestati
    var grpKeys = _.keys(grps).sort();
    for (var ii=0; ii<grpKeys.length; ii++) {
    	//console.log(grpKeys[ii], $scope.thisWeek, grpKeys[ii] >= $scope.thisWeek)

    	if (grpKeys[ii] == 'zzz') {
    		if ($scope.entry == null && !isWishlist) continue;
				items.push({ label: 'Wish list' });
    	} else if (grpKeys[ii] == 'lll') {
    		if (!isWishlist) continue;
				items.push({ label: 'Losts' });
			} else if (grpKeys[ii] == $scope.thisWeek) {
				items.push({ label: 'This week' });
			} else if (grpKeys[ii] == $scope.nextWeek) {
				items.push({ label: 'Next week' });
    	} else if ($scope.entry != null || grpKeys[ii] >= $scope.thisWeek) {
    		items.push({ label: $filter('date')(grpKeys[ii], 'EEE, dd MMM') });
    	} else {
    		continue;
    	}

    	//console.log("***", grpKeys);

    	var grp = grps[grpKeys[ii]];
    	$utils.arrayAddRange(items, grp);
    }

    $scope.items = items;
  };
  //
  var today = $filter('date')(new Date(), 'yyyy-MM-dd');

	//comics selezionato (se arrivo dal menu laterale, sarà sempre null)
  $scope.entry = $stateParams.comicsId == null ? null : ($scope.entry = $comicsData.getComicsById($stateParams.comicsId));
	//
	$scope.debugMode = $settings.userOptions.debugMode == 'T';
	//
	$scope.currentBar = 'title';
	//
  $scope.releases = [];
	//
	$scope.selectedReleases = [];
	//
	$scope.thisWeek = $datex.firstDayOfWeek().getTime();
	$scope.nextWeek = $datex.addDays($datex.firstDayOfWeek(), 7).getTime();
	//
	$scope.title = isWishlist ? "Losts & Wish list" : ($scope.entry == null ? 'Releases' : $scope.entry.name);
	console.log(isWishlist, $scope.entry == null, $scope.title)

  //apre te template per l'editing dell'uscita
  $scope.showAddRelease = function(item) {
    $location.path("/app/release/" + item.id + "/new").replace();
  };
  //
  $scope.editReleaseEntry = function(release) {
  	release = release || $scope.selectedReleases[0];
		var cid = $comicsData.getComicsById(release.comicsId).id;
		$location.path("/app/release/" + cid + "/" + release.number).replace();
  };
  //
  $scope.removeReleaseEntry = function() {
  	console.log($scope.selectedReleases)
		if (!_.isEmpty($scope.selectedReleases)) {
			$comicsData.removeReleases($scope.selectedReleases);
			$comicsData.save();
			$scope.selectedReleases = [];
			$scope.canEdit = false;
			applyFilter();

			$timeout(function() {
			  $undoPopup.show({title: "Releases removed", timeout: "long"}).then(function(res) {
			    if (res == 'ok') {
			      $scope.selectedReleases = $comicsData.undoRemoveReleases() || [];
			      $scope.canEdit = ($scope.selectedReleases.length == 1);
			      $comicsData.save();
			      applyFilter();
			    }
			  });
			}, 250);
		}
  };
  //
  $scope.setPurchased = function(release, value) {
  	if (release) {
	    release.purchased = value;
	    $comicsData.save();
	    $toast.show(value == 'T' ? "Release purchased" : "Purchase canceled");
	  } else {
	  	angular.forEach($scope.selectedReleases, function(release) {
	  		release.purchased = value;
	  	});
	  	$comicsData.save();
			$toast.show(value == 'T' ? "Releases purchased" : "Purchase canceled");
	  }
  };
  //
  $scope.getComicsById = function(comicsId) {
  	return $comicsData.getComicsById(comicsId);
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
			$scope.setPurchased(release, release.purchased == 'T' ? 'F' : 'T');
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
			// $scope._deregisterBackButton && $scope._deregisterBackButton();
  	// 	$scope._deregisterBackButton = null;
		} else {
			$scope.canEdit = ($scope.selectedReleases.length == 1);
			if ($scope.currentBar != 'options') {
				$scope.currentBar = 'options';
				// $scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() { 
				// 	$scope.showHeaderBar();
				// 	$scope.$apply(); //altrimenti non vengono aggiornati 
				// 	$scope._deregisterBackButton && $scope._deregisterBackButton();
	   //  		$scope._deregisterBackButton = null;
				// }, 100);
			}
		}
	}
	//
	$scope.isSelected = function(release) {
		return $utils.indexFindWhere($scope.selectedReleases, {comicsId: release.comicsId, number: release.number}) >= 0;
	};
  //
  $scope.isExpired = function(release) {
    return release.date && release.date <= today;
  }
  //
  applyFilter();
	//aspetto un attimo prima di nascondere la barra originale altrimenti non funziona
	$timeout(function() { $ionicNavBarDelegate.showBar(false); }, 250);
	
	//gestisco il back hw in base a quello che sto facendo
	$scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() {
		if ($scope.currentBar == 'options') {
			$scope.showHeaderBar();
			$scope.$apply(); //altrimenti non vengono aggiornati 
		} else {
			navigator.app.exitApp();
		}
	}, 100);
	//deregistro l'evento sul back all'uscita
	$scope.$on('$destroy', function() { $scope._deregisterBackButton && $scope._deregisterBackButton(); });

}])
.directive('comicsRelease', function() {
  return {
    restrict: 'E',
    scope: {
      release: '='
    },
    controller: ['$scope', '$filter', '$comicsData', function($scope, $filter, $comicsData) {
  	  var today = $filter('date')(new Date(), 'yyyy-MM-dd');
    	$scope.comics = $comicsData.getComicsById($scope.release.comicsId);
    	$scope.near = ($scope.release.date && $scope.release.date == today);
		  $scope.expired = ($scope.release.date && $scope.release.date <= today);
    }],
    templateUrl: 'templates/comicsRelease.html'
  };
});