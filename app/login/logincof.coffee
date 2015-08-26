'use strict';

loginModule = angular.module('login', []);

loginModule.constant 'baseRemoteURL', 'http://localhost:8080/calculadora'

loginModule.controller 'LoginCtrl', [
  '$rootScope'
  '$scope'
  '$http'
  'authService'
  'baseRemoteURL'
  ($rootScope, $scope, $http, authService, baseRemoteURL) ->
    $scope.login =->
      $http.post baseRemoteURL+'api/login', {username: $scope.authData.username, password: $scope.authData.password}
]




loginModule.factory 'AuthDataService', [
  'localStorageService'
  '$base64'
  '$http'
  (localStorageService, $base64, $http) ->
    current_auth_data = localStorageService.get('authorization_token')
    if current_auth_data
      $http.defaults.headers.common['Authorization'] = "Bearer #{current_auth_data}"

    return {
      setAuthData: (authdata) ->
        return unless authdata
        encoded = $base64.encode(authdata)
        localStorageService.set('authorization_token', encoded)
        $http.defaults.headers.common['Authorization'] = "Bearer #{encoded}"
      clearAuthData: ->
        localStorageService.remove('authorization_token')
        $http.defaults.headers.common['Authorization'] = ''
      getAuthData: ->
        return localStorageService.get('authorization_token')
    }
]