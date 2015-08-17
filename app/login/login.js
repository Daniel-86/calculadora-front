'use strict';

var loginModule = angular.module('login', []);

loginModule.constant('baseRemoteURL', 'http://192.168.1.103:8080/calculadora/');
loginModule.controller('LoginCtrl',
    function($rootScope, $scope, $http, authService, baseRemoteURL) {
        $scope.logIn = function() {
            $http.post(baseRemoteURL+'api/login',
                {username: $scope.authData.username,
                    password: $scope.authData.password},
                getAuthenticateHttpConfig)
                .success(function(data) {
                    localStorage["authToken"] = data.token;
                    authService.loginConfirmed({}, function(config) {
                        if(!config.headers['X-Auth-Token']) {
                            config.headers['X-Auth-Token'] = getLocalToken();
                        }
                        return config;
                    });
                })
                .error(function(data) {
                    $rootScope.$broadcast('event:auth-loginFailed', data);
                });
        };
    });


loginModule.controller('LogoutCtrl',
    function($scope, $http, $location, baseRemoteURL) {
        $scope.logOut = function() {
            $http.post(baseRemoteURL+'api/logout', {}, getHttpConfig())
                .success(function() {
                    localStorage.clear();
                    $location.path('/');
                })
                .error(function(data) {
                    console.log('logoout error: '+data);
                });
        };
    });
