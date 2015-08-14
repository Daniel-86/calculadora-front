'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'calculadora',
    'factor',
    'ticket',
    'servicios'
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
        $routeProvider.when('/factor/:factorId?', {
            templateUrl: 'factor/create-factor.html',
            controller: 'FactorCtrl'
        });
        $routeProvider.when('/tickets', {
            templateUrl: 'ticket/list-ticket.html',
            controller: 'TicketCtrl'
        });
        $routeProvider.when('/ticket/:ticketId?', {
            templateUrl: 'ticket/create-ticket.html',
            controller: 'TicketCtrl'
        });
        $routeProvider.when('/servicios/:selectedId?', {
            templateUrl: 'servicios/servicios.html',
            controller: 'ServiciosCtrl'
        });
  $routeProvider.otherwise({redirectTo: '/calcular'});
}]);
