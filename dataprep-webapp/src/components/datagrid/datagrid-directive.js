(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.datagrid.directive:Datagrid
     * @description This directive create the SlickGrid datagrid<br/>
     * Watchers :
     * <ul>
     *         <li>Grid header directive list : insert grid header in SlickGrid headers</li>
     *         <li>Grid Metadata : it means the loaded dataset has changed, the styles are reset</li>
     *         <li>Grid data : update grid headers and styles</li>
     *         <li>Filters : reset the styles</li>
     * </ul>
     *
     * @requires data-prep.state.service:state
     * @requires data-prep.datagrid.service:DatagridGridService
     * @requires data-prep.datagrid.service:DatagridColumnService
     * @requires data-prep.datagrid.service:DatagridStyleService
     * @requires data-prep.datagrid.service:DatagridSizeService
     * @requires data-prep.datagrid.service:DatagridTooltipService
     * @requires data-prep.datagrid.service:DatagridExternalService
     * @restrict E
     */
    function Datagrid(state, DatagridGridService, DatagridColumnService, DatagridStyleService, DatagridSizeService,
                      DatagridTooltipService, DatagridExternalService) {
        return {
            restrict: 'E',
            templateUrl: 'components/datagrid/datagrid.html',
            bindToController: true,
            controllerAs: 'datagridCtrl',
            controller: 'DatagridCtrl',
            link: function (scope, iElement, iAttrs, ctrl) {
                var grid;
                var columnTimeout, externalTimeout, focusTimeout;

                //------------------------------------------------------------------------------------------------------
                //--------------------------------------------------GETTERS---------------------------------------------
                //------------------------------------------------------------------------------------------------------
                /**
                 * @ngdoc method
                 * @name getMetadata
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the loaded metadata
                 */
                function getMetadata() {
                    return state.playground.dataset;
                }

                /**
                 * @ngdoc method
                 * @name getData
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the loaded data
                 */
                function getData() {
                    return state.playground.data;
                }

                /**
                 * @ngdoc method
                 * @name getFilters
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Get the filter list
                 */
                function getFilters() {
                    return state.playground.filter.gridFilters;
                }

                /**
                 * @ngdoc method
                 * @name getResizeCondition
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Return condition that trigger a grid resize
                 */
                function getResizeCondition() {
                    return state.playground.lookup.visibility;
                }

                //------------------------------------------------------------------------------------------------------
                //---------------------------------------------------UTILS----------------------------------------------
                //------------------------------------------------------------------------------------------------------
                /**
                 * @ngdoc method
                 * @name onMetadataChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Reset cell styles, scroll to top and expect to recreate all columns on next update
                 */
                var onMetadataChange = function onMetadataChange() {
                    if (grid) {
                        DatagridStyleService.resetCellStyles();
                        grid.scrollRowToTop(0);
                        DatagridColumnService.renewAllColumns(true);
                    }
                };

                /**
                 * @ngdoc method
                 * @name onDataChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Update and resize the columns with its headers, set grid styles
                 */
                var onDataChange = function onDataChange(data) {
                    if (data) {
                        initGridIfNeeded();
                        var columns;
                        var selectedColumn;
                        var stateSelectedColumn = ctrl.state.playground.grid.selectedColumn; //column metadata
                        var stateSelectedLine = ctrl.state.playground.grid.selectedLine; //column metadata

                        //create columns, manage style and size, set columns in grid
                        clearTimeout(columnTimeout);
                        columnTimeout = setTimeout(function () {
                            columns = DatagridColumnService.createColumns(data.columns, data.preview);

                            if(!data.preview) {
                                selectedColumn = stateSelectedColumn ? _.find(columns, {id: stateSelectedColumn.id}) : null;
                                if(stateSelectedLine) {
                                    var stateSelectedColumnIndex = columns.indexOf(selectedColumn);
                                    DatagridStyleService.scheduleHighlightCellsContaining(stateSelectedLine, stateSelectedColumnIndex);
                                }
                            }

                            DatagridStyleService.updateColumnClass(columns, selectedColumn);
                            DatagridSizeService.autosizeColumns(columns); // IMPORTANT : this set columns in the grid
                            DatagridColumnService.renewAllColumns(false);
                        }, 0);

                        //manage column selection (external)
                        clearTimeout(externalTimeout);
                        if(!data.preview) {
                            externalTimeout = setTimeout(function () {
                                 DatagridExternalService.updateSuggestionPanel(selectedColumn, null, true);
                            }, 0);
                        }

                        //focus specific column
                        clearTimeout(focusTimeout);
                        focusTimeout = setTimeout(DatagridGridService.navigateToFocusedColumn, 300);
                    }
                };

                /**
                 * @ngdoc method
                 * @name onFiltersChange
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Refresh cell styles and scroll to top
                 */
                var onFiltersChange = function onFiltersChange() {
                    if (grid) {
                        DatagridStyleService.resetCellStyles();
                        grid.scrollRowToTop(0);
                    }
                };

                /**
                 * @ngdoc method
                 * @name resize
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Resize grid canvas
                 */
                function resize() {
                    if(grid) {
                        setTimeout(function(){
                            grid.resizeCanvas();
                        },250);
                    }
                }

                //------------------------------------------------------------------------------------------------------
                //---------------------------------------------------INIT-----------------------------------------------
                //------------------------------------------------------------------------------------------------------
                /**
                 * @ngdoc method
                 * @name initGridIfNeeded
                 * @methodOf data-prep.datagrid.directive:Datagrid
                 * @description Init Slick grid and init datagrid private services.
                 */
                var initGridIfNeeded = function () {
                    if (!grid) {
                        grid = DatagridGridService.initGrid('#datagrid');

                        // the tooltip ruler is used compute a cell text regardless of the font and zoom used.
                        // To do so, the text is put into an invisible span so that the span can be measured.
                        DatagridTooltipService.tooltipRuler = iElement.find('#tooltip-ruler').eq(0);
                    }
                };

                //------------------------------------------------------------------------------------------------------
                //-------------------------------------------------WATCHERS---------------------------------------------
                //------------------------------------------------------------------------------------------------------

                /**
                 * Scroll to top when loaded dataset change
                 */
                scope.$watch(getMetadata, onMetadataChange);

                /**
                 * Update grid columns and invalidate grid on data change
                 */
                scope.$watch(getData, onDataChange);

                /**
                 * When filter change, displayed values change, so we reset active cell and cell styles
                 */
                scope.$watch(getFilters, onFiltersChange);

                /**
                 * When lookup is displayed/hidden changes, the grid should be resized fit available space
                 */
                scope.$watch(getResizeCondition, resize);
            }
        };
    }

    angular.module('data-prep.datagrid')
        .directive('datagrid', Datagrid);
})();

