'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'calculadora',
    'factor',
    'ticket',
    'servicios',
    'http-auth-interceptor',
    'login',
    'ngLoadingSpinner',
    'noSubmit',
    'tests',
    'angular-growl',
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
        //$routeProvider.when('/usuarios', {
        //    templateUrl: 'usuario/buscar.html',
        //    controller: 'UsuarioCtrl'
        //});
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl'
        });
        $routeProvider.when('/no-submit', {
            templateUrl: 'tests/noSubmit.html',
            controller: 'NoSubmitCtrl'
        });
  $routeProvider.otherwise({redirectTo: '/calcular'});
}]);



angular.module('myApp').directive('showLogin', function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var login = element.find('#login-holder');
            var loginError = element.find('#login-error');
            var main = element.find('#content');
            var username = element.find('#username');
            var password = element.find('#password');

            login.hide();
            loginError.hide();

            scope.$on('event:auth-loginRequired', function() {
                console.log('showing login form');
                main.hide();
                username.val('');
                password.val('');
                login.show();
            });
            scope.$on('event:auth-loginFailed', function() {
                console.log('showing login error message');
                username.val('');
                password.val('');
                loginError.show();
            });
            scope.$on('event:auth-loginConfirmed', function() {
                console.log('hiding login form');
                main.show();
                login.hide();
                username.val('');
                password.val('');
            });
        }
    };
});



function getLocalToken() {
    return localStorage["authToken"];
}

function getHttpConfig() {
    return {
        headers: {
            'X-Auth-Token': getLocalToken()
        }
    };
}

function getAuthenticateHttpConfig() {
    return {
        ignoreAuthModule: true
    };
}


angular.module('myApp').factory('authInterceptor', function($q) {
    return {
        request: function ($config) {
            var token = getLocalToken();
            if (token) {
                //$config.headers['X-Auth-Token'] = token;
                $config.headers['Authorization'] = "Bearer " + token;
            }
            return $config;
        }
    };
});
angular.module('myApp').config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});


angular.module('myApp').directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value, 10);
            });
        }
    };
});