angular.module('starter.controllers')
.controller('ComicsCtrl', [
	'$scope', '$ionicModal', '$timeout', '$location', '$undoPopup', '$utils', '$debounce', 
	'$ionicScrollDelegate', '$ionicNavBarDelegate', '$ionicPlatform', 'ComicsReader', 'Settings', 
function($scope, $ionicModal, $timeout, $location, $undoPopup, $utils, $debounce, 
	$ionicScrollDelegate, $ionicNavBarDelegate, $ionicPlatform, ComicsReader, Settings) {
	//recupero i dati già ordinati
	var orderedComics = ComicsReader.getComics(Settings.userOptions.comicsOrderBy || 'name', Settings.userOptions.comicsOrderByDesc == 'T');
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
	//funzione di rimozione elemento
	$scope.removeComicsEntry = function() {
		if (!_.isEmpty($scope.selectedComics)) {
			ComicsReader.remove($scope.selectedComics);
			ComicsReader.save();
			$scope.selectedComics = [];
			$scope.canEdit = false;
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
		}
	};
	//apre il template per l'editing
	$scope.addComicsEntry = function() {
		$location.path("/app/comics/new").replace();
	};
	//apre il template per l'editing del fumetto
	$scope.editComicsEntry = function(item) {
		item = item || $scope.selectedComics[0];
		$location.path("/app/comics/" + item.id).replace();
	};
	//apre te template per l'editing dell'uscita
	$scope.showAddRelease = function(item) {
		$location.path("/app/release/" + item.id + "/new").replace();
	};
	//
	$scope.showHeaderBar = function() {
		$scope.selectedComics = [];
		$scope.currentBar = 'title'
    //TODO $scope._deregisterBackButton && $scope._deregisterBackButton();
    //TODO $scope._deregisterBackButton = null;
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
		} else {
			$scope.currentBar = 'options'
			$scope.canEdit = ($scope.selectedComics.length == 1);
			//TODO $scope._deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() { $scope.showHeaderBar() }, 1)
		}
	}
	//
	$scope.isSelected = function(id) {
		return $utils.indexFindWhere($scope.selectedComics, {id: id}) >= 0;
	};

	//aspetto un attimo prima di nascondere la barra originale altrimenti non funziona
	$timeout(function() { $ionicNavBarDelegate.showBar(false); }, 250);

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