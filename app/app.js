'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
    'view3',
    'calculadora',
    'factor'
]).
config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/calcular', {
        templateUrl: 'calcular/calcular.html',
        controller: 'CalculadoraMainCtrl'
      });
      $routeProvider.when('/factores', {
        templateUrl: 'factor/list-factor.html',
        controller: 'FactorCtrl'
      });
  $routeProvider.otherwise({redirectTo: '/calcular'});
}]);
