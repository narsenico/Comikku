angular.module('starter.controllers')
.controller('ReleasesEntryCtrl', [
	'$scope', '$ionicModal', '$timeout', '$state', '$undoPopup', '$utils', '$datex', '$toast', '$stateParams', 
	'$debounce', '$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', '$filter', '$comicsData', '$settings', 
	'$dateParser',
function($scope, $ionicModal, $timeout, $state, $undoPopup, $utils, $datex, $toast, $stateParams, 
	$debounce, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, $filter, $comicsData, $settings,
	$dateParser) {

  //
  var today = $filter('date')(new Date(), 'yyyy-MM-dd');	
  //
  var applyFilter = function() {
  	//console.log(new Date().getTime() + " applyFilter")
    var items = [];

    //estraggo tutt le releases
    var rels = $comicsData.getReleases($stateParams.comicsId == null ? null : 
    	[$scope.entry]);
    var grps;

    if ($scope.isWishlist) {

    	rels = _.filter(rels, function(rel) {
    		return (rel.purchased != 'T' && (!rel.date || rel.date < today));
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
    //aggiungo una chiave _kk sequenziale ad ogni elemento (sia intestazione gruppo che release) per renderlo
    //	univoco. usato come track da ngRepeat  
    var kk = 0;
    for (var ii=0; ii<grpKeys.length; ii++) {
    	//console.log(grpKeys[ii], $scope.thisWeek, grpKeys[ii] >= $scope.thisWeek)

    	var grp = grps[grpKeys[ii]];

    	if (grpKeys[ii] == 'zzz') {
    		if ($scope.entry == null && !$scope.isWishlist) continue;
				items.push({ _kk: kk++, label: 'Wish list', count: grp.length });
    	} else if (grpKeys[ii] == 'lll') {
    		if (!$scope.isWishlist) continue;
				items.push({ _kk: kk++, label: 'Losts', count: grp.length });
			} else if (grpKeys[ii] == $scope.thisWeek) {
				items.push({ _kk: kk++, label: 'This week', count: grp.length });
			} else if (grpKeys[ii] == $scope.nextWeek) {
				items.push({ _kk: kk++, label: 'Next week', count: grp.length });
    	} else if ($scope.entry != null || grpKeys[ii] >= $scope.thisWeek) {
    		items.push({ _kk: kk++, label: $filter('date')(grpKeys[ii], 'EEE, dd MMM'), count: grp.length });
    	} else {
    		continue;
    	}

    	$utils.arrayAddRange(items, _.each(grp, function(rel) { rel._kk = kk++; }));
    }

    $scope.items = items;
  };

	//comics selezionato (se arrivo dal menu laterale, sarà sempre null)
  $scope.entry = $stateParams.comicsId == null ? null : ($scope.entry = $comicsData.getComicsById($stateParams.comicsId));
	//
	$scope.debugMode = $settings.userOptions.debugMode == 'T';
	//se true mostro solo wishlist (senza data) e scadute, e non acquistate
	$scope.isWishlist = $state.is('app.wishlist');
	//
	$scope.currentBar = 'title';
	//
  $scope.releases = [];
	//
	$scope.selectedReleases = [];
	//
	$scope.thisWeek = $datex.firstDayOfWeek().getTime();
	$scope.nextWeek = $datex.addDays($datex.firstDayOfWeek(), 7).getTime();

  //apre te template per l'editing dell'uscita
  $scope.showAddRelease = function(item) {
    $state.go('app.release_editor', {comicsId: item.id, releaseId: 'new'});
  };
  //
  $scope.editReleaseEntry = function(release) {
  	release = release || $scope.selectedReleases[0];
		var cid = $comicsData.getComicsById(release.comicsId).id;
		$state.go('app.release_editor', {comicsId: cid, releaseId: release.number});
  };
  //
  $scope.removeReleaseEntry = function() {
  	//console.log($scope.selectedReleases)
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
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  //
  applyFilter();
	
	//gestisco il back hw in base a quello che sto facendo
	$scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() {
		if ($scope.currentBar == 'options') {
			$scope.showHeaderBar();
			$scope.$apply(); //altrimenti non vengono aggiornati
		} else if ($scope.entry) {
			$ionicNavBarDelegate.back();
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
})
.controller('ReleaseEditorCtrl', [
	'$scope', '$stateParams', '$ionicNavBarDelegate', '$comicsData', '$settings',
function($scope, $stateParams, $ionicNavBarDelegate, $comicsData, $settings) {
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
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  $scope.reset();
}]);