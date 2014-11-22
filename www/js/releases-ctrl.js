angular.module('starter.controllers')
.controller('ReleasesEntryCtrl', [
	'$scope', '$ionicModal', '$timeout', '$state', '$undoPopup', '$utils', '$toast', '$ionicPopover',
	'$stateParams', '$debounce', '$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', '$filter', 
	'$comicsData', '$settings', '$dateParser',
function($scope, $ionicModal, $timeout, $state, $undoPopup, $utils, $toast, $ionicPopover, 
	$stateParams, $debounce, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, $filter, 
	$comicsData, $settings, $dateParser) {

  //
  var today = moment().format('YYYY-MM-DD');
	//week, month
	var lblThisTime = null;
	var lblNextTime = null;
	var grpDateFormat = null;
	var funcName = null;
	var kkPref = 0; //è necessario altrimenti ci sarebbere elementi con chiave uguale anche se con gruppo diverso
		//e questo crea problemi a ionic durante l'aggiornamento della lista

	var changeGroup = function() {
		if ($scope.groupBy == 'week') { 
			lblThisTime = $filter('translate')('This week');
			lblNextTime = $filter('translate')('Next week');
			grpDateFormat = 'ddd, DD MMM YYYY';
			funcName = 'firstDayOfWeek';
			kkPref = 0;
			$scope.thisTime = moment().firstDayOfWeek().format('YYYY-MM-DD');
			$scope.nextTime = moment($scope.thisTime).add(1, 'w').format('YYYY-MM-DD');
		} else if ($scope.groupBy == 'month') {
			lblThisTime = $filter('translate')('This month');
			lblNextTime = $filter('translate')('Next month');
			grpDateFormat = 'MMMM YYYY';
			funcName = 'firstDayOfMonth';
			kkPref = 10000;
			$scope.thisTime = moment().startOf('month').format('YYYY-MM-DD');
			$scope.nextTime = moment($scope.thisTime).add(1, 'M').format('YYYY-MM-DD');
		}
		$settings.userOptions.releaseGroupBy = $scope.groupBy;
	};

  //
  var applyFilter = function() {

		//se true mostro solo wishlist (senza data) e scadute, e non acquistate
		$scope.isWishlist = ($scope.releaseView == 'wishlist');
		$scope.isPurchased = ($scope.releaseView == 'purchased');
		$scope.title = ($scope.isPurchased ? 'Purchased' : ($scope.isWishlist ? 'Losts & Wishlist' : ($scope.entry ? $scope.entry.name : 'Releases')));

		console.log($scope.isWishlist, $scope.isPurchased, $scope.title)

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

	  } else if ($scope.isPurchased) {

    	rels = _.filter(rels, function(rel) {
    		return (rel.purchased == 'T');
    	});

	    //TODO raggruppare per settimana/mese dalla settimana/mese corrente
	    //	oppure senza gruppo, dal giorno corrente
	    grps = _.groupBy(rels, function(rel) {
	    	if (rel.date) {
		    	return moment(rel.date)[funcName]().format('YYYY-MM-DD');
	    	} else {
	    		return 'zzz';
	    	}
	    });

    } else {

	    //TODO raggruppare per settimana/mese dalla settimana/mese corrente
	    //	oppure senza gruppo, dal giorno corrente
	    grps = _.groupBy(rels, function(rel) {
	    	if (rel.date) {
		    	return moment(rel.date)[funcName]().format('YYYY-MM-DD');
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
    var kk = kkPref;
    for (var ii=0; ii<grpKeys.length; ii++) {

    	var grp = grps[grpKeys[ii]];

    	if (grpKeys[ii] == 'zzz') {
    		if ($scope.entry == null && !$scope.isWishlist && !$scope.isPurchased) continue;
				items.push({ _kk: kk++, label: $filter('translate')('Wishlist'), count: grp.length });
    	} else if (grpKeys[ii] == 'lll') {
    		if (!$scope.isWishlist) continue;
				items.push({ _kk: kk++, label: $filter('translate')('Losts'), count: grp.length });
			} else if (grpKeys[ii] == $scope.thisTime) {
				items.push({ _kk: kk++, label: lblThisTime, count: grp.length });
			} else if (grpKeys[ii] == $scope.nextTime) {
				items.push({ _kk: kk++, label: lblNextTime, count: grp.length });
    	} else if ($scope.entry != null || $scope.isPurchased || grpKeys[ii] >= $scope.thisTime) {
    		items.push({ _kk: kk++, label: moment(grpKeys[ii]).format(grpDateFormat), count: grp.length });
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
	//vista: releases, losts, wishlist, purchased
	$scope.releaseView = $state.current.url.substring(1) || 'releases';
	$scope.isWishlist = false;
	$scope.isPurchased = false;
	//
	$scope.currentBar = 'title';
	//
	$scope.selectedReleases = [];
	//
	$scope.title = null;
	//
	$scope.groupBy = $settings.userOptions.releaseGroupBy || 'week';
	$scope.thisTime = null;
	$scope.nextTime = null;

  //apre te template per l'editing dell'uscita
  $scope.showAddRelease = function(item) {
  	if (!item) {
	  	var release = $scope.selectedReleases[0];
			item = $comicsData.getComicsById(release.comicsId);
		}
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
			  $undoPopup.show({title: $filter('translate')('Releases removed'),
			  								text: '<i class="icon ion-android-system-back"></i> ' + $filter('translate')('CANCEL'),  
			  								timeout: "long"}).then(function(res) {
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
	    $toast.show($filter('translate')(value == 'T' ? "Release purchased" : "Purchase canceled"));
	  } else {
	  	angular.forEach($scope.selectedReleases, function(release) {
	  		release.purchased = value;
	  	});
	  	$comicsData.save();
			$toast.show($filter('translate')(value == 'T' ? "Releases purchased" : "Purchase canceled"));
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
	$scope.menuPopover = null;
	$scope.openMenuPopover = function($event) {
		if (!$scope.menuPopover) {
		  $ionicPopover.fromTemplateUrl('menu-popover.html', {
		    scope: $scope,
		  }).then(function(popover) {
		    $scope.menuPopover = popover;
		    $scope.menuPopover.show($event);
		  });
		} else {
			$scope.menuPopover.show($event);
		}
	};
	//
	$scope.closeMenuPopover = function(groupBy, releaseView) {
		$scope.groupBy = groupBy;
		$scope.releaseView = releaseView;
		changeGroup();
		applyFilter();
		$scope.menuPopover.hide();
	};
  //
  changeGroup();
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
	$scope.$on('$destroy', function() {
		$scope.menuPopover && $scope.menuPopover.remove(); 
		$scope._deregisterBackButton && $scope._deregisterBackButton();
		$settings.save(); 
	});

}])
.directive('comicsRelease', function() {
  return {
    restrict: 'E',
    scope: {
      release: '='
    },
    controller: ['$scope', '$filter', '$comicsData', function($scope, $filter, $comicsData) {
  	  var today = moment().format('YYYY-MM-DD');
  	  $scope.datestr = _.isEmpty($scope.release.date) ? '' : moment($scope.release.date).format('ddd, DD MMM');
    	$scope.comics = $comicsData.getComicsById($scope.release.comicsId);
    	$scope.near = ($scope.release.date && $scope.release.date == today);
		  $scope.expired = ($scope.release.date && $scope.release.date <= today);

		  //console.log($scope.release.number, $scope.release.date, $scope.release.comicdId, $scope.comics.name)
    }],
    templateUrl: 'templates/comicsRelease.html'
  };
})
.controller('ReleaseEditorCtrl', [
	'$scope', '$stateParams', '$ionicNavBarDelegate', '$comicsData', '$settings',
	'$filter', '$dateParser',
function($scope, $stateParams, $ionicNavBarDelegate, $comicsData, $settings,
	$filter, $dateParser) {
  $scope.entry = $comicsData.getComicsById($stateParams.comicsId);
  //originale
  $scope.master = $comicsData.getReleaseById($scope.entry, $stateParams.releaseId);

  if ($scope.master.number == null) {
	  if ($settings.userOptions.autoFillReleaseData == 'T') {
	    var maxrel = _.max($scope.entry.releases, function(rel) { return rel.number; });
	    //console.log(maxrel);
	    if (_.isEmpty(maxrel)) {
	      $scope.master.number = 1;
	    } else if (maxrel.number > 0) {
	    	//numero +1
	      $scope.master.number = maxrel.number + 1;
	      //data uscita + periodicità
	      if (!_.isEmpty($scope.entry.periodicity) && maxrel.date) {
	      	var type = $scope.entry.periodicity.charAt(0);
	    		var amount = parseInt($scope.entry.periodicity.substr(1));
	    		$scope.master.date = moment(maxrel.date).add(amount, type).format('YYYY-MM-DD');
	      }
	    }
	  }
    //prezzo
    $scope.master.price = $scope.entry.price;
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