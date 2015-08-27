
'use strict';

var ticketModule = angular.module('ticket', ['as.sortable', 'ui.bootstrap', 'ngRoute']);

function ticketCtrl ($scope, $http, $timeout, $filter, baseRemoteURL, $routeParams, $location) {
    var muted = false;
    if(!muted) console.log('\n');
    $scope.ticket = {};
    $scope.ticket.id = angular.isDefined($routeParams.ticketId)? $routeParams.ticketId: null;
    if(!muted) console.log('ticketCtrl ticketId', $routeParams.ticketId);

    function getAvailableDependencies() {
        var url = baseRemoteURL+'ticket/dependenciesData' + ($scope.ticket.id > 0? '/'+$scope.ticket.id: '');
        if(!muted) console.log('ticketCtrl url', url);
        $http.get(url).success(function (data) {
            if(!muted) console.log('ticketCtrl data', data);
            $scope.available = data.available;
            $scope.ticket = data.ticket;
            if($scope.ticket && $scope.ticket.id > 0) $scope.selected = data.ticket.dependencies;
        });
    }

    getAvailableDependencies();

    function getList() {
        $http.get(baseRemoteURL+'ticket/list').success(function(data) {
            $scope.ticketList = data;
            $scope.filteredItems = $scope.ticketList.length;
            $scope.currentPage = 1;
            $scope.entryLimit = 20;
            $scope.totalItems = $scope.ticketList.length;
        });
    }
    getList();


    $scope.createTicketAjax = function () {
        var muted = true;
        if(!muted) console.log('\n');
        var ticketData = {};
        //var ticketDependencies = $scope.selected.map(function (obj) {
        //    return obj.customId;
        //});
        if(!muted) console.log('createAjax - dependencies', ticketDependencies);
        ticketData['dependencias'] = $scope.ticket.dependencies;
        ticketData['cc'] = $scope.ticket.cc;
        ticketData['es'] = $scope.ticket.es;
        ticketData['acs'] = $scope.ticket.acs;
        ticketData['rq'] = $scope.ticket.rq;
        //ticketData['lowerLimit'] = $scope.ticket.lowerLimit;
        //ticketData['upperLimit'] = $scope.ticket.upperLimit;
        ticketData['descripcion'] = $scope.ticket.descripcion;
        ticketData['nombre'] = $scope.ticket.nombre;
        ticketData['id'] = $scope.ticket.id;


        var url = baseRemoteURL + ($scope.ticket.id > 0? 'ticket/update/'+$scope.ticket.id: 'ticket/save');
        if(!muted) console.log('url '+url);
        if(!muted) console.log('ticketData', ticketData);
        function successAjax(data, status) {
            if(!muted) console.log('nuevo ticket creado', data);
            var creaForma = $scope.createForm;
            if(status === 201 || status === 200) {
                //creaForma.generalInfo = ['El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')];
                $scope.alerts = [{type: 'success', msg: 'El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')}];
                $location.path('/ticket/'+data.id);
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
            if(status === 405) {if(!muted) console.log('createTicketAjax es 405');
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

        if($scope.ticket.id > 0) {
            $http.put(url, ticketData)
                .success(successAjax)
                .error(errorAjax);
        }
        else {
            $http.post(url, ticketData)
                .success(successAjax)
                .error(errorAjax);
        }
    };

    $scope.deleteTicket = function(idx) {
        if(angular.isArray($scope.ticketList)) {
            var delData = {item: $scope.ticketList[idx]};
            if(!delData) {
                return;
            }
            $http.delete(baseRemoteURL+'ticket/delete/'+delData.item.id)
                .success(function(data) {
                    console.log('deleteTicket elemento '+delData.item.id+' ha sido eliminado');
                    $scope.ticketList.splice(idx, 1);
                })
                .error(function(data) {});
            //$http.delete(baseRemoteURL+'ticket/delete', {data: delData, params: delData.id})
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
        if(!$scope.ticket) $scope.ticket = {dependencies: []};
        if(!angular.isArray($scope.ticket.dependencies)) $scope.ticket.dependencies = [];
        $scope.ticket.dependencies.push(newDep);

        var idx = findWithAttr($scope.available, 'customId', $scope.lastAdded.customId);
        if(!muted) console.log('addDepRow idx', idx);
        if(!muted) console.log('addDepRow item', $scope.available[idx]);
        $scope.available.splice(idx-1, 1);

        $scope.lastAdded = null;
    };

    $scope.dropDep = function(idx) {
        var dropped = $scope.ticket.dependencies[idx];
        if(!$scope.available) $scope.available = [];
        $scope.available.push(dropped.item);

        $scope.ticket.dependencies.splice(idx, 1);
    };


    //$scope.$watch('createForm.lowerLimit.$valid', function(isValid, lastValue) {
    //    if(!isValid) {console.log('isValid', isValid, lastValue);
    //        $scope.ticket.upperLimit = '';
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


ticketModule.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
ticketModule.controller('TicketCtrl', function($scope, $http, $timeout, $filter, baseRemoteURL, $routeParams, $location) {ticketCtrl($scope, $http, $timeout, $filter, baseRemoteURL, $routeParams, $location)});
//ticketModule.directive('dependsOn', function() {
//    return {
//        restrict: 'A',
//        require: 'ngModel',
//        link: function(scope, elem, attr, ctrl) {
//
//            ctrl.$parsers.unshift(function(value) {
//                var muted = false;
//                if(!muted) console.log('\n');
//                if(!muted) console.log('Ticket dependsOn');
//                var valid = false;
//                if(!muted) console.log('es numero', angular.isNumber(value));
//                if(!muted) console.log('vacio', !value);
//                if(!muted) console.log('undefined', angular.isUndefined(value));
//                if(!muted) console.log('value', value);
//                if(!muted) console.log('es mayor', value >= attr.dependsOn);
//                if(!value || value >= attr.dependsOn) {
//                    valid = true;
//                }
//                ctrl.$setValidity('range', valid);
//                return valid? value: undefined;
//            });
//        }
//    }
//});



    ticketModule.filter('startFrom', function() {
        return function(input, start) {
            if(input && input.length > 0) {
                start = +start; //parse to int
                return input.slice(start);
            }
            return [];
        }
    });



    ticketModule.filter('customS', function() {
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
