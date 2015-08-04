
//angular.module('view3', ['ngRoute'])
//    .config(['$routeProvider', function($routeProvider) {
//        $routeProvider.when('/view3', {
//            templateURL: 'view3/dummy.html',
//            controller: 'vistaCtrl'
//        })
//    }])
//    .controller('vistaCtrl', function() {
//
//});


'use strict';

angular.module('view3', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/view3', {
            templateUrl: 'view3/dummy.html',
            controller: 'View3Ctrl'
        });
    }])

    .controller('View3Ctrl', [function() {

    }]);


