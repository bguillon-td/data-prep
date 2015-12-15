(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name data-prep.lookup.service:DatagridGridService
	 * @description Datagrid private service that init the grid
	 * @requires data-prep.state.service:StateService
	 * @requires data-prep.state.constant:state
	 * @requires data-prep.lookup.service:LookupDatagridStyleService
	 * @requires data-prep.lookup.service:LookupDatagridColumnService
	 * @requires data-prep.lookup.service:LookupDatagridTooltipService
	 */
	function LookupDatagridGridService ($window, state, StateService, LookupDatagridStyleService,
										LookupDatagridColumnService, LookupDatagridTooltipService, $timeout) {
		var grid = null;
		var lastSelectedColumn;
		var gridServices = [
			LookupDatagridColumnService,
			LookupDatagridStyleService,
			LookupDatagridTooltipService
		];

		return {
			initGrid: initGrid
		};

		/**
		 * @ngdoc method
		 * @name attachLongTableListeners
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @description Attaches listeners for data update to reRender the grid
		 */
		function attachDataChangeListeners () {
			state.playground.lookup.dataView.onRowCountChanged.subscribe(function () {
				grid.updateRowCount();
				grid.render();
			});
			state.playground.lookup.dataView.onRowsChanged.subscribe(function (e, args) {
				grid.invalidateRows(args.rows);
				grid.render();
			});
		}

		/**
		 * @ngdoc method
		 * @name updateSelectedLookupColumn
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @param {Object} column The selected column
		 * @description Set the selected column into state services
		 */
		function updateSelectedLookupColumn (column) {
			var columnHasChanged = column.tdpColMetadata !== lastSelectedColumn;
			if (!columnHasChanged) {
				return;
			}
			lastSelectedColumn = column.tdpColMetadata;
			$timeout(function () {
				//if the selected column is the index col: column.tdpColMetadata === undefined
				StateService.setLookupSelectedColumn(column.tdpColMetadata);
			});
		}

		/**
		 * @ngdoc method
		 * @name attachCellListeners
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @description Attach listeners for saving the state of column id
		 */
		function attachCellListeners () {
			grid.onActiveCellChanged.subscribe(function (e, args) {
				if (angular.isDefined(args.cell)) {
					var column = grid.getColumns()[args.cell];
					updateSelectedLookupColumn(column);
				}
			});
		}

		/**
		 * @ngdoc method
		 * @name attachColumnListeners
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @description Attach header selection listeners on right click or left click
		 */
		function attachColumnListeners () {
			function attachColumnCallback (args) {
				var columnId = args.column.id;
				var column = _.find(grid.getColumns(), {id: columnId});
				updateSelectedLookupColumn(column);
			}

			grid.onHeaderContextMenu.subscribe(function (e, args) {
				attachColumnCallback(args);
			});

			grid.onHeaderClick.subscribe(function (e, args) {
				attachColumnCallback(args);
			});
		}

		/**
		 * @ngdoc method
		 * @name initGridServices
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @description Init other grid services with the new created grid
		 */
		function initGridServices () {
			_.forEach(gridServices, function (service) {
				service.init(grid);
			});
		}

		/**
		 * @ngdoc method
		 * @name attachGridResizeListener
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @description Attach listeners on window resize
		 */
		function attachGridResizeListener() {
			$window.addEventListener('resize', function(){
				grid.resizeCanvas();
			}, true);
		}

		/**
		 * @ngdoc method
		 * @name initGrid
		 * @methodOf data-prep.lookup.service:LookupDatagridGridService
		 * @description Create Slick grid and initiate other lookup-datagrid services
		 * @param {string} elementId The element where the grid will be inserted in the DOM. The element must exists
		 */
		function initGrid (elementId) {
			//create grid
			var options = {
				autoEdit: false,
				editable: false,
				enableAddRow: false,
				enableCellNavigation: true,
				enableTextSelectionOnCells: false,
				syncColumnCellResize: false,
				frozenColumn: 0,
				forceFitColumns: true
			};
			grid = new Slick.Grid(elementId, state.playground.lookup.dataView, [{id: 'tdpId'}], options);

			//listeners
			attachDataChangeListeners();
			attachCellListeners();
			attachColumnListeners();
			attachGridResizeListener();

			//init other services
			initGridServices();

			return grid;
		}
	}

	angular.module('data-prep.lookup')
		.service('LookupDatagridGridService', LookupDatagridGridService);
})();