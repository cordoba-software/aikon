/**
 * Created by Walter on 09/06/2014.
 */
var app = angular.module("aikon", ['ngSailsBind', 'xeditable', 'angulartics', 'angulartics.google.analytics']);

app.controller("ItemsCtrl", function ($scope, $sailsBind) {
    'use strict';

    $scope.newItem = {};
    $sailsBind.bind("ListaPrecios", $scope);

    $scope.keys = [];
    $scope.keys.push({ code: 38, action: function () { $scope.focusIndex--; }});
    $scope.keys.push({ code: 40, action: function () { $scope.focusIndex++; }});

    $scope.focusIndex = 1;

    $scope.$on('keydown', function (msg, obj) {
        var code = obj.code;
        $scope.keys.forEach(function (o) {
            if (o.code !== code) { return; }
            o.action();
            $scope.$apply();
        });
    });

});

app.controller("navbar", ['$scope', '$location', function ($scope, $location) {
    'use strict';
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
}]);

app.directive('keyTrap', function() {
    return function( scope, elem ) {
        elem.bind('keydown', function( event ) {
            scope.$broadcast('keydown', { code: event.keyCode } );
        });
    };
});

app.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});