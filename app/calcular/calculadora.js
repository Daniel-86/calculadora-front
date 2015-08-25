//= require_self
'use strict';

var calculadoraControllers = angular.module('calculadora', ['checklist-model', 'toggle-switch', 'ui.bootstrap', 'ngRoute', 'angularSpinner']);

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


function mainCtrl($scope, $http, baseRemoteURL, $filter, $sce, companySizeOptions, usSpinnerService) {

    var model = {
        chosen: [],
        resultados: null,
        openedCategory: {},
        chosenObj: {}
    };
    function getCategoryList() {
        var muted = true; if(!muted) console.log('\n');
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


    var muted = true; if(!muted) console.log('\n');

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
        var muted = true;
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
        return $scope.resutlados;
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
        $scope.deviceScopeChanged(item);
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
            item.deviceRange = {min:0, max:item.currentScope};
        }
        if(!item.rValue) item.rValue = [];
        item.currentSelection = item.rValue[item.deviceRange.min];
        $scope.applyToChanged(item);
        if(item.isFullSelected) $scope.updateSelections(item);
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
        var muted = true;
        if(!muted) console.log('\n');
        if($scope.tempSelected && angular.isArray($scope.tempSelected.propiedades)) {
            if (!muted) console.log('currentPoperties tempSelected', $scope.tempSelected);
            return $scope.tempSelected.propiedades;
        }
        return [];
    };

    $scope.anyValuedChild = function(item) {
        if(!item) return false;
        if(item.domainClass.toLowerCase() === 'categoria') {
            if(item.rValue) return item.rValue;
            return item.componentes.some(function(e) {
                if(e.rValue) return true;
                return e.propiedades.some(function(p) {
                    return p.rValue;
                });
            });
        }
        else if(item.domainClass.toLowerCase() === 'conceptoespecial') {
            return item.propiedades.some(function(p) {
                return p.rValue;
            });
        }
        else if(item.domainClass.toLowerCase() === 'propiedad') {
            return item.rValue;
        }
    };

    $scope.getDeviceCounts = function(item) {
        var data = formatData(item);
        var cantidades = {};
        angular.forEach(data, function(item) {
           if(item.count > 0)  {

           }
            for(var i=0; i<item.selection.length; i++) {
                cantidades[item.selection[i]] = item.count;
            }
        });
        return data;
    };


    $scope.basura = function(item) {
        var data =  $scope.getDeviceCounts(item.rValue);
        var stringResult = '';
        //var prefix = $filter('strip')(item.customId, '_', ' ', true);
        var prefix = item.customId;
        for(var i=0; i<data.length; i++) {
            var arrSels = data[i].selection.map(function(s) {
                return s.replace(prefix, '').replace(/_/g, ' ');
            });
            //stringResult += data[i].count +' '+prefix+'(s): '+arrSels.join(', ')+'\n';
            stringResult += '<strong>' +data[i].count +' '+prefix+'(s)</strong>: '+arrSels.join(', ')+'<br/>';
        }
        return $sce.trustAsHtml(stringResult);
        //return data;
    };

    $scope.getResults = function() {
        var postData = {};
        for(var i=0; i<$scope.categories.length; i++) {
            var category = $scope.categories[i];
            if(category.customId === 'tipo_de_cliente') {
                postData[category.customId] = category.rValue;
            }
            else if(category.customId == 'ingenieria_en_sitio') {
                var tempArr = [];
                var categoContent = {};
                for(var j=0; j<category.componentes.length; j++) {
                    var hasvalue = false;
                    var tempObj = {};
                    var componente = category.componentes[j];
                    if($scope.anyValuedChild(componente)) {
                        for(var k=0; k<componente.propiedades.length; k++) {
                            var prop = componente.propiedades[k];
                            if(prop.rValue) {
                                hasvalue = true;
                                tempObj[prop.customId] = prop.rValue;
                            }
                        }
                        tempObj[componente.customId] = true;
                        categoContent[componente.customId] = tempObj;
                    }
                }
                postData[category.customId] = categoContent;
            }
            else if(category.customId === 'tecnologia') {
                var tempArrT = [];
                var categoContentT = {};
                for(var jT=0; jT<category.componentes.length; jT++) {
                    var hasvalueT = false;
                    var tempObjT = {};
                    var componenteT = category.componentes[jT];
                    if($scope.anyValuedChild(componenteT)) {

                        var data =  $scope.getDeviceCounts(componenteT.rValue);
                        categoContentT[componenteT.customId] = {devices: data, volumetria: componenteT.propiedades[1].rValue};



                    }
                }
                postData[category.customId] = categoContentT;
            }
        }
        //return postData;


        var cantidades = {};
        $http.post(baseRemoteURL+'calculadora/calcular', {"postData": postData})
            .success(function(data) {
                $scope.resultados = data.results;
                //cantidades = data.counts;

                angular.forEach($scope.resultados, function(row) {
                    var baseData = angular.copy(row.ticket);
                    var partialResults = angular.copy(baseData);
                    cantidades = row.counts;
                    angular.forEach(row.factores, function(mod) {
                        var cardinality = 1;
                        if(mod.lowerLimit > 0) {
                            var nitem = cantidades[mod.customId];
                            if(!muted) console.log('calcularAjax nitem', nitem);
                            cardinality = (nitem - mod.lowerLimit)*mod.step;
                        }
                        if(!muted) console.log('calcularAjax cardinality', cardinality);
                        partialResults.cc = Math.round(partialResults.cc + cardinality*mod.factor*partialResults.cc);
                        partialResults.acs = Math.round(partialResults.acs + cardinality*mod.factor*partialResults.acs);
                        partialResults.es = Math.round(partialResults.es + cardinality*mod.factor*partialResults.es);
                        partialResults.rq = Math.round(partialResults.rq + cardinality*mod.factor*partialResults.rq);

                        mod.cc = partialResults.cc;
                        mod.es = partialResults.es;
                        mod.rq = partialResults.rq;
                        mod.acs = partialResults.acs;

                        if(!muted) console.log('calcularAjax mod', mod);
                        if(!muted) console.log('calcularAjax baseData', $scope.baseData);
                        if(!muted) console.log('calcularAjax cal', $scope.baseData.cc  + mod.factor*$scope.baseData.cc);
                    });
                });
            })
            .error(function(data) {

            });
    };


    $scope.getChildrenList = function(item, typeName) {
        if(!item[typeName]) return [];
        var okArray = [];
        for(var i=0; i<item[typeName].length; i++) {
            if(item[typeName][i].visible) okArray.push(item[typeName][i]);
        }
        return okArray;
    };


    $scope.getCompanySizeOptions = function() {return companySizeOptions};


    /**
     * Para el acordeon
     */
    $scope.oneAtATime = true;
}


