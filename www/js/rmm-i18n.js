/**
 * Ionic Angular module: rmm-i18n
 */

var IonicModule = angular.module('rmm.i18n', ['ngAnimate', 'ngSanitize', 'ui.router']),
  extend = angular.extend,
  forEach = angular.forEach,
  isDefined = angular.isDefined,
  isString = angular.isString,
  jqLite = angular.element;

IonicModule
.factory('$i18n', function() {
	//TODO
	return {};
}
.directive('rmm-tx', function() {
	//TODO
	return {
		restrict: 'AE'
	}
});