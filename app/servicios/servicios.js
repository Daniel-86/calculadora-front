
'use strict';

var serviciosModule = angular.module('servicios', ['ui.bootstrap', 'ngRoute']);


function findObjectByProperty(tree, propertyName, propertyValue) {
    var debug = 'debug';
    var result = null;
    var keepGoing = true;
    var idx;
    var childrenToLookUp = ['propiedades', 'conceptos', 'componentes'];
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
                    if(partialResult) {
                        result = partialResult;
                        keepGoing = false;
                    }
                }
                else if(angular.isArray(value)) {
                    idx = findWithAttr(value, propertyName, propertyValue);
                    if(idx > 0) {
                        result = value[idx-1];
                        keepGoing = false;
                    }
                    else {
                        angular.forEach(value, function(item) {
                            if(keepGoing) {
                                var partialResult = findObjectByProperty(item, propertyName, propertyValue);
                                if(partialResult) {
                                    result = partialResult;
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
                    if(partialResult) {
                        result = partialResult;
                        keepGoing = false;
                    }
                }
            });
        }
    }
    else {
        var debugg = 'debug';
    }
    return result;
}


function serviciosController($scope, $http, baseRemoteURL, $routeParams) {
    var muted = false;
    if(!muted) console.log('\n');

    $scope.editableProperties = ['descripcion'];
    var selectedItemId = angular.isDefined($routeParams.selectedId)? $routeParams.selectedId: null;


    var getAllData = function() {
        var muted = false;
        if(!muted) console.log('\n');
        $http.get(baseRemoteURL+'calculadora/list').success(function(data){
            if(!muted) console.log('getAllData data', data);
            $scope.children = data.categories;
            $scope.allItems = data.categories;
            if(selectedItemId) {
                $scope.currentSelection = findObjectByProperty($scope.allItems, 'customId', selectedItemId)
            }
            else {
                $scope.currentSelection = $scope.allItems;
            }
            $scope.categories = data.categories;
        });
    };
    getAllData();

    if(!muted) console.log('cms.controllers - children', $scope.categories);

    $scope.showChildren = function(item, property) {
        var muted = false;
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
        if(!angular.isArray($scope.tree))
            $scope.tree = [];
        var brdcrmbIndx = $scope.tree.indexOf(item);
        if(brdcrmbIndx > -1)
            $scope.tree.splice(brdcrmbIndx+1, $scope.tree.length - brdcrmbIndx);
        else
            $scope.tree.push(item);
        $scope.selected = item;
        if(!muted) console.log('showChildren scope.selected', $scope.selected);
    };

    $scope.resetView = function() {
        $scope.tree = [];
        $scope.children = $scope.categories;
        $scope.selected = undefined;
    };

    $scope.goBackTill = function(item) {

    };

    $scope.showPropForm = function() {
        $scope.newProperty = true;
    };

    $scope.cancelProp = function() {
        $scope.newProperty = false;
        $scope.newProp = null;
    };

    $scope.addProp = function(item) {
        var muted = false;
        if(!muted) console.log('\n');
        var newProp = {customId: $scope.newPropNombre, descripcion: $scope.newPropDescripcion, tipo: $scope.newPropTipo, parent: $scope.selected};
        if(!muted) console.log('newProp '+ newProp);

        $http.post(baseRemoteURL+"propiedad/save", newProp)
            .success(function(data) {
                item.propiedades.push(data);
                $scope.newProp = null;
            })
            .error(function(data) {

            });
    };

    $scope.dropProperty = function(item, parent) {
        var muted = false;
        if(!muted) console.log('\n');
        $http.delete(baseRemoteURL+"propiedad/delete", {data: item})
            .success(function(data) {
                if(!muted) console.log('dropProperty data', data);
            })
            .error(function(data, status) {
                if(!muted) console.log('dropProperty (ERROR) status ' + status + '  data ', data);
            });
    };

    $scope.addItem = function() {
        var muted = false;
        if(!muted) console.log('\n');
        var newData = {item: $scope.selected, descripcion: $scope.descripcion, customId: $scope.customId, domainType: $scope.domainType};
        $http.post(baseRemoteURL+"calculadora/addItem", newData).success(function(data) {
            if(!muted) console.log('addItem data', data);
            $scope.categories = data.categories;

            //$scope.showChildren($scope.selected);

            if(angular.isDefined($scope.selected)) {
                $scope.selected = data.newItem;
                var childrens = [];
                angular.forEach(['componentes', 'conceptos'], function(prop) {
                    if(angular.isDefined($scope.selected) && angular.isArray($scope.selected[prop])) children.push.apply(children, $scope.selected[prop]);
                });
                if(!muted) console.log('addItem children', children);
                $scope.children = children;
                var idxTree = findWithAttr($scope.tree, 'id', $scope.selected.id);
                $scope.tree[idxTree-1] = $scope.selected;
            }
            else {
                $scope.children = data.children;
            }
            if(!muted) console.log('adDItem - children', $scope.children);
            $scope.descripcion = '';
            $scope.customId = '';
            if(!muted) console.log('addItem scope', $scope);
            if(!muted) console.log('addItem newItemForm', $scope.newItemForm);
            if(angular.isDefined($scope.$$childHead.newItemForm)) $scope.$$childHead.newItemForm.$setPristine();
            else if(angular.isDefined($scope.newItemForm)) $scope.newItemForm.$setPristine();
            else {if(!muted) console.log('addItem NO PUEDE RESETAR FORM');}
        });
    };

    $scope.removeChild = function(idxChild) {
        var muted = false;
        if(!muted) console.log('\n');
        var item = $scope.children[idxChild];
        if(!muted) console.log('removeChild item', item);
        var delData = {item: item, parent: $scope.selected};
        if(!muted) console.log('removeChild delData', delData);

        $http.delete(baseRemoteURL+"calculadora/deleteItem", {data: delData})
            .success(function(data) {
                if(!muted) console.log('removeChild data', data);
                if(item) {
                    if($scope.selected) {
                        if (!muted) console.log('removeChild selected', $scope.selected);
                        var isA = 'unknown';
                        var parentIdx = findWithAttr($scope.tree, 'id', $scope.selected.id);
                        if (!muted) console.log('removeChild tree', $scope.tree);
                        if (!muted) console.log('removeChild parentIdx', parentIdx - 1);
                        var parent = $scope.tree[parentIdx - 1];
                        if (!muted) console.log('removeChild parent', parent);
                    }
                    var realIdx;
                    if(parent) {
                        if ((realIdx = findWithAttr(parent.componentes, 'customId', item.customId)) >= 0) {
                            isA = 'componentes';
                        }
                        else if ((realIdx = findWithAttr(parent.conceptos, 'customId', item.customId)) >= 0) {
                            isA = 'conceptos';
                        }
                        if (!muted) console.log('removeChild idxChild ' + idxChild + '  isA ' + isA + '  parentIdx ' + parentIdx - 1 + '   realIdx ' + realIdx - 1);
                        if (!muted) console.log('removeChild selected', $scope.selected[isA][realIdx - 1]);
                        $scope.selected[isA].splice(realIdx - 1, 1);
                        if (!muted) console.log('removeChild tree', $scope.tree[parentIdx - 1][isA][realIdx - 1]);
                        $scope.tree[parentIdx - 1][isA].splice(realIdx - 1, 1);
                    }
                    if(!muted) console.log('removeChild children', $scope.children[idxChild]);
                    $scope.children.splice(idxChild, 1);
                }
            });
    };
}


serviciosModule.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
serviciosModule.controller('ServiciosCtrl', function($scope, $http, baseRemoteURL, $routeParams) {serviciosController($scope, $http, baseRemoteURL, $routeParams);});