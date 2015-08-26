'use strict';

var loginModule = angular.module('login', []);

loginModule.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
loginModule.controller('LoginCtrl',
    function($rootScope, $scope, $http, authService, baseRemoteURL, loginService) {
        $scope.logIn = function() {
            $http.post(baseRemoteURL+'api/login',
                {username: $scope.authData.username,
                    password: $scope.authData.password},
                getAuthenticateHttpConfig)
                .success(function(data) {
                    localStorage["authToken"] = data['access_token'];
                    localStorage["roles"] = data['roles'];
                    localStorage["username"] = data['username'];
                    authService.loginConfirmed({}, function(config) {
                        if(!config.headers['X-Auth-Token']) {
                            config.headers['X-Auth-Token'] = getLocalToken();
                        }
                        if(!config.headers['Authorization']) {
                            config.headers['Authorization'] = "Bearer "+getLocalToken();
                        }
                        return config;
                    });
                })
                .error(function(data) {
                    $rootScope.$broadcast('event:auth-loginFailed', data);
                });
        };

        $scope.hasRole = function (role) {
            return loginService.hasRole(role);
        };

        $scope.isLoggedIn = function () {
            return loginService.isLoggedIn();
        };
    });


loginModule.controller('LogoutCtrl',
    function($scope, $http, $location, baseRemoteURL, loginService) {
        $scope.logOut = function() {
            localStorage.clear();
            $location.path('/');
            //$http.post(baseRemoteURL+'api/logout', {}, getHttpConfig())
            //    .success(function() {
            //        localStorage.clear();
            //        $location.path('/');
            //    })
            //    .error(function(data) {
            //        console.log('logoout error: '+data);
            //    });
        };

        $scope.isLoggedIn = function() {
            return loginService.isLoggedIn();
        }
    });

loginModule.service('loginService', function() {
    this.isLoggedIn = function() {
        return localStorage["authToken"] && localStorage["username"];
    };

    this.getRoles = function() {
        return localStorage["roles"]
    };

    this.hasRole = function(role) {
        if(this.isLoggedIn()) {
            var roles = this.getRoles();
            return roles.indexOf(role) > -1;
        }
    }
});