function formatServices() {
    return function(item) {
        if(!item) return [];
        if(!angular.isArray(item)) return [];
        var objects = [];
        for(var i=0; i<item.length; i++) {
            var selections = item[i].map(function(e) {return e.customId;});
            //var selections = ['firewall_firewall_ha'];
            var idx = findWithAttr(objects, 'selection', selections);
            //var exists = objects.some(function(e) {
            //    e.selection.compare(selections);
            //});
            if(idx > 0) {
                objects[idx-1].count++;
            }
            else {
                objects.push({selection: selections, count: 1});
            }
        }
        return objects;
    }
}

function formatData(item) {
    if(!item) return [];
    if(!angular.isArray(item)) return [];
    var objects = [];
    //return [{count: 1, selection: ['firewall_firewall_ha']}];
    for(var i=0; i<item.length; i++) {
        if(!item[i]) continue;
        var selections = item[i].map(function(e) {return e.customId;});
        //var selections = ['firewall_firewall_ha'];
        var idx = findWithAttr(objects, 'selection', selections);
        if(idx > 0) {
            objects[idx-1].count++;
        }
        else {
            objects.push({selection: selections, count: 1});
        }
    }
    return objects;
}

function formatDependencies() {
    return function(array, propName) {return joinArray(array, propName);};
}

