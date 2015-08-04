

var factorModule = angular.module('factor', ['as.sortable', 'ui.bootstrap', 'ngRoute']);

function factorCtrl ($scope, $http, $timeout, $filter, baseRemoteURL) {
    var muted = false;
    if(!muted) console.log('\n');
    $scope.factor = {};
    $scope.factor.id = angular.isDefined(ticketId)? ticketId: null;
    if(!muted) console.log('factorCtrl ticketId', ticketId);

    function getAvailableDependencies() {
        var url = baseRemoteURL+'factor/dependenciesData' + (ticketId > 0? '/'+ticketId: '');
        if(!muted) console.log('factorCtrl url', url);
        $http.get(url).success(function (data) {
            if(!muted) console.log('factorCtrl data', data);
            $scope.available = data.available;
            $scope.factor = data.factor;
            if($scope.factor && $scope.factor.id > 0) $scope.selected = data.factor.dependencies;
        });
    }

    getAvailableDependencies();

    function getList() {
        $http.get(baseRemoteURL+'factor/list').success(function(data) {
            $scope.factorList = data;
            $scope.filteredItems = $scope.factorList.length;
            $scope.currentPage = 1;
            $scope.entryLimit = 20;
            $scope.totalItems = $scope.factorList.length;
        });
    }
    getList();


    $scope.createFactorAjax = function () {
        var muted = true;
        if(!muted) console.log('\n');
        var factorData = {};
        //var factorDependencies = $scope.selected.map(function (obj) {
        //    return obj.customId;
        //});
        if(!muted) console.log('createAjax - dependencies', factorDependencies);
        factorData['dependencias'] = $scope.factor.dependencies;
        factorData['factor'] = $scope.factor.factor;
        //factorData['lowerLimit'] = $scope.factor.lowerLimit;
        //factorData['upperLimit'] = $scope.factor.upperLimit;
        factorData['descripcion'] = $scope.factor.descripcion;
        factorData['nombre'] = $scope.factor.nombre;
        factorData['id'] = $scope.factor.id;


        var url = baseRemoteURL + ($scope.factor.id > 0? 'factor/update/'+$scope.factor.id: 'factor/save');
        if(!muted) console.log('url '+url);
        if(!muted) console.log('factorData', factorData);
        function successAjax(data, status) {
            if(!muted) console.log('nuevo factor creado', data);
            var creaForma = $scope.createForm;
            if(status === 201 || status === 200) {
                //creaForma.generalInfo = ['El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')];
                $scope.alerts = [{type: 'success', msg: 'El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')}];
            }
        }
        function errorAjax(data, status, headers, config)  {
            $scope.createForm.generalInfo = [];
            angular.forEach($scope.createForm, function(item) {
                item.serverErrors = [];
            });
            if(!muted) console.log('error (' + status + '): ', data);
            var creaForma = $scope.createForm;
            if(status === 402 || status === 422) {
                var serverErrors = data.errors;
                angular.forEach(serverErrors, function (error) {
                    var field = error.field;
                    var message = error.message; if(!muted) console.log('field, message ' + field + '   '+message);
                    var rejectedVal = error['rejected-value'];
                    if (!angular.isArray(creaForma[field].serverErrors)) creaForma[field].serverErrors = [];
                    creaForma[field].serverErrors.push(message);
                });
            }
            if(status === 405) {if(!muted) console.log('createFactorAjax es 405');
                //creaForma.generalErrors = ['The specified HTTP method is not allowed for the requested' +
                //' resource.'];
                $scope.alerts = [{type: 'warning', msg: 'The specified HTTP method is not allowed for the' +
                ' requested'}];
            }
            else {
                //creaForma.generalErrors = ["Se recibi� un error "+status];
                $scope.alerts = [{type: 'danger', msg: 'Se recibi� un error '+status}];
            }
        }

        if($scope.factor.id > 0) {
            $http.put(baseRemoteURL+url, factorData)
                .success(successAjax)
                .error(errorAjax);
        }
        else {
            $http.post(baseRemoteURL+url, factorData)
                .success(successAjax)
                .error(errorAjax);
        }
    };


    $scope.addDepRow = function() {
        var muted = false;
        if(!muted) console.log('\n');
        if(!muted) console.log('addDepRow lastAdded', $scope.lastAdded);
        var newDep = {item: $scope.lastAdded, lowerLimit: '', upperLimit: '', step: 1};
        if(!muted) console.log('addDepRow newDep', newDep);
        if(!$scope.factor) $scope.factor = {dependencies: []};
        if(!angular.isArray($scope.factor.dependencies)) $scope.factor.dependencies = [];
        $scope.factor.dependencies.push(newDep);

        var idx = findWithAttr($scope.available, 'customId', $scope.lastAdded.customId);
        if(!muted) console.log('addDepRow idx', idx);
        if(!muted) console.log('addDepRow item', $scope.available[idx]);
        $scope.available.splice(idx-1, 1);

        $scope.lastAdded = null;
    };

    $scope.dropDep = function(idx) {
        var dropped = $scope.factor.dependencies[idx];
        if(!$scope.available) $scope.available = [];
        $scope.available.push(dropped.item);

        $scope.factor.dependencies.splice(idx, 1);
    };


    //$scope.$watch('createForm.lowerLimit.$valid', function(isValid, lastValue) {
    //    if(!isValid) {console.log('isValid', isValid, lastValue);
    //        $scope.factor.upperLimit = '';
    //        $scope.createForm.upperLimit.$dirty = true;
    //    }
    //});

    $scope.dragControlListeners = {
        accept: function (sourceItemHandleScope, destSortableScope) {
            return true
        },
        containment: '#dependencies-container',
        itemMoved: function(event) {
            //console.log('dragControl parent', event.dest.sortableScope.$parent);
            //console.log('dragControl sortableScope', event.dest.sortableScope);
            //console.log('dragControl status', event.dest.sortableScope.$parent);
            //event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
        }
    };

    //Para la tabla
    $scope.filter = function() {
        $timeout(function() {
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };

    $scope.sort_by = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };

    //Paginacion

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };

    //Alertas
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
}



