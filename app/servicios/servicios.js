
'use strict';

var serviciosModule = angular.module('servicios', ['ui.bootstrap', 'ngRoute']);


function findObjectByProperty(tree, propertyName, propertyValue) {
    var debug = 'debug';
    var result = null;
    var keepGoing = true;
    var idx;
    var childrenToLookUp = ['propiedades', 'conceptos', 'componentes'];
    var parents = [];
    if(angular.isObject(tree) && !angular.isArray(tree)) {
        if(tree[propertyName] === propertyValue) {
            return tree;
        }
        for(var i=0; i<childrenToLookUp.length; i++) {
            if(!angular.isDefined(tree[childrenToLookUp[i]])) {
                continue;
            }
            var key = childrenToLookUp[i];
            var value = tree[childrenToLookUp[i]];
        //angular.forEach(tree, function(key, value) {
            if(keepGoing) {
                if(angular.isObject(value) && !angular.isArray(value)) {
                    var partialResult = findObjectByProperty(value, propertyName, propertyValue);
                    if(partialResult.result) {
                        result = partialResult.result;
                        parents.push(value);
                        parents = parents.concat(partialResult.parents);
                        keepGoing = false;
                    }
                }
                else if(angular.isArray(value)) {
                    idx = findWithAttr(value, propertyName, propertyValue);
                    if(idx > 0) {
                        result = value[idx-1];
                        //parents.push(key);
                        keepGoing = false;
                    }
                    else {
                        angular.forEach(value, function(item) {
                            if(keepGoing) {
                                var partialResult = findObjectByProperty(item, propertyName, propertyValue);
                                if(partialResult.result) {
                                    result = partialResult.result;
                                    parents.push(item);
                                    parents = parents.concat(partialResult.parents);
                                    keepGoing = false;
                                }
                            }
                        });
                    }
                }
            }
            else {
                break;
            }
        //});
        }
    }
    else if(angular.isArray(tree)) {
        idx = findWithAttr(tree, propertyName, propertyValue);
        if(idx > 0) {
            result = tree[idx-1];
            keepGoing = false;
        }
        else {
            angular.forEach(tree, function(item) {
                if(keepGoing) {
                    var partialResult = findObjectByProperty(item, propertyName, propertyValue);
                    if(partialResult.result) {
                        result = partialResult.result;
                        parents.push(item);
                        parents = parents.concat(partialResult.parents);
                        keepGoing = false;
                    }
                }
            });
        }
    }
    else {
        var debugg = 'debug';
    }
    return {result: result, parents: parents};
}


