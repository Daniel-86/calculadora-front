'use strict';

var testsModule = angular.module('tests', ['noSubmit']);

testsModule.controller('NoSubmitCtrl', function ($scope) {
    $scope.data = [{firstName: 'daniel', lastName: 'jimenez'}, {firstName: 'jimenez', lastName: 'daniel'}];

    $scope.products = [
        {name: 'Manzana', category: 'Fruta', price: 1.2, expiry: 10},
        {name: 'Platano', category: 'Fruta', price: 1.2, expiry: 10},
        {name: 'Pera', category: 'Fruta', price: 1.2, expiry: 10},
        {name: 'Tomate', category: 'Vegetal', price: 1.2, expiry: 10}
    ];

    $scope.mySubmit = function() {
        console.log('scope mySubmit');
    }
});
