angular.module('starter.controllers')
.controller('ComicsCtrl', [
	'$scope', '$ionicModal', '$timeout', '$state', '$undoPopup', '$utils', '$debounce', '$toast', 
	'$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', '$comicsData', '$settings',
function($scope, $ionicModal, $timeout, $state, $undoPopup, $utils, $debounce, $toast,
	$ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, $comicsData, $settings) {
	var orderBy = $settings.userOptions.comicsOrderBy || 'name';
	var orderByDesc = $settings.userOptions.comicsOrderByDesc == 'T';
	//recupero i dati già ordinati
	var orderedComics = $comicsData.getComics(orderBy, orderByDesc);
	//conterrà i dati filtrati (tramite campo di ricerca)
	var filteredComics = orderedComics;
	//indcia quanti dati caricare alla volta tramite infinite scroll
	var loadChunk = 20;
	//funzione di filtraggio dei dati (su orderedComics)
	var applyFilter = function() {
		//console.log("applyFilter");

		if (_.isEmpty($scope.search)) {
			filteredComics = orderedComics;
		} else {
			filteredComics = orderedComics.filter(function(item) {
	      var bOk = false;
	      if ($settings.userOptions.comicsSearchPublisher == 'T') {
	        bOk = !$scope.search || _.str.include(_.str.clean(item.publisher).toLowerCase(), _.str.clean($scope.search).toLowerCase());   
	      }
	      return bOk || (!$scope.search || _.str.include(_.str.clean(item.name).toLowerCase(), _.str.clean($scope.search).toLowerCase()));				
			});
		}
		$scope.comics = [];
		$scope.totComics = filteredComics.length;
		$scope.loadMore();
		$ionicScrollDelegate.scrollTop();
	};
	//
	$scope.debugMode = $settings.userOptions.debugMode == 'T';
	//
	$scope.currentBar = 'title';
	//conterrà i comics caricati poco alla volta tramite infirnite scroll
	$scope.comics = [];
	//
	$scope.totComics = filteredComics.length;
	//
	$scope.selectedComics = [];
	//indica è possibile editare l'elemento selezionato
	$scope.canEdit = false;
	//campo di ricerca
	$scope.search = "";
	//
	$scope.$watch('search', function(newValue, oldValue) {
		if (newValue === oldValue) { return; }
		$debounce(applyFilter, 300); //chiamo applyFilter solo se non viene modificato search per 300ms
	});
	//pulisco filtro
	$scope.clearSearch = function() {
		$scope.search = "";
		applyFilter();
	};
	//
	$scope.$on('stateChangeSuccess', function() {
		$scope.loadMore();
	});
	//carico altri dati (da filteredComics)
	$scope.loadMore = function() {
		//console.log("loadMore");
		
		var from = $scope.comics.length;
		var max = Math.min(from + loadChunk, filteredComics.length);
		if (from < max) {
			$scope.comics = _.union($scope.comics, filteredComics.slice(from, max));
		}
		$scope.$broadcast('scroll.infiniteScrollComplete');
	};
	//
	$scope.moreDataCanBeLoaded = function() {
		return $scope.comics.length < filteredComics.length;
	};
	//
	$scope.getComicsInfo = function(item) {
    if (_.str.isBlank(item.series))
      return item.notes;
    else if (_.str.isBlank(item.notes))
      return item.series
    else
      return item.series + " - " + item.notes;
	};
	//
	$scope.changeOrder = function() {

		if (orderBy == 'bestRelease') {
			orderBy = 'name';
			orderByDesc = false;
			$toast.show("Order by name");
		} else if (orderBy == 'name') {
		// 	orderBy = 'lastUpdate';
		// 	orderByDesc = true;
		// 	$toast.show("Order by last update");
		// } else if (orderBy == 'lastUpdate') {
			orderBy = 'bestRelease';
			orderByDesc = false;
			$toast.show("Order by best release");
		}

		$settings.userOptions.comicsOrderBy = orderBy;
		$settings.userOptions.comicsOrderByDesc = (orderByDesc ? 'T' : 'F');
		
		orderedComics = $comicsData.getComics(orderBy, orderByDesc);
		applyFilter();
	};
	//funzione di rimozione elemento
	$scope.removeComicsEntry = function() {
		if (!_.isEmpty($scope.selectedComics)) {
			$comicsData.remove($scope.selectedComics);
			$comicsData.save();
			$scope.selectedComics = [];
			$scope.canEdit = false;
			applyFilter();

			$timeout(function() {
			  $undoPopup.show({title: "Comics removed", timeout: "long"}).then(function(res) {
			    if (res == 'ok') {
			      $scope.selectedComics = $comicsData.undoRemove() || [];
			      $scope.canEdit = ($scope.selectedComics.length == 1);
			      $comicsData.save();
			      applyFilter();
			    }
			  });
			}, 250);
		}
	};
	//apre il template per l'editing
	$scope.addComicsEntry = function() {
		$state.go('app.comics_editor', {comicsId: 'new'});
	};
	//apre il template per l'editing del fumetto
	$scope.editComicsEntry = function(item) {
		item = item || $scope.selectedComics[0];
		$state.go('app.comics_editor', {comicsId: item.id});
	};
	//apre te template per l'editing dell'uscita
	$scope.showAddRelease = function(item) {
		item = item || $scope.selectedComics[0];
		$state.go('app.release_editor', {comicsId: item.id, releaseId: 'new'});
	};
	//
	$scope.showHeaderBar = function() {
		$scope.selectedComics = [];
		$scope.currentBar = 'title'
	};
	//
	$scope.clickItem = function(item) {
		if ($scope.currentBar == 'options') {
			$scope.selectItem(item);
		} else {
			$state.go('app.releases_entry', {comicsId: item.id});
		}
	};
	//
	$scope.selectItem = function(item) {
		//cerco l'indice dell'elemento selezionato
		var idx = $utils.indexFindWhere($scope.selectedComics, {id: item.id});

		//se è già selezionato lo rimuovo
		if (idx >= 0) {
			$scope.selectedComics.splice(idx, 1);
		} else {
			$scope.selectedComics.push(item);
		}

		//nascondo la barra di navigazione (e mostro quella delle opzioni) se c'è almeno un elemento selezionato
		if ($scope.selectedComics.length == 0) {
	    $scope.showHeaderBar();
			// $scope._deregisterBackButton && $scope._deregisterBackButton();
  	// 	$scope._deregisterBackButton = null;
		} else {
			$scope.canEdit = ($scope.selectedComics.length == 1);
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
	$scope.isSelected = function(id) {
		return $utils.indexFindWhere($scope.selectedComics, {id: id}) >= 0;
	};

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
.directive('bestRelease', function() {
  return {
    restrict: 'E',
    scope: {
      comics: '='
    },
    controller: ['$scope', '$filter', '$comicsData', function($scope, $filter, $comicsData) {
      $scope.best = $scope.comics.bestRelease;
      var today = $filter('date')(new Date(), 'yyyy-MM-dd');
      $scope.near = $scope.best.date && $scope.best.date == today;
      $scope.expired = $scope.best.date && $scope.best.date <= today;
    }],
    templateUrl: 'templates/bestRelease.html'
  };
})
.controller('ComicsEditorCtrl', [
'$scope', '$stateParams', '$ionicNavBarDelegate', '$comicsData',
function($scope, $stateParams, $ionicNavBarDelegate, $comicsData) {
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
  $scope.goBack = function() {
  	$ionicNavBarDelegate.back();
  }
  $scope.reset();
}]);