//factorModule.config(['$routeProvider', function($routeProvider) {
//    $routeProvider.when('/factores', {
//        templateURL: 'factor/list-factor.html',
//        controller: 'FactorCtrl'
//    })
//}]);

factorModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/factores', {
        templateURL: 'calcular/dummy.html',
        controller: 'CalculadoraMainCtrl'
    });
}]);

calculadoraControllers.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
factorModule.controller('FactorCtrl', [function() {console.log('ASDFASDFASFDASF');}]);
factorModule.directive('dependsOn', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            //scope.$watch(scope.lowerLimit, function(newVal, oldVal) {
            //    console.log('directive dependsOn attr: ', attr);
            //    console.log('directive dependsOn element: ', elem);
            //    console.log('directive dependsOn scope: ', scope);
            //    console.log('directive dependsOn ctrl: ', ctrl);
            //    if(newVal >= attr.dependsOn) {
            //        console.log('ES VALIDO');
            //    }else {
            //        console.log('ES INVALIDO');
            //    }
            //});

            ctrl.$parsers.unshift(function(value) {
                var muted = true;
                if(!muted) console.log('\n');
                //console.log('directive PARSER dependsOn val: ', attr.dependsOn);
                //console.log('directive PARSER dependsOn element: ', elem);
                //console.log('directive PARSER dependsOn scope: ', scope);
                //console.log('directive PARSER dependsOn ctrl: ', ctrl);
                var valid = false;
                if(!muted) console.log('es numero', angular.isNumber(value));
                if(!muted) console.log('vacio', !value);
                if(!muted) console.log('undefined', angular.isUndefined(value));
                if(!muted) console.log('value', value);
                if(!muted) console.log('es mayor', value >= attr.dependsOn);
                if(!value || value >= attr.dependsOn) {
                    valid = true;
                }
                ctrl.$setValidity('range', valid);
                return valid? value: undefined;
            });
        }
    }
})



    .filter('startFrom', function() {
        return function(input, start) {
            if(input && input.length > 0) {
                start = +start; //parse to int
                return input.slice(start);
            }
            return [];
        }
    })



    .filter('customS', function() {
        return function(items, strin) {
            if(!strin) {
                return items;
            }
            var filtered = [];
            if(items && items.length>0) {
                for(var i=0; i < items.length; i++) {
                    var item = items[i];
                    if((item.nombre && ~item.nombre.toLowerCase().indexOf(strin))
                        || (item.descripcion && ~item.descripcion.toLowerCase().indexOf(strin))) {
                        filtered.push(item);
                    }
                }
            }
            return filtered;
        };
    });
