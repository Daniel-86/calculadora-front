//= require_self

var calculadoraControllers = angular.module('calculadora', ['checklist-model', 'toggle-switch', 'ui.bootstrap', 'ngRoute']);

//var model = {
//    chosen: [],
//    resultados: null,
//    openedCategory: {}
//};

//function getCategoryList($http) {
//    var muted = false; if(!muted) console.log('\n');
//    $http.get('calculadora/list').success(function(data) { if(!muted) console.log('getCategoryList data', data);
//        model.categories = data.categories;
//    });
//}

//calculadoraControllers.run(function($http) {
//    var muted = false; if(!muted) console.log('\n');
//    $http.get('calculadora/list').success(function(data) { if(!muted) console.log('run getList-succes data', data);
//        model.categories = data.categories;
//    });
//});


function getIdentifier(item, propertyName) {
    if(!angular.isDefined(propertyName)) propertyName = 'customId';
    return angular.isObject(item) ? item[propertyName] : item;
}


function mainCtrl($scope, $http, baseRemoteURL) {

    var model = {
        chosen: [],
        resultados: null,
        openedCategory: {},
        chosenObj: {}
    };
    function getCategoryList() {
        var muted = false; if(!muted) console.log('\n');
        $http.get(baseRemoteURL+'calculadora/list').success(function(data) { if(!muted) console.log('getCategoryList' +
            ' data', data);
            model.categories = data.categories; if(!muted) console.log('getCategoryList model', model);
            $scope.categories = model.categories;
            $scope.chosen = model.chosen;
            $scope.resultados = model.resultados;
            $scope.openedCategory = model.openedCategory;
            $scope.chosenObj = model.chosenObj;
        });
    }
    getCategoryList();


    var muted = false; if(!muted) console.log('\n');

    //$scope.categories = model.categories;
    //$scope.chosen = model.chosen;
    //$scope.resultados = model.resultados;
    //$scope.openedCategory = model.openedCategory;
    //$scope.model = model;
    if(!muted) console.log('mainCtrl model.categories', model.categories);
    if(!muted) console.log('mainCtrl scope.categories', $scope.categories);

    $scope.isEmpty = function(item) {
        var key = getIdentifier(item);
        return !$scope.chosen || !angular.isArray($scope.chosen) || !$scope.chosen[key];
    };

    $scope.toggleSelected = function(item, state) {
        var muted = false;
        if(!muted) console.log('\n');
        var key = getIdentifier(item);
        var chosenItem = $scope.$parent.chosen[key];
        if(!state) {
            $scope.$parent.chosen[key] = undefined;
            $scope.$parent.chosenObj[key] = undefined;
        }
        else if(state && !angular.isArray($scope.$parent.chosen[key])){
            $scope.$parent.chosen[key] = [];
            $scope.$parent.chosenObj[key] = {};
            $scope.$parent.chosenObj[key]['present'] = true;
            if(!muted) console.log('toggleSelected chosenIem', $scope.$parent.chosen[key]);
        }
        if(!muted) console.log('toggleSelected isSelected', $scope.isSelected);
        if(!muted) console.log('toggleSelected state', state);
        if(!muted) console.log('toggleSelected scope.chosen', $scope.$parent.chosen);
    };

    $scope.meetsShowReq = function(item) {
        var muted = true;
        if(!muted) console.log('\n');
        if(!muted) console.log('meetsShowReq scope.chosen', $scope.$parent.chosen);
        var key = getIdentifier(item);
        return item.customId === 'ingenieria_en_sitio' && !$scope.$parent.chosen[key];
    };

    $scope.noMatches = function() {
        return true;
    };

    $scope.showImmediateChild = function(item, parent) {
        $scope.tempSelected = item;
    };

    $scope.updateResultModel = function(valor, item, parent, root) {
        if(!parent && !root) {
            $scope.chosen[item.customId] = valor;
            return;
        }
        if(parent === root) {

        }
    };

    $scope.isStringNumber = function(item, possibilities) {
        if(!possibilities) possibilities = ['int', 'integer', 'number', 'float', 'double', 'decimal'];
        return isAny(item, possibilities);
    };

    $scope.isStringBoolean = function(item, possibilities) {
        if(!possibilities) possibilities = ['check', 'checkbox', 'boolean'];
        return isAny(item, possibilities);
    };

    $scope.currentProperties = function() {
        var muted = false;
        if(!muted) console.log('\n');
        if($scope.tempSelected && angular.isArray($scope.tempSelected.propiedades)) {
            if (!muted) console.log('currentPoperties tempSelected', $scope.tempSelected);
            return $scope.tempSelected.propiedades;
        }
        return [];
    };

    $scope.monitor = function(item) {
        var muted = true;
    };

    $scope.monitor2 = function(item) {
        var muted = true;
    };


    /**
     * Para el acordeon
     */
    $scope.oneAtATime = true;
}

//calculadoraControllers.config(['$routeProvider', function($routeProvider) {
//    $routeProvider.when('/calcular', {
//        templateUrl: 'calcular/calcular.html',
//        controller: 'CalculadoraMainCtrl'
//    });
//}]);


calculadoraControllers.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/calcular', {
        templateUrl: 'factor/dummy.html',
        controller: 'FactorCtrl'
    });
}]);

calculadoraControllers.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
calculadoraControllers.controller('CalculadoraMainCtrl', function($scope, $http, baseRemoteURL) {mainCtrl($scope, $http, baseRemoteURL)});
//calculadoraControllers.filter('trim');