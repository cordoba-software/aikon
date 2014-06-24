/**
 * Created by Walter on 09/06/2014.
 */
var app = angular.module("aikon", ['ngSailsBind', 'xeditable', 'angulartics', 'angulartics.google.analytics']);

app.controller("ItemsCtrl", function ($scope, $sailsBind, $filter) {
    'use strict';

    $scope.viewLoading = true;

    $scope.newItem = {};
    $sailsBind.bind("ListaPrecios", $scope).then(function () {
        $scope.viewLoading = false;
        $scope.ListaPreciossFiltrada = $scope.ListaPrecioss;

    });

    $scope.keys = [];
    $scope.keys.push({ code: 38, action: function () {
        if ($scope.focusIndex > 0) {
            if ($scope.focusIndex < $filter("filter")($scope.ListaPrecioss, $scope.searchText).length) {
                $scope.focusIndex--;
            } else {
                $scope.focusIndex = $filter("filter")($scope.ListaPrecioss, $scope.searchText).length - 1;
            }
        }

    }});
    $scope.keys.push({ code: 40, action: function () {
            if ($scope.focusIndex < $filter("filter")($scope.ListaPrecioss, $scope.searchText).length - 1) {
                $scope.focusIndex++;
            } else {
                $scope.focusIndex = $filter("filter")($scope.ListaPrecioss, $scope.searchText).length - 1;
            }
    }});

    $scope.setFocus = function (index) {
        $scope.focusIndex = index;
    };

    $scope.remove = function (item) {
        $scope.ListaPrecioss.splice($scope.ListaPrecioss.indexOf(item), 1);
    };

    $scope.duplicate = function (item) {
        $scope.ListaPrecioss.push(angular.copy(item));
    };

    $scope.focusIndex = 0;

    $scope.$on('keydown', function (msg, obj) {
        var code = obj.code;
        $scope.keys.forEach(function (o) {
            if (o.code !== code) {
                return;
            }
            o.action();
            $scope.$apply();
        });
    });
});

app.controller("addItemsCtrl", ['$scope', '$timeout', '$rootScope', function ($scope, $timeout, $rootScope) {
    'use strict';

    $scope.add = function () {
        $scope.ListaPrecioss.push($scope.newItem);
        $scope.newItem = {};
        $scope.$broadcast('newItemAdded');
        $scope.addItem.$setPristine();
    };

    $scope.toggleAdd = function () {
        $scope.addingItems = !$scope.addingItems;
        if ($scope.addingItems) {
            $timeout(function () {
                $rootScope.$broadcast('addingItems');
            });
        } else {
            $timeout(function () {
                $rootScope.$broadcast('notAddingMoreItems');
            });
        }
    };

    $scope.keys.push({ code: 27, action: function () {
        if ($scope.addingItems) {
            $scope.addingItems = false;
        }
        $rootScope.$broadcast('notAddingMoreItems');
    }});

    $scope.addingItems = false;

}]);

app.controller("navbar", ['$scope', '$location', function ($scope, $location) {
    'use strict';
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.showAbout = function () {
        BootstrapDialog.show({
            title: 'Acerca de Aikon (web)',
            message: 'Este es un nuevo producto de Córdoba Software. Aikon web es la reencarnación de Aikon en' +
                'la nube.',
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    label: 'Ok, entendí',
                    action: function (dialogItself) {
                        dialogItself.close();
                    }
                }
            ]
        });
    };
}]);

app.directive('keyTrap', function () {
    'use strict';
    return function (scope, elem) {
        elem.bind('keydown', function (event) {
            scope.$broadcast('keydown', { code: event.keyCode });
        });
    };
});

app.directive('focusOn', function () {
    'use strict';
    return function (scope, elem, attr) {
        if (attr.focusOn.indexOf(",") !== -1) {
            attr.focusOn.replace(/ /g, '').split(",").forEach(function (focusOn) {
                scope.$on(focusOn, function () {
                    elem[0].focus();
                });
            });
        } else {
            scope.$on(attr.focusOn, function () {
                elem[0].focus();
            });
        }
    };
});

app.directive('hasLoadingSpinner', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            loading: '=hasLoadingSpinner'
        },
        templateUrl: '/js/directives/templates/loading.html',
        link: function(scope, element, attrs) {
            var spinner = new Spinner().spin();
            var loadingContainer = element.find('.my-loading-spinner-container')[0];
            loadingContainer.appendChild(spinner.el);
        }
    };
});

app.run(function (editableOptions, editableThemes) {
    'use strict';
    editableThemes.bs3.inputClass = 'input-sm';
    editableThemes.bs3.buttonsClass = 'btn-sm';
    editableOptions.theme = 'bs3';
});