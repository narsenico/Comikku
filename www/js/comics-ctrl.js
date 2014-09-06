angular.module('starter.controllers')
.controller('ComicsCtrl', [
	'$scope', '$ionicModal', '$timeout', '$location', '$undoPopup', '$utils', '$debounce', '$ionicScrollDelegate', '$ionicNavBarDelegate', 'ComicsReader', 'Settings', 
function($scope, $ionicModal, $timeout, $location, $undoPopup, $utils, $debounce, $ionicScrollDelegate, $ionicNavBarDelegate, ComicsReader, Settings) {
	//recupero i dati già ordinati
	var orderedComics = ComicsReader.getComics(Settings.userOptions.comicsOrderBy || 'name', Settings.userOptions.comicsOrderByDesc == 'T');
	//conterrà i dati filtrati (tramite campo di ricerca)
	var filteredComics = orderedComics;
	//
	var selectedItems = [];
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
	      if (Settings.userOptions.comicsSearchPublisher == 'T') {
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
	$scope.debugMode = Settings.userOptions.debugMode == 'T';
	//conterrà i comics caricati poco alla volta tramite infirnite scroll
	$scope.comics = [];
	//
	$scope.totComics = filteredComics.length;
	//indica se sono stati selezionati più elementi
	$scope.multiSelection = false;
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
	//funzione di rimozione elemento
	$scope.removeComicsEntry = function(item) {
		if (!_.isEmpty(selectedItems)) {
			ComicsReader.remove(selectedItems);
		} else {
			ComicsReader.remove(item);
		}
		ComicsReader.save();
		applyFilter();

		$timeout(function() {
		  $undoPopup.show({title: "Comics removed", timeout: "long"}).then(function(res) {
		    if (res == 'ok') {
		      ComicsReader.undoRemove();
		      ComicsReader.save();
		      applyFilter();
		    }
		  });
		}, 250);
	};
	//apre il template per l'editing
	$scope.addComicsEntry = function() {
		$location.path("/app/comics/new").replace();
	};
	//apre il template per l'editing del fumetto
	$scope.editComicsEntry = function(item) {
		item = item || selectedItems[0];
		$location.path("/app/comics/" + item.id).replace();
	};
	//apre te template per l'editing dell'uscita
	$scope.showAddRelease = function(item) {
		$location.path("/app/release/" + item.id + "/new").replace();
	};
	//
	$scope.hideOptionsBar = function() {
		selectedItems = [];
		//TODO ripristinare stile elementi selezioanti
		$ionicNavBarDelegate.showBar(true);
	};
	//
	$scope.selectItem = function(item, $index, $event) {
		//console.log("sel", item, $event)

		//cerco l'indice dell'elemento selezionato
		var idx = $utils.indexFindWhere(selectedItems, {id: item.id});

		//se è già selezionato lo rimuovo
		if (idx >= 0) {
			selectedItems.splice(idx, 1);
		} else {
			selectedItems.push(item);
			//console.log($event, $event.target)
		}

		//nascondo la barra di navigazione (e mostro quella delle opzioni) se c'è almeno un elemento selezionato
		if (selectedItems.length == 0) {
	    $ionicNavBarDelegate.showBar(true);
		} else {
			$ionicNavBarDelegate.showBar(false);
			$scope.multiSelection = (selectedItems.length > 1);
		}

		//TODO cambiare stile elementi selezionati

		//TODO nascosto al back (intercettare)
		//$ionicPlatform.registerBackButtonAction
	}

}])
.directive('bestRelease', function() {
  return {
    restrict: 'E',
    scope: {
      comics: '='
    },
    controller: ['$scope', '$filter', 'ComicsReader', function($scope, $filter, ComicsReader) {
      $scope.best = $scope.comics.bestRelease;
      var today = $filter('date')(new Date(), 'yyyy-MM-dd');
      $scope.expired = $scope.best.date && $scope.best.date < today;
    }],
    templateUrl: 'templates/bestRelease.html'
  };
});