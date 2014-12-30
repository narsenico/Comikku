angular.module('starter.controllers')
.controller('ComicsCtrl', [
	'$scope', '$ionicModal', '$timeout', '$state', '$filter', '$undoPopup', '$utils', '$debounce', '$toast', '$ionicPopover',
	'$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', '$comicsData', '$settings',
function($scope, $ionicModal, $timeout, $state, $filter, $undoPopup, $utils, $debounce, $toast, $ionicPopover,
	$ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, $comicsData, $settings) {
	//recupero i dati già ordinati
	var orderedComics = null;
	//conterrà i dati filtrati (tramite campo di ricerca)
	var filteredComics = null;
	//indcia quanti dati caricare alla volta tramite infinite scroll
	var loadChunk = 20;
	var changeOrder = function() {
		filteredComics = orderedComics = $comicsData.getComics($scope.orderBy, $scope.orderByDesc);
		$scope.totComics = filteredComics.length;
		$settings.userOptions.comicsOrderBy = $scope.orderBy;
		$settings.userOptions.comicsOrderByDesc = ($scope.orderByDesc ? 'T' : 'F');
	};
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
	$scope.orderBy = $settings.userOptions.comicsOrderBy || 'name';
	$scope.orderByDesc = $settings.userOptions.comicsOrderByDesc == 'T';
	//
	$scope.currentBar = 'title';
	//conterrà i comics caricati poco alla volta tramite infirnite scroll
	$scope.comics = [];
	//
	$scope.totComics = 0;
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
		return $scope.comics && filteredComics && $scope.comics.length < filteredComics.length;
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
	//funzione di rimozione elemento
	$scope.removeComicsEntry = function() {
		if (!_.isEmpty($scope.selectedComics)) {
			$comicsData.remove($scope.selectedComics);
			$comicsData.save();
			$scope.selectedComics = [];
			$scope.canEdit = false;
			applyFilter();

			$timeout(function() {
			  $undoPopup.show({title: $filter('translate')('Comics removed'), 
			  									text: '<i class="icon ion-android-system-back"></i> ' + $filter('translate')('CANCEL'), 
			  									timeout: "long"}).then(function(res) {
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
	$scope.showNavBar = function() {
		$scope.selectedComics = [];
		$scope.currentBar = 'title';
		$ionicNavBarDelegate.showBar(true);
	};
	$scope.showOptionsBar = function() {
		$scope.currentBar = 'options';
		$ionicNavBarDelegate.showBar(false);
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
	    $scope.showNavBar();
			// $scope._deregisterBackButton && $scope._deregisterBackButton();
  	// 	$scope._deregisterBackButton = null;
		} else {
			$scope.canEdit = ($scope.selectedComics.length == 1);
			if ($scope.currentBar != 'options') {
				$scope.showOptionsBar();
				// $scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() { 
				// 	$scope.showNavBar();
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
	//
	$scope.orderByPopover = null;
	$scope.openOrderByPopover = function($event) {
		if (!$scope.orderByPopover) {
		  $ionicPopover.fromTemplateUrl('orderby-popover.html', {
		    scope: $scope,
		  }).then(function(popover) {
		    $scope.orderByPopover = popover;
		    $scope.orderByPopover.show($event);
		  });
		} else {
			$scope.orderByPopover.show($event);
		}
	};
	//
	$scope.closeOrderByPopover = function(orderBy, orderByDesc) {
		$scope.orderBy = orderBy;
		$scope.orderByDesc = orderByDesc;
		changeOrder();
		applyFilter();
		$scope.orderByPopover.hide();
	};
	//gestisco il back hw in base a quello che sto facendo
	$scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() {
		if ($scope.currentBar == 'options') {
			$scope.showNavBar();
			$scope.$apply(); //altrimenti non vengono aggiornati 
		} else {
			navigator.app.exitApp();
		}
	}, 100);

	//chiamo la prima volta le funzioni per l'ordinamento e il filtro (???)
	changeOrder();
	//applyFilter();

	//deregistro l'evento sul back all'uscita
	$scope.$on('$destroy', function() {
		$scope.orderByPopover && $scope.orderByPopover.remove(); 
		$scope._deregisterBackButton && $scope._deregisterBackButton();
		$settings.save();
	});

}])
.directive('bestRelease', function() {
  return {
    restrict: 'E',
    scope: {
      comics: '='
    },
    controller: ['$scope', '$filter', '$comicsData', function($scope, $filter, $comicsData) {
      var today = moment().format('YYYY-MM-DD');
      $scope.best = $scope.comics.bestRelease;
      $scope.datestr = _.isEmpty($scope.best.date) ? '' : moment($scope.best.date).format('DD MMM');
      $scope.near = $scope.best.date && $scope.best.date == today;
      $scope.expired = $scope.best.date && $scope.best.date <= today;
    }],
    templateUrl: 'templates/bestRelease.html'
  };
})
.controller('ComicsEditorCtrl', [
'$scope', '$stateParams', '$ionicHistory', '$comicsData',
function($scope, $stateParams, $ionicHistory, $comicsData) {
	//usato per contenere la form in modo da poter accedere alla form anche all'esterno del tag <form>
	$scope.data = {};
  //console.log($stateParams, $comicsData)
  $scope.periodicities = PERIODICITIES;
  //originale
  $scope.master = $comicsData.getComicsById($stateParams.comicsId);
  //aggiorno l'originale e torno indietro
  $scope.update = function(entry) {
	  angular.copy(entry, $scope.master);
	  $comicsData.update($scope.master);
	  $comicsData.save();
	  $ionicHistory.goBack();
  };
  $scope.reset = function() {
    $scope.entry = angular.copy($scope.master);
  };
  $scope.cancel = function() {
    $ionicHistory.goBack();
  };
  $scope.isUnique = function(entry) {
    return $comicsData.normalizeComicsName($scope.master.name) == $comicsData.normalizeComicsName(entry.name) || 
      $comicsData.isComicsUnique(entry);
  };
  $scope.goBack = function() {
  	$ionicHistory.goBack();
  }
  $scope.reset();
}]);