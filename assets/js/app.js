/**
 * Created by Walter on 09/06/2014.
 */
var app = angular.module("aikon",['ngSailsBind']);

app.controller("ItemsCtrl", function ($scope, $sailsBind) {
    // To easily add new items to the collection.
    $scope.newItem = {};
    $sailsBind.bind("ListaPrecios", $scope);
});

