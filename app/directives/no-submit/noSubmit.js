'use strict';

var noSubmitModule = angular.module('noSubmit', []);

noSubmitModule.directive('preventSubmit', function() {
    return {
        restrict: 'A',
        scope: {
            controlVariable: '=notifyTo'
        },
        link: function (scope, element, attributes) {
            console.log('DATA: ' + scope.controlVariable);
            element.on('focus', function (event) {
                scope.$apply(function() {
                    scope.controlVariable = true;
                });

            })
                .on('blur', function (event) {
                    scope.$apply(function() {
                        scope.controlVariable = false;
                    });
                });
        }
    };
});

noSubmitModule.directive('noSubmitForm', function() {
    return {
        restrict: 'A',
        scope: {
            isBlocked: '=preventIf',
            callback: '&'
        },
        link: function (scope, element, attributes) {
            element.on('submit', function (e) {
                if (scope.isBlocked) {
                    e.preventDefault();
                    return false;
                }
                scope.callback();
                return true;
            });
        }
    };
});

noSubmitModule.directive('unorderedList', function() {
    //return function (scope, element, attrs) {
    //    var data = scope[attrs['unorderedList']];
    //    var propertyName = attrs['listProperty'];
    //    var propertyExpression = attrs['listProperty'];
    //    if(angular.isArray(data)) {
    //        var listElem = angular.element("<ul>");
    //        element.append(listElem);
    //        for(var i=0; i< data.length; i++) {
    //            //console.log('Item: '+data[i].name);
    //            //listElem.append(angular.element('<li>')
    //            //    .text(data[i][propertyName]));
    //            listElem.append(angular.element('<li>')
    //                .text(scope.$eval(propertyExpression, data[i])));
    //        }
    //    }
    //}




    return {
        link: function(scope, element, attrs) {
            var data = scope[attrs['unorderedList'] || attrs['listSource']];
            var propertyExpression = attrs['listProperty'] || "price | currency";
            if(angular.isArray(data)) {
                var listElem = angular.element('<ul>');
                if(element[0].nodeName == '#comment') {
                    element.parent().append(listElem);
                }
                else {
                    element.append(listElem);
                }
                for(var i=0; i<data.length; i++) {
                    var itemElement = angular.element('<li>')
                        .text(scope.$eval(propertyExpression, data[i]));
                    listElem.append(itemElement);
                }
            }
        },
        restrict: 'EACM'
    }


});
