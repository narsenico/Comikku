// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'pasvaz.bindonce', 'starter.controllers', 'ngAnimate', 'ngCordova', 'rmm', 'dateParser'])

.run(function($ionicPlatform) {
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
  });
})

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

.config(function($stateProvider, $urlRouterProvider, $initOptionsProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
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
});