function serviciosController($scope, $http, baseRemoteURL, $routeParams, $location) {
    var muted = true;
    if(!muted) console.log('\n');

    $scope.editableProperties = ['descripcion'];
    var selectedItemId = angular.isDefined($routeParams.selectedId)? $routeParams.selectedId: null;


    var getAllData = function() {
        var muted = true;
        if(!muted) console.log('\n');
        $http.get(baseRemoteURL+'calculadora/list')
            .success(function(data){
                if(!muted) console.log('getAllData data', data);
                $scope.children = data.categories;
                $scope.allItems = data.categories;
                if(selectedItemId) {
                    var pointer = findObjectByProperty($scope.allItems, 'customId', selectedItemId);
                    $scope.currentSelection = pointer.result;
                    $scope.currentParents = pointer.parents;
                }
                else {
                    $scope.currentSelection = $scope.allItems;
                    $scope.currentParents = [];
                }
                $scope.categories = data.categories;
                if(!$scope.currentSelection) {
                    $location.path('/servicios');
                }
                var ingSitioItem = findObjectByProperty($scope.allItems, 'customId', 'ingenieria_en_sitio');
                $scope.rolesName = ingSitioItem.result.componentes? ingSitioItem.result.componentes.map(function(item) {return item.customId;}): [];
                var debug = 'debug';
        }).error(function(data, status) {
                $scope.alerts = [{type: 'danger', message: 'Algo pasó... y no debió pasar'}];
            });
    };
    getAllData();


    var listPropertyTypes = function() {
        $http.get(baseRemoteURL+'propiedad/listTypes')
            .success(function(data) {
                $scope.propertyTypes = data;
            })
            .error(function(data, status) {
                $scope.alerts = [{type: 'danger', message: 'Algo pasó... y no debió pasar. Al obtener la lista de' +
                ' tipos de propiedades'}];
            });
    };
    listPropertyTypes();

    $scope.getChildren = function(item) {
        if(!item) return [];
        var children = [];
        if(angular.isArray(item)) {
            children = item;
        }
        else {
            if (angular.isArray(item.componentes)) {
                children = children.concat(item.componentes);
            }
            if (angular.isArray(item.conceptos)) {
                children = children.concat(item.conceptos);
            }
        }
        return children;
    };

    $scope.isRoot = function() {
        var basura = angular.equals($scope.currentSelection, $scope.allItems);
        //var algo = true;
        //var otro = true;
        //for(var i=0; i<$scope.currentSelection.length; i++) {
        //    algo = $scope.currentSelection[i] === $scope.allItems[i];
        //    otro = angular.equals($scope.currentSelection[i], $scope.allItems[i]);
        //    var asdf = 'asdf';
        //}
        return basura;
    };

    if(!muted) console.log('cms.controllers - children', $scope.categories);

    $scope.showChildren = function(item, property) {
        var muted = true;
        if(!muted) console.log('\n');
        if(!muted) console.log('showChildren item', item);
        if(!property)
            property = ['componentes', 'conceptos'];
        if(!muted) console.log('showChildren property', property);
        var childrens = [];
        angular.forEach(property, function(prop) {
            if(angular.isDefined(item) && angular.isArray(item[prop])) children.push.apply(children, item[prop]);
        });
        if(!muted) console.log('showChildren children', children);
        //return children;
        $scope.children = children;
        if(!angular.isArray($scope.currentSelection))
            $scope.currentSelection = [];
        var brdcrmbIndx = $scope.currentSelection.indexOf(item);
        if(brdcrmbIndx > -1)
            $scope.currentSelection.splice(brdcrmbIndx+1, $scope.currentSelection.length - brdcrmbIndx);
        else
            $scope.currentSelection.push(item);
        $scope.selected = item;
        if(!muted) console.log('showChildren scope.selected', $scope.selected);
    };

    $scope.resetView = function() {
        $scope.currentSelection = [];
        $scope.children = $scope.categories;
        $scope.selected = undefined;
    };

    $scope.goBackTill = function(item) {

    };

    $scope.showPropForm = function() {
        $scope.addingProperty = true;
    };

    $scope.cancelProp = function() {
        $scope.addingProperty = false;
        $scope.newProp = null;
    };

    $scope.addProp = function(item) {
        var muted = true;
        if(!muted) console.log('\n');
        var newProp = $scope.newProperty;
        if(!newProp) return;
        newProp.parent = $scope.currentSelection;
        if(!muted) console.log('newProp '+ newProp);
        $scope.propertyAlerts = [];

        $http.post(baseRemoteURL+"propiedad/save", newProp)
            .success(function(data) {
                item.propiedades.push(data);
                $scope.newProp = null;
                $scope.newProperty = undefined;
                $scope.addingProperty = false;
                $scope.newPropertyForm.$setPristine();
            })
            .error(function(data, status) {
                var muted = true;
                angular.forEach($scope.newPropertyForm, function(itemForm) {
                    if(itemForm && angular.isObject(itemForm))
                        itemForm.serverErrors = [];
                });
                if(!muted) console.log('error (' + status + '): ', data);
                var creaForma = $scope.newPropertyForm;
                if(status === 402 || status === 422) {
                    var serverErrors = data.errors;
                    angular.forEach(serverErrors, function (error) {
                        var field = error.field;
                        var message = error.message; if(!muted) console.log('field, message ' + field + '   '+message);
                        var rejectedVal = error['rejected-value'];
                        if(!creaForma[field]) {
                            //creaForma[field] = {};
                            if(!$scope.propertyAlerts || !angular.isArray($scope.propertyAlerts))
                                $scope.propertyAlerts = [];
                            $scope.propertyAlerts.push({type: 'danger', msg: message});
                        }
                        else {
                            if (!angular.isArray(creaForma[field].serverErrors)) creaForma[field].serverErrors = [];
                            creaForma[field].serverErrors.push(message);
                            creaForma[field].$setValidity('server', false);
                            creaForma[field].$setDirty(true);
                        }
                    });
                }
                else if(status === 405) {if(!muted) console.log('createFactorAjax es 405');
                    //creaForma.generalErrors = ['The specified HTTP method is not allowed for the requested' +
                    //' resource.'];
                    $scope.propertyAlerts = [{type: 'warning', msg: 'The specified HTTP method is not allowed for the' +
                    ' requested'}];
                }
                else {
                    //creaForma.generalErrors = ["Se recibi? un error "+status];
                    $scope.propertyAlerts = [{type: 'danger', msg: 'Se recibi? un error '+status}];
                }
            });
    };

    $scope.dropProperty = function(item, parent) {
        var muted = true;
        if(!muted) console.log('\n');
        $http.delete(baseRemoteURL+"propiedad/delete", {data: item})
            .success(function(data) {
                if(!muted) console.log('dropProperty data', data);
                var idx = findWithAttr($scope.currentSelection.propiedades, 'customId', item.customId);
                if(idx > 0) {
                    $scope.currentSelection.propiedades.splice(idx-1, 1);
                }
            })
            .error(function(data, status) {
                if(!muted) console.log('dropProperty (ERROR) status ' + status + '  data ', data);
            });
    };

    $scope.addItem = function(newItem) {
        if(!newItem) {
            console.log("********* No hay datos en el nuevo elemento a agregar");
            return;
        }
        var muted = true;
        if(!muted) console.log('\n');
        $scope.newItem.parent = $scope.isRoot() ? undefined : $scope.currentSelection;
        var newData = $scope.newItem;
        $http.post(baseRemoteURL+"calculadora/addItem", newData)
            .success(function(data) {
                if(!muted) console.log('addItem data', data);
                $scope.categories = data.categories;
                $scope.allItems = data.categories;
                $scope.children = data.children;
                if(data.newItem) {
                    $scope.newItem = undefined;
                    if(data.newItem.domainClass.toLowerCase() === 'categoria') {
                        $scope.currentSelection.push(data.newItem);
                    }
                    else if(data.newItem.domainClass.toLowerCase() === 'concepto') {
                        $scope.currentSelection.conceptos.push(data.newItem);
                    }
                    else if(data.newItem.domainClass.toLowerCase() === 'conceptoespecial') {
                        $scope.currentSelection.componentes.push(data.newItem);
                    }
                    else if(data.newItem.domainClass.toLowerCase() === 'propiedad') {
                        $scope.currentSelection.propiedades.push(data.newItem);
                    }
                }
                if(angular.isDefined($scope.$$childHead.newItemForm)) $scope.$$childHead.newItemForm.$setPristine();
                else if(angular.isDefined($scope.newItemForm)) $scope.newItemForm.$setPristine();
                else {if(!muted) console.log('addItem NO PUEDE RESETEAR FORM');}

        });
    };

    $scope.removeChild = function(item) {
        var muted = true;
        if(!muted) console.log('\n');
        if(!muted) console.log('removeChild item', item);
        var delData = {item: item, parent: $scope.isRoot()? undefined: $scope.currentSelection};
        if(!muted) console.log('removeChild delData', delData);

        $http.delete(baseRemoteURL+"calculadora/deleteItem", {data: delData})
            .success(function(data) {
                if(!muted) console.log('removeChild data', data);
                if(item) {
                    var idx;
                    if(!$scope.isRoot()) {
                        if (!muted) console.log('removeChild selected', $scope.currentSelection);
                        var foundObject = findObjectByProperty($scope.allItems, 'customId', $scope.currentSelection.customId);
                        var parent = foundObject? foundObject.result: undefined;
                        if(!parent) {
                            console.log('*********** Padre no encontrado');
                            return;
                        }
                        if(parent.domainClass.toLowerCase() === 'categoria' && item.domainClass.toLowerCase() === 'concepto') {
                            idx = findWithAttr(parent.conceptos, 'customId', item.customId);
                            if(idx > 0) {
                                parent.conceptos.splice(idx-1, 1);
                                $scope.currentSelection.conceptos.splice(idx-1, 1);
                            }
                        }
                        else if(parent.domainClass.toLowerCase() === 'categoria' && item.domainClass.toLowerCase() === 'conceptoespecial') {
                            idx = findWithAttr(parent.componentes, 'customId', item.customId);
                            if(idx > 0) {
                                parent.componentes.splice(idx-1, 1);
                                $scope.currentSelection.componentes.splice(idx-1, 1);
                            }
                        }
                        else if(parent.domainClass.toLowerCase() === 'conceptoespecial' && item.domainClass.toLowerCase() === 'concepto') {
                            idx = findWithAttr(parent.conceptos, 'customId', item.customId);
                            if(idx > 0) {
                                parent.conceptos.splice(idx-1, 1);
                                $scope.currentSelection.conceptos.splice(idx-1, 1);
                            }
                        }
                        else if(parent.domainClass.toLowerCase() === 'conceptoespecial' && item.domainClass.toLowerCase() === 'propiedad') {
                            idx = findWithAttr(parent.propiedades, 'customId', item.customId);
                            if(idx > 0) {
                                parent.propiedades.splice(idx-1, 1);
                                $scope.currentSelection.propiedades.splice(idx-1, 1);
                            }
                        }
                    }
                    else {
                        idx = findWithAttr($scope.allItems, 'customId', item.customId);
                        if(idx > 0) {
                            //$scope.allItems.splice(idx-1, 1);
                            $scope.currentSelection.splice(idx-1, 1);
                        }
                    }
                }
            });
    };

    $scope.updateVisibility = function(item) {
        $http.put(baseRemoteURL+'item/update', item)
            .success(function(data, status) {
                $scope.alerts = data;
                if(status === 201 || status === 200) {
                    $scope.alerts = [{type: 'success', msg: 'El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')}];
                }
            })
            .error(function(data) {

            });
    };

    $scope.updateGenerals = function(item) {
        $http.put(baseRemoteURL+'item/update', item)
            .success(function(data, status) {
                //$scope.alerts = data;
                if(status === 201 || status === 200) {
                    $scope.alerts = [{type: 'success', msg: 'El elemento con id '+data.id+' fue '+(status === 201? 'creado': 'actualizado')}];
                }
            })
            .error(function(data, status) {
                var muted = true;
                $scope.generalesForm.generalInfo = [];
                angular.forEach($scope.generalesForm, function(item) {
                    item.serverErrors = [];
                });
                if(!muted) console.log('error (' + status + '): ', data);
                var creaForma = $scope.generalesForm;
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
                    //creaForma.generalErrors = ["Se recibi? un error "+status];
                    $scope.alerts = [{type: 'danger', msg: 'Se recibi? un error '+status}];
                }
            });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.closeAlert2 = function(index) {
        $scope.propertyAlerts.splice(index, 1);
    };

    $scope.isIn = function(item, array) {
        return isIn(item, array);
    };
}


serviciosModule.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
serviciosModule.controller('ServiciosCtrl', function($scope, $http, baseRemoteURL, $routeParams, $location) {serviciosController($scope, $http, baseRemoteURL, $routeParams, $location);});
serviciosModule.directive('noSubmit', function() {

});