function stripString() {
    return function(text, phrase, substitute, all) {
        if (!text) return text;
        if(!substitute) substitute = '';
        if (all) return text.replace(new RegExp(phrase, 'g'), substitute);
        else return text.replace(new RegExp(phrase), substitute);
    };
}

function capitalize() {
    return function(text, applyAll) {
        if(!text) return text;
        if(applyAll)
            return (!!text) ? text.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
        else
            return text.charAt(0).toUpperCase() + text.slice(1);
    };
}





calculadoraControllers.constant('baseRemoteURL', 'http://localhost:8080/calculadora/');
calculadoraControllers.controller('CalculadoraMainCtrl',
    function($scope, $http, baseRemoteURL, $filter, $sce, companySizeOptions, usSpinnerService) {
        mainCtrl($scope, $http, baseRemoteURL, $filter, $sce, companySizeOptions, usSpinnerService);});
calculadoraControllers.filter('prettyPrint', formatServices);
calculadoraControllers.filter('joinArray', formatDependencies);
calculadoraControllers.filter('strip', stripString);
calculadoraControllers.filter('capitalize', capitalize);
calculadoraControllers.value('companySizeOptions', {
    0: 'Small Bussiness hasta 500 usuarios',
    1: 'Medium Bussiness hasta 5,000 usuarios',
    2: 'Datacenters & Large Enterprise más de 5,000 usuarios'
});
calculadoraControllers.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({
        lines: 13,
        length: 40,
        width: 14,
        radius: 46,
        scale: 1,
        corners: 0,
        opacity: 0.05,
        rotate: 0,
        direction: 1,
        speed: 0.8,
        trail: 91
    });
}]);
//calculadoraControllers.factory('spinnerInterceptor', function($q, $window, usSpinnerService) {
//    var interceptor = {
//        response: function(response) {
//            usSpinnerService.stop('all-data');
//            return response;
//        }
//    };
//
//    return interceptor;
//
//    //return function(promise) {
//    //    return promise.then(function(response) {console.log('deteniendo spinner');
//    //        usSpinnerService.stop('all-data');
//    //        return response;
//    //    }, function(response) {console.log('deteniendo spinner');
//    //        usSpinnerService.stop('all-data');
//    //        return $q.reject(response);
//    //    });
//    //};
//});
//calculadoraControllers.config(function($httpProvider, usSpinnerService) {
//    $httpProvider.interceptors.push('spinnerInterceptor');
//
//    var spinnerFunction = function spinnerFunction(data, headersGetter) {console.log('arrancando spinner');
//        usSpinnerService.spin('all-data');
//        return data;
//    };
//
//    $httpProvider.defaults.transformRequest.push(spinnerFunction);
//});

//calculadoraControllers.filter('trim');



//calculadoraControllers.directive('showLogin', function() {
//    return {
//        restrict: 'C',
//        link: function(scope, element, attrs) {
//            var login = element.find('#login-holder');
//            var loginError = element.find('#login-error');
//            var main = element.find('#content');
//            var username = element.find('#username');
//            var password = element.find('#password');
//
//            login.hide();
//            loginError.hide();
//
//            scope.$on('event:auth-loginRequired', function() {
//                console.log('showing login form');
//                main.hide();
//                username.val('');
//                password.val('');
//                login.show();
//            });
//            scope.$on('event:auth-loginFailed', function() {
//                console.log('showing login error message');
//                username.val('');
//                password.val('');
//                loginError.show();
//            });
//            scope.$on('event:auth-loginConfirmed', function() {
//                console.log('hiding login form');
//                main.show();
//                login.hide();
//                username.val('');
//                password.val('');
//            });
//        }
//    };
//});
//
//
//
//function getLocalToken() {
//    return localStorage["authToken"];
//}
//
//function getHttpConfig() {
//    return {
//        headers: {
//            'X-Auth-Token': getLocalToken()
//        }
//    };
//}
//
//function getAuthenticateHttpConfig() {
//    return {
//        ignoreAuthModule: true
//    };
//}
