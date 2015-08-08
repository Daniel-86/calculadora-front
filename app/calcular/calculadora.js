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


function getConditional(item) {
    if(!item) return false;
    if(item.domainClass.toLowerCase() !== 'conceptoespecial') return false;

    var possibilities = ['firewall', 'ips', 'filtrado_web', 'antispam'];
    var propertiesName;
    if(angular.isArray(item.propiedades)) {
        propertiesName = item.propiedades.map(function(property) {
            return property.customId;
        });
    }
    else {
        return false;
    }

    if(isIn(item.customId, possibilities)) {
        var foundProperty = false;
        var constraint = {};
        for(var i=0; i<propertiesName.length; i++) {
            if(isContained(propertiesName[i], ['cantidad'])) {
                foundProperty = true;
                constraint.propName = propertiesName[i];
            }
        }
        if(!foundProperty) return false;
        return constraint;
    }
}


function evalConstraint(item, constraint) {
    if(!item || !constraint) return false;
    var propName = constraint.propName;
    var propIdx = findWithAttr(item.propiedades, 'customId', propName);
    if(!propName || !(propIdx>0)) return false;
    var biggerThan = constraint.biggerThan? constraint.biggerThan: 0;
    var value = item.propiedades[propIdx-1].rValue;
    item.deviceCount = value;
    return value > biggerThan;
}


function isQuantitySpecified(item) {
    if(!item) return false;
    if(item.deviceScope === 'all') return true;
    return item.currentScope && item.currentScope > 0;
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
        return isAny(item.toLowerCase(), possibilities);
    };

    $scope.isStringBoolean = function(item, possibilities) {
        if(!possibilities) possibilities = ['check', 'checkbox', 'boolean'];
        return isAny(item.toLowerCase(), possibilities);
    };

    $scope.isStringVolumetria = function(item, possibilities) {
        if(!possibilities) possibilities = ['volumetria'];
        return isContained(removeDiacritics(item.toLowerCase()), possibilities);
    };

    $scope.showChildren = function(item) {
        if(!item) return false;
        var constraint = getConditional(item);
        if(!constraint) return true;
        var show = evalConstraint(item, constraint, item.deviceCount);
        if(show) item.deviceCountArray = generateRangeArray(item.deviceCount);
        if(show && !angular.isDefined(item.isPartialSelected)) {
            item.deviceScope = 'all';
            item.deviceRange = {min:0, max:item.deviceCount};
        }
        item.isPartialSelected = show;
        if(item.deviceScope === 'all') item.isFullSelected = show;
        //item.isFullSelected = item.deviceScope === 'all'? show: isQuantitySpecified(item);
        return show;
    };

    $scope.applyToChanged = function(item) {
        item.isFullSelected = isQuantitySpecified(item);
    };

    $scope.deviceScopeChanged = function(item) {
        if(item.deviceScope === 'all') {
            item.deviceRange = {min:0, max:item.deviceCount};
        }
        else if(item.deviceScope === 'single') {
            item.deviceRange = {min:item.currentScope-1, max:item.currentScope};
        }
        else if(item.deviceScope === 'range') {
            item.deviceRarnge = {min:0, max:item.currentScope};
        }
        item.currentSelection = item.rValue[item.deviceRange.min];
    };

    $scope.updateSelections = function(item) {
        if(!angular.isDefined(item.rValue) || !angular.isArray(item.rValue)) item.rValue = [];
        for(var i=item.deviceRange.min; i<item.deviceRange.max; i++) {
            //item.rValue[i] = item.currentSelection;
            item.rValue[i] = angular.copy(item.currentSelection);
            var alguna = 'asdf';
        }
    };

    $scope.selectAll = function(item) {
        item.currentSelection = angular.copy(item.conceptos);
        $scope.updateSelections(item);
    };

    $scope.selectNone = function(item) {
        item.currentSelection = undefined;
        $scope.updateSelections(item);
    };

    $scope.copySelection = function(item) {
        item.clipboard = angular.copy(item.currentSelection);
    };

    $scope.pasteSelection = function(item) {
        if(item.clipboard) {
            item.currentSelection = angular.copy(item.clipboard);
            $scope.updateSelections(item);
            item.clipboard = undefined;
        }
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