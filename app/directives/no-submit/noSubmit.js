'use strict';

var noSubmitModule = angular.module('noSubmit', []);

noSubmitModule.directive('noSubmit', function() {
    //return function(scope, element, attributes) {
    //
    //};
    return {
        restrict: 'A',
        scope: {
            controlVariable: '=notifyTo'
        },
        link: function(scope, element, attributes) {
            element.on('focus', function (event) {
                scope.controlVariable = true;
            })
                .on('blur', function (event) {
                    scope.controlVariable = false;
                });
        }
    };
});

noSubmitModule.directive('noSubmitForm', function() {
    return {
        restrict: 'A',
        scope: {
            isBlocked: '=preventIf'
        },
        link: function(scope, element, attributes) {
            element.on('submit', function(e) {
                if(scope.isBlocked) return false;
                element.submit();
            });
        }
    };
});
