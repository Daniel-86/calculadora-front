
'use strict';

var factorModule = angular.module('factor', ['as.sortable', 'ui.bootstrap', 'ngRoute', 'angularHelpOverlay']);

function factorCtrl ($scope, $http, $timeout, $filter, baseRemoteURL, $routeParams, $location) {
    var muted = false;
    if(!muted) console.log('\n');
    $scope.factor = {};
    $scope.factor.id = angular.isDefined($routeParams.factorId)? $routeParams.factorId: null;
    if(!muted) console.log('factorCtrl factorId', $routeParams.factorId);

    function getAvailableDependencies() {
        var url = baseRemoteURL+'factor/dependenciesData' + ($scope.factor.id > 0? '/'+$scope.factor.id: '');
        var requestedId = $scope.factor.id;
        if(!muted) console.log('factorCtrl url', url);
        $http.get(url).success(function (data) {
            if(!muted) console.log('factorCtrl data', data);
            $scope.available = data.available;
            $scope.available = data.available.filter(function (element) {
                return element.eligible && element.visible;
            });
            $scope.factor = data.factor;
            if($scope.factor && $scope.factor.id > 0) $scope.selected = data.factor.dependencies;
            else if(requestedId) {$location.path('/factor');}
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
        //if(!muted) console.log('createAjax - dependencies', factorDependencies);
        factorData['dependencias'] = $scope.factor.dependencies;
        factorData['factor'] = $scope.factor.factor;
        //factorData['lowerLimit'] = $scope.factor.lowerLimit;
        //factorData['upperLimit'] = $scope.factor.upperLimit;
        factorData['descripcion'] = $scope.factor.descripcion;
        factorData['nombre'] = $scope.factor.nombre;
        factorData['id'] = $scope.factor.id;
        factorData['target'] = $scope.factor.target;


        var url = baseRemoteURL + ($scope.factor.id > 0? 'factor/update/'+$scope.factor.id: 'factor/save');
        if(!muted) console.log('url '+url);
        if(!muted) console.log('factorData', factorData);
        function successAjax(data, status) {
            if(!muted) console.log('nuevo factor creado', data);
            var creaForma = $scope.createForm;
            if(status === 201 || status === 200) {
                //creaForma.generalInfo = ['El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')];
                $scope.alerts = [{type: 'success', msg: 'El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')}];
                $location.path('/factor/'+data.id);
            }
        }
        function errorAjax(data, status, headers, config)  {
            $scope.createForm.generalInfo = [];
            //angular.forEach($scope.createForm, function(item) {
            //    if(item) item.serverErrors = [];
            //});
            if(!muted) console.log('error (' + status + '): ', data);
            var creaForma = $scope.createForm;
            if(status === 402 || status === 422) {
                var serverErrors = data.errors;
                angular.forEach(serverErrors, function (error) {
                    var field = error.field;
                    var message = error.message; if(!muted) console.log('field, message ' + field + '   '+message);
                    var rejectedVal = error['rejected-value'];
                    if(!creaForma[field]) {
                        if(!$scope.alerts) $scope.alerts = [];
                        $scope.alerts.push({type: 'danger', msg: error.message});
                    }
                    else {
                        if (!angular.isArray(creaForma[field].serverErrors)) creaForma[field].serverErrors = [];
                        creaForma[field].serverErrors.push(message);
                    }
                });
            }
            else if(status === 405) {if(!muted) console.log('createFactorAjax es 405');
                //creaForma.generalErrors = ['The specified HTTP method is not allowed for the requested' +
                //' resource.'];
                $scope.alerts = [{type: 'warning', msg: 'The specified HTTP method is not allowed for the' +
                ' requested'}];
            }
            else if(status === 404) {
                $location.path('/factores');
            }
            else {
                if(!angular.isArray($scope.alerts)) $scope.alerts = [];
                $scope.alerts.push({type: 'danger', msg: 'Se recibió un error '+status});
            }
        }

        if($scope.factor.id > 0) {
            $http.put(url, factorData)
                .success(successAjax)
                .error(errorAjax);
        }
        else {
            $http.post(url, factorData)
                .success(successAjax)
                .error(errorAjax);
        }
    };

    $scope.deleteFactor = function(idx) {
        if(angular.isArray($scope.factorList)) {
            var delData = {item: $scope.factorList[idx]};
            if(!delData) {
                return;
            }
            $http.delete(baseRemoteURL+'factor/delete/'+delData.item.id)
                .success(function(data) {
                    console.log('deleteFactor elemento '+delData.item.id+' ha sido eliminado');
                    $scope.factorList.splice(idx, 1);
                })
                .error(function(data) {});
            //$http.delete(baseRemoteURL+'factor/delete', {data: delData, params: delData.id})
            //    .success(function(data) {})
            //    .error(function(data) {});
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


    $scope.countableDeps = function(depsList) {
        if(!angular.isArray(depsList)) return 0;
        return depsList.reduce(function(count, dep, idx) {
            if(!dep.item.single) count++;
            return count;
        }, 0);
    };

    $scope.watchDeps = function(depsList) {
        if(!angular.isArray(depsList)) return false;
        var multipleCount = depsList.reduce(function(acc, item, idx) {
            if(item.lowerLimit) {
                acc++;
            }
            return acc;
        }, 0);
        $scope.multipleError = multipleCount > 1;
        //if(newVal != '' && $scope.multipleCount > 1) {
        //    $scope.multipleError = true;
        //}
        var afwef = 0;
    };

    $scope.watchEmpty = function (item) {
        if(!item.lowerLimit) item.upperLimit = null;
    };

    $scope.isFormOk = function(form, item) {
        if(!item) return false;
        if(!angular.isArray(item.dependencies)) return false;
        if(item.dependencies.length < 1) return false;
        return form.$valid && form.$dirty;
    };

    $scope.toggleHelp = function() {
        $scope.showHelp = !$scope.showHelp;
    };
}


factorModule.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
factorModule.controller('FactorCtrl', function($scope, $http, $timeout, $filter, baseRemoteURL, $routeParams, $location) {factorCtrl($scope, $http, $timeout, $filter, baseRemoteURL, $routeParams, $location)});
factorModule.directive('dependsOn', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            ctrl.$parsers.unshift(function(value) {
                var muted = false;
                if(!muted) console.log('\n');
                if(!muted) console.log('Factor dependsOn');
                var valid = false;
                value = Number(value);
                if(!muted) console.log('typeof value', typeof value);
                if(!muted) console.log('es numero', angular.isNumber(value));
                if(!muted) console.log('vacio', !value);
                if(!muted) console.log('undefined', angular.isUndefined(value));
                if(!muted) console.log('value', value);
                if(!muted) console.log('dependsOn', attr.dependsOn);
                if(!muted) console.log('es mayor', value >= attr.dependsOn);
                if(!value || value >= attr.dependsOn) {
                    valid = true;
                }
                ctrl.$setValidity('range', valid);
                return valid? value: undefined;
            });
        }
    };
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


factorModule.filter('garanteeOneMultiple', function() {
    return function (list, count) {
        var asdf = 0;
        if(count > 0) {
            return list.filter(function(element) {
                return element.single;
            });
        }
        else
            return list;
    }
});
