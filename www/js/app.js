  // Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', 
  ['ionic', 'pasvaz.bindonce', 'starter.controllers', 'ngAnimate', 'rmm', 'dateParser', 'pascalprecht.translate'])

.provider('$initOptions', function $initOptionsProvider() {
  var str = window.localStorage.getItem("OPTIONS");
  var settings = {};
  if (str) {
    angular.extend(settings, JSON.parse(str));
  }

  this.defaultUrl = settings.defaultUrl || '/app/comics';
  this.$get = [function $initOptionsFactory() {
    return new provme();
  }];
})

.config(['$stateProvider', '$urlRouterProvider', '$initOptionsProvider', '$translateProvider', '$ionicConfigProvider',
function($stateProvider, $urlRouterProvider, $initOptionsProvider, $translateProvider, $ionicConfigProvider) {

  //TODO caricare le stringhe da file esterni
  $translateProvider.translations('en', {
    // 'Comics': 'Comics'
  })
  .translations('it', {
    "Comics": "Fumetti",
    "Comics removed": "Fumetti rimossi",
    "Releases": "Uscite",
    "Losts & Wishlist": "Persi &amp; desiderati",
    "Purchased": "Acquistati",
    "Settings": "Impostazioni",
    "CANCEL": "ANNULLA",
    "Sort by release": "Ordina per uscita",
    "Sort by name": "Ordina per nome",
    "New comics entry": "Nuovo fumetto",
    "Edit comics entry": "Modifica",
    "Name": "Nome",
    "Publisher": "Editore",
    "Series": "Serie",
    "Authors": "Autore",
    "Price": "Prezzo",
    "Periodicity": "Periodicit&agrave;",
    "Comics periodicity": "Periodicit&agrave;",
    "Reserved": "Prenotato",
    "Notes": "Note",
    "comics title": "titolo",
    "publisher": "editore",
    "comics series": "serie",
    "authors": "autore",
    "price": "prezzo",
    "notes": "note",
    "Group by week": "Raggruppa per settimane",
    "Group by month": "Raggruppa per mesi",
    "This week": "Questa settimana",
    "Next week": "Settimana prossima",
    "This month": "Questo mese",
    "Next month": "Mese prossimo",
    "Wishlist": "Lista dei desideri",
    "Losts": "Persi",
    "Releases removed": "Uscite rimosse",
    "Release purchased": "Numero acquistato",
    "Purchase canceled": "Acquisto annullato",
    "Releases purchased": "Numeri acquistati",
    "Issue #": "Numero",
    "release number": "numero uscita",
    "Date": "Data",
    "Release date is required with reminder checked!": "Data obbligatoria con il promemoria attivo",
    "Purchased.1": "Acquistato",
    "General settings": "Impostazioni generali",
    "Backup data": "Backup dei dati",
    "About Comikku": "Informazioni",
    "Auto fill release data": "Impostazione automatica nuova uscita",
    "Week start on": "La settimana inizia di",
    "Monday": "Luned&igrave;",
    "Sunday": "Domenica",
    "On start show": "All'avvio mostra",
    "Data": "Dati",
    "Delete all data": "Cancella tutti i dati",
    "Reset settings": "Ripristina le impostazioni di default",
    "Cancel": "Annulla",
    "About": "Informazioni",
    "Backup data.1": "Esegui il backup dei dati",
    "Restore data": "Ripristina i dati",
    "Last backup:": "Ultimo backup:",
    "not found": "non trovato",
    "Backup data? Previous backup will be overridden.": "Eseguire il backup dei dati? Eventuali backup precedenti verranno sovrascritti.",
    "Backup complete": "Backup completo",
    "Restore data from backup? Current data will be overridden.": "Ripristinare i dati dal bakcup? I dati correnti verranno sovrascritti.",
    "Restore complete": "Ripristino completato",
    "Confirm": "Conferma",
    "Delete all data?": "Eliminare tutti i dati?",
    "Data deleted": "Dati eliminati",
    "Reset to default Settings?": "Ripristinare le impostazioni di default?",
    "Cancel": "Annulla",
    "OK": "OK",
    "Enabled": "Abilitata",
    "Disabled": "Disabilitata",
    "Ordered": "Ordinato",
    "Periodicity.None": "Nessuna",
    "Weekly": "Settimanale",
    "Monthly": "Mensile",
    "Every 2 months": "Ogni 2 mesi",
    "Every 3 months": "Ogni 3 mesi",
    "Every 4 months": "Ogni 4 mesi",
    "Every 6 months": "Ogni 6 mesi",
    "Annual": "Annuale" 
  });

  //imposto la lingua di default
  $translateProvider.preferredLanguage("en")
    .fallbackLanguage("en")
    .determinePreferredLanguage()
    .useStorage('StorageService');
  //
  moment.locale('en');

  //configuro il pulsante 'back' in modo che non mostri alcun testo (ma solo l'icona)
  $ionicConfigProvider.backButton.text('').previousTitleText(false);

  //
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.comics', {
      url: "/comics",
      views: {
        'menuContent' :{
          templateUrl: "templates/comics.html",
          controller: 'ComicsCtrl'
        }
      }
    })
    .state('app.comics_editor', {
      url: "/comics/:comicsId",
      views: {
        'menuContent' :{
          templateUrl: "templates/comicsEditor.html",
          controller: 'ComicsEditorCtrl'
        }
      }
    })

    .state('app.releases', {
      url: "/releases",
      views: {
        'menuContent' :{
          templateUrl: "templates/releases.html",
          controller: 'ReleasesEntryCtrl'
        }
      }
    })
    .state('app.releases_entry', {
      url: "/releases/:comicsId",
      views: {
        'menuContent' :{
          templateUrl: "templates/releases.html",
          controller: 'ReleasesEntryCtrl'
        }
      }
    })
    .state('app.release_editor', {
      url: "/release/:comicsId/:releaseId",
      views: {
        'menuContent' :{
          templateUrl: "templates/releaseEditor.html",
          controller: 'ReleaseEditorCtrl'
        }
      }
    })

    .state('app.wishlist', {
      url: "/wishlist",
      views: {
        'menuContent' :{
          templateUrl: "templates/releases.html",
          controller: 'ReleasesEntryCtrl'
        }
      }
    })
    .state('app.purchased', {
      url: "/purchased",
      views: {
        'menuContent' :{
          templateUrl: "templates/releases.html",
          controller: 'ReleasesEntryCtrl'
        }
      }
    })

    .state('app.options', {
      url: "/options",
      views: {
        'menuContent' :{
          templateUrl: "templates/options.html",
          controller: 'OptionsCtrl'
        }
      }
    })
    .state('app.settings', {
      url: "/settings",
      views: {
        'menuContent' :{
          templateUrl: "templates/settings.html",
          controller: 'OptionsCtrl'
        }
      }
    })
    .state('app.about', {
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "templates/about.html",
          controller: 'OptionsCtrl'
        }
      }
    })
    .state('app.backup', {
      url: "/backup",
      views: {
        'menuContent' :{
          templateUrl: "templates/backup.html",
          controller: 'OptionsCtrl'
        }
      }
    })
    .state('app.debug', {
      url: "/debug",
      views: {
        'menuContent' :{
          templateUrl: "templates/debug.html",
          controller: 'OptionsCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise($initOptionsProvider.defaultUrl);
}])

.run(['$ionicPlatform', '$translate', '$state', '$ionicHistory', '$settings',
function($ionicPlatform, $translate, $state, $ionicHistory, $settings) {

  //imposto la lingua a moment prima che parta cordova
  //  visto che solitamente parte dopo il caricamento della prima pagina
  moment.locale($translate.use());
  //console.log("Language moment " + moment.locale() + " translate " + $translate.use());

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    //leggo la lingua di sistema e la uso in moment e $translate
    if(typeof navigator.globalization !== "undefined") {
      navigator.globalization.getPreferredLanguage(function(language) {
        var lang = (language.value).split("-")[0];
        moment.locale(lang);
        $translate.use(lang)/*.then(function(data) {
          console.log("SUCCESS -> " + data);
        }, function(error) {
          console.log("ERROR -> " + error);
        })*/;
      }, null);
    }
  });

  $ionicPlatform.registerBackButtonAction(function(e) {
    //console.log("BACK BTN " + $ionicHistory.currentView().url + " def " + $settings.userOptions.defaultUrl);
    var backView = $ionicHistory.backView();
    if (backView) {
      backView.go();
    // } else if ($ionicHistory.currentView().url != $settings.userOptions.defaultUrl) {
    //   console.log("go to def view " + $settings.userOptions.defaultUrl);
    //   $state.go();
    } else {
      $settings.save();
      ionic.Platform.exitApp();
    }
  }, 100);
}]);

angular.module('starter.controllers', ['starter.services'])
.controller('AppCtrl', [
  '$scope', '$settings', '$comicsData',
  function($scope, $settings, $comicsData) {
  //
  $settings.load();
  //console.log("   ---- LOAD " + JSON.stringify($settings.userOptions))
  moment.weekStartOnMonday($settings.userOptions.weekStartMonday == 'T');
  //leggo l'elenco dei fumetti (per utente USER)
  $comicsData.read("USER");
  //
  $scope.uid = $comicsData.uid;
  $scope.debugMode = ($settings.userOptions.debugMode == 'T');
}]);
