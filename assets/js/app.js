/*global angular:true*/
/*global Spinner:true*/
/*global BootstrapDialog:true*/
/**
 * Created by Walter on 09/06/2014.
 */
var app = angular.module("aikon", ['ui.bootstrap', 'ngSailsBind', 'angulartics', 'angulartics.google.analytics']);

app.controller("ItemsCtrl", function ($scope, $sailsBind, $filter) {
    'use strict';

    //Ponemos en modo "cargando".
    $scope.viewLoading = true;

    //Valor inicial de la fila a resaltar.
    $scope.focusIndex = 0;

    $sailsBind.bind("ListaPrecios", $scope).then(function () {
        $scope.viewLoading = false;
        $scope.ListaPreciossFiltrada = $scope.ListaPrecioss;

    });

    $scope.keys = [];
    $scope.keys.push({ code: 38, action: function () {
        if ($scope.focusIndex > 0) {
            if ($scope.focusIndex < $filter("filter")($scope.ListaPrecioss, $scope.searchText).length) {
                $scope.focusIndex = $scope.focusIndex - 1;
            } else {
                $scope.focusIndex = $filter("filter")($scope.ListaPrecioss, $scope.searchText).length - 1;
            }
        }

    }});
    $scope.keys.push({ code: 40, action: function () {
        if ($scope.focusIndex < $filter("filter")($scope.ListaPrecioss, $scope.searchText).length - 1) {
            $scope.focusIndex = $scope.focusIndex + 1;
        } else {
            $scope.focusIndex = $filter("filter")($scope.ListaPrecioss, $scope.searchText).length - 1;
        }
    }});

    /**
     * Establece el foco de la tabl en un índice específico.
     * @param index es el indice a usar para resaltar.
     */
    $scope.setFocus = function (index) {
        $scope.focusIndex = index;
    };

    /**
     * Remueve un ítem de la lista de precios.
     * @param item a eliminar (enterito, no solo el índice o el id).
     */
    $scope.remove = function (item) {
        $scope.ListaPrecioss.splice($scope.ListaPrecioss.indexOf(item), 1);
    };

    /**
     * Duplica un item copiándolo (con angular.copy) y haciendo push de ese elemento copiado.
     * @param item
     */
    $scope.duplicate = function (item) {
        $scope.ListaPrecioss.push(angular.copy(item));
    };

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

/**
 * Controlador del panel de agregado de items (manual o con importación desde archivo)
 */
app.controller("addItemsCtrl", ['$scope', '$timeout', '$rootScope', '$modal', function ($scope, $timeout, $rootScope, $modal) {
    'use strict';

    $scope.newItem = {};

    $scope.addingItems = false;

    /**
     * Agrega un artículo a la lista de artículos
     */
    $scope.add = function () {
        $scope.ListaPrecioss.push($scope.newItem);
        $scope.newItem = {};
        $scope.$broadcast('newItemAdded');
        $scope.addItem.$setPristine();
    };

    /**
     * Cambia entre modo "agregar" y el modo simple y hace un broadcast de eso.
     */
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

    /**
     * Abre un asistente de importación y le pasa el scope como parámetro.
     * @param data es el binario de Excel a importar.
     */
    $scope.importFromData = function (data) {
        var wb = XLSX.read(data, {type: 'binary'});
        $scope.sheetNames = wb.SheetNames;
        $scope.sheets = wb.Sheets;
        $scope.primeraFila = 1;
        var modalInstance = $modal.open({
            templateUrl: 'excelImportDialog.html',
            controller: importFromExcelCtrl,
            scope: $scope
        });
    };

    /**
     * Importa desde un archivo seleccionado o desde un archivo dropeado a la página.
     * @param e
     */
    $scope.importarDesdeArchivo = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer ? e.dataTransfer.files : e.target.files,
            i,
            f;

        for (i = 0, f = files[i]; i !== files.length; ++i) {
            var reader = new FileReader(),
                name = f.name;
            reader.onload = function (e) {
                var data = e.target.result;
                $scope.importFromData(data);
            };
            reader.readAsBinaryString(f);
        }
    };

}]);

/**
 * Controlador que muestra el asistente de importación y realiza la importación.
 * @param $scope es el scope a adjuntarle los datos.
 * @param $modalInstance es el servicio para mostrar o cerrar el modal.
 */
var importFromExcelCtrl = function ($scope, $modalInstance) {
    'use strict';

    var nombreDeLaPrimeraHoja = $scope.sheetNames[0],
        primeraHoja = $scope.sheets[nombreDeLaPrimeraHoja],
        rangoPrimeraHoja = XLSX.utils.decode_range(primeraHoja['!ref']),
        columnIndex,
        primeraColumna = rangoPrimeraHoja.s.c,
        ultimaColumna = rangoPrimeraHoja.e.c,
        title,
        nombresDeColumnas,
        hojaAImportar,
        nombresDeColumnaEstandar = ['codigo', 'precio', 'descripcion'],
        rangoAImportar,
        titleCell;

    $scope.recordarPreferencias = true;

    $scope.opcionesDeImportacion = {
        selectedSheetName: nombreDeLaPrimeraHoja,
        columns: {}
    };

    for (columnIndex = primeraColumna; columnIndex <= ultimaColumna; columnIndex = columnIndex + 1) {
        titleCell = XLSX.utils.encode_cell({c: rangoPrimeraHoja.s.c + columnIndex, r: rangoPrimeraHoja.s.r})
        title = primeraHoja[titleCell].v;
        $scope.opcionesDeImportacion.columns[title] = {
            title: title,
            number: columnIndex,
            letter: String.fromCharCode(columnIndex + 65),
            importarComo: []
        };

    }

    nombresDeColumnas = Object.keys($scope.opcionesDeImportacion.columns);

    $scope.opcionesDeImportacion.deDondeImportar = {
        codigo: $scope.opcionesDeImportacion.columns[nombresDeColumnas[0]],
        descripcion: $scope.opcionesDeImportacion.columns[nombresDeColumnas[1]],
        precio: $scope.opcionesDeImportacion.columns[nombresDeColumnas[2]]
    };

    nombresDeColumnaEstandar.forEach(function (nombreDeCampoEstandar) {
        $scope.$watch('opcionesDeImportacion.deDondeImportar.' + nombreDeCampoEstandar, function (newValue, oldValue) {
            var importarComoViejos = $scope.opcionesDeImportacion.columns[oldValue.title].importarComo;

            if (oldValue) {
                importarComoViejos.splice(importarComoViejos.indexOf(nombreDeCampoEstandar), 1);
            }
            if (newValue) {
                $scope.opcionesDeImportacion.columns[newValue.title].importarComo.push(nombreDeCampoEstandar);
            }
        });
    });

    /**
     * Lista cuales son las columnas que no están siendo usada para los campos estándar (precio, descripción y código).
     * @returns {Array} de columnas no usadas.
     */
    $scope.columnasSinUso = function () {
        var sinUso = [],
            columna;

        function importandoEnUnCampoEstandar(columna) {
            var esCampoEstandar = false;

            nombresDeColumnaEstandar.forEach(function (nombreDeCampoEstandar) {
                if ($scope.opcionesDeImportacion.deDondeImportar[nombreDeCampoEstandar].title === columna.title) {
                    esCampoEstandar = true;
                }
            });
            return esCampoEstandar;
        }

        function noTieneImportarComo(columna) {
            return columna.importarComo && columna.importarComo.length === 0;
        }

        var columnaKey,
            columnas = $scope.opcionesDeImportacion.columns;
        for (columnaKey in columnas) {
            if (columnas.hasOwnProperty(columnaKey)) {
                columna = columnas[columnaKey];
                if (noTieneImportarComo(columna) || !importandoEnUnCampoEstandar(columna)) {
                    sinUso.push(columna);
                }
            }
        }
        return sinUso;
    };

    $scope.opcionesDeImportacion.hasHeader = true;
    $scope.opcionesDeImportacion.primeraFila = rangoPrimeraHoja.s.r + 1;

    /**
     * Funcion que importa al aceptar el diálogo del asistente de importación.
     */
    $scope.importar = function () {
        var nombreDeColumna,
            header = [],
            importedData;
        for (nombreDeColumna in $scope.opcionesDeImportacion.columns) {
            if ($scope.opcionesDeImportacion.columns.hasOwnProperty(nombreDeColumna)) {
                var columna = $scope.opcionesDeImportacion.columns[nombreDeColumna];
                if (columna.importarComo.length <= 1) {
                    if (columna.importarComo[0] === '') {
                        header[columna.number] = 'donotimport';
                    } else {
                        header[columna.number] = columna.importarComo[0];
                    }
                } else {
                    alert("NOOOOOOOOO");
                    //ToDo: Hacer que esto sea angular validation.
                }
            }
        }
        hojaAImportar = $scope.sheets[$scope.opcionesDeImportacion.selectedSheetName];
        rangoAImportar = XLSX.utils.decode_range(hojaAImportar["!ref"])
        rangoAImportar.s.r = rangoAImportar.s.r + $scope.opcionesDeImportacion.primeraFila - 1;
        importedData = XLSX.utils.sheet_to_json(
            hojaAImportar,
            {
                header: header,
                range: XLSX.utils.encode_range(rangoAImportar),
                raw: true
            }
        );
        var importedRow
        for (importedRow in importedData) {
            if (importedData.hasOwnProperty(importedRow)) {
                $scope.ListaPrecioss.push(importedData[importedRow]);
            }
        }
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

app.controller("navbar", ['$scope', '$location', function ($scope, $location) {
    'use strict';

    /**
     * Determina si la pagina actual es igual al parametro pasado.
     * @param viewLocation es el path a ser testeado
     * @returns {boolean} devuelve true si el viewLocation es el "activo".
     */
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    /**
     * Muestra un diálogo con información acerca de la webapp.
     */
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

app.directive('hasLoadingSpinner', function () {
    'use strict';

    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            loading: '=hasLoadingSpinner'
        },
        templateUrl: '/js/directives/templates/loading.html',
        link: function (scope, element, attrs) {
            var spinner = new Spinner().spin(),
                loadingContainer = element.find('.my-loading-spinner-container')[0];
            loadingContainer.appendChild(spinner.el);
        }
    };
});

app.directive('droppable', function () {
    'use strict';

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element[0].addEventListener('drop', scope.importarDesdeArchivo, false);
            element[0].addEventListener('dragover', scope.handleDragOver, false);
        }
    };
});

app.directive('ngChange', function () {
    'use strict';

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element[0].addEventListener('change', scope[attrs.ngChange], false);
        }
    };
});
app.directive('preventDrop', function () {
    'use strict';

    return {
        'scope': false,
        'link': function (scope, element, attrs) {
            element.bind('drop dragover', function (event) {
                event.preventDefault();
            });
        }
    };
});

app.directive('dragEnter', ['$timeout', function ($timeout) {
    return {
        'scope': false,
        'link': function (scope, element, attrs) {
            var promise;
            var enter = false;
            element.bind('dragover', function (event) {
                if (!isFileDrag(event)) {
                    return;
                }
                if (!enter) {
                    scope.$apply(attrs.dragEnter);
                    enter = true;
                }
                $timeout.cancel(promise);
                event.preventDefault();
            });
            element.bind('dragleave drop', function (event) {
                promise = $timeout(function () {
                    scope.$eval(attrs.dragLeave);
                    promise = null;
                    enter = false;
                }, 100);
            });
            function isFileDrag(dragEvent) {
                var fileDrag = false;
                var dataTransfer = dragEvent.dataTransfer || dragEvent.originalEvent.dataTransfer;
                angular.forEach(dataTransfer && dataTransfer.types, function (val) {
                    if (val === 'Files') {
                        fileDrag = true;
                    }
                });
                return fileDrag;
            }
        }
    };
}]);