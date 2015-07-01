(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name data-prep.datagrid.service:DatagridSizeService
     * @description Datagrid private service that manage the grid sizes
     * @requires data-prep.services.playground.service:DatagridService
     */
    function DatagridSizeService($window, DatagridService) {
        var grid;
        
        return {
            init: init,
            autosizeColumns: autosizeColumns
        };

        //--------------------------------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name getLocalStorageKey
         * @methodOf data-prep.datagrid.service:DatagridSizeService
         * @description Get the actual dataset column sizes key. This key is used in localStorage 
         */
        function getLocalStorageKey() {
            return 'dataprep.col_size_' + DatagridService.metadata.id;
        }

        /**
         * @ngdoc method
         * @name autosizeColumns
         * @methodOf data-prep.datagrid.service:DatagridSizeService
         * @description Compute columns sizes and update them in the grid. The sizes are saved in
         * localstorage if not already saved. They are then used to set the last saved sized.
         */
        function autosizeColumns() {
            var localKey = getLocalStorageKey();
            var sizesStr = $window.localStorage.getItem(localKey);

            if(sizesStr) {
                var sizes = JSON.parse(sizesStr);
                var gridColumns = grid.getColumns();
                _.forEach(gridColumns, function(col) {
                    col.width = sizes[col.id] || col.minWidth;
                });
                grid.setColumns(gridColumns);
            }
            else {
                grid.autosizeColumns();
                saveColumnSizes();
            }
        }

        /**
         * @ngdoc method
         * @name saveColumnSizes
         * @methodOf data-prep.datagrid.service:DatagridSizeService
         * @description Save the columns sizes of the dataset in localstorage
         */
        function saveColumnSizes() {
            var localKey = getLocalStorageKey();
            var sizes = {};

            _.forEach(grid.getColumns(), function(col) {
                sizes[col.id] = col.width;
            });

            $window.localStorage.setItem(localKey, JSON.stringify(sizes));
        }

        /**
         * @ngdoc method
         * @name attachGridResizeListener
         * @methodOf data-prep.datagrid.service:DatagridSizeService
         * @description Attach listeners on window resize
         */
        function attachGridResizeListener() {
            $window.addEventListener('resize', function(){
                grid.resizeCanvas();
            }, true);
        }

        /**
         * @ngdoc method
         * @name attachColumnResizeListener
         * @methodOf data-prep.datagrid.service:DatagridSizeService
         * @description Attach listeners for column resize
         */
        function attachColumnResizeListener() {
            grid.onColumnsResized.subscribe(saveColumnSizes);
        }

        /**
         * @ngdoc method
         * @name init
         * @methodOf data-prep.datagrid.service:DatagridSizeService
         * @param {object} newGrid The new grid
         * @description Initialize the grid and attach the column listeners
         */
        function init(newGrid) {
            grid = newGrid;
            attachGridResizeListener();
            attachColumnResizeListener();
        }
    }

    angular.module('data-prep.datagrid')
        .factory('DatagridSizeService', DatagridSizeService);
})();