/*global window:false */
/*global SlickGridMock:false */

describe('Lookup Datagrid grid service', function () {
	'use strict';

	var realSlickGrid = Slick;
	var dataViewMock, stateMock;
	var gridMock;

	var gridColumns = [
		{id: '0000', field: 'col0', tdpColMetadata: {id: '0000', name: 'col0'}},
		{id: '0001', field: 'col1', tdpColMetadata: {id: '0001', name: 'col1111111111111'}},
		{id: '0002', field: 'col2', tdpColMetadata: {id: '0002', name: 'col2'}},
		{id: '0003', field: 'col3', tdpColMetadata: {id: '0003', name: 'col3'}},
		{id: '0004', field: 'col4', tdpColMetadata: {id: '0004', name: 'col4'}},
		{id: 'tdpId', field: 'tdpId', tdpColMetadata: {id: 'tdpId', name: 'tdpId'}}
	];

	var gridEventsSpy = function(){
		spyOn(gridMock.onActiveCellChanged, 'subscribe').and.returnValue();
		spyOn(gridMock.onHeaderClick, 'subscribe').and.returnValue();
		spyOn(gridMock.onHeaderContextMenu, 'subscribe').and.returnValue();
	}
;
	beforeEach(module('data-prep.lookup'));

	beforeEach(function () {
		dataViewMock = new DataViewMock();
	});


	beforeEach(module('data-prep.datagrid', function ($provide) {
		stateMock = {playground: {lookup: {
			dataView: dataViewMock
		}}};
		$provide.constant('state', stateMock);

		spyOn(dataViewMock.onRowCountChanged, 'subscribe').and.returnValue();
		spyOn(dataViewMock.onRowsChanged, 'subscribe').and.returnValue();
	}));

	beforeEach(inject(function (LookupDatagridColumnService, LookupDatagridStyleService, LookupDatagridTooltipService) {
		spyOn(LookupDatagridColumnService, 'init').and.returnValue();
		spyOn(LookupDatagridStyleService, 'init').and.returnValue();
		spyOn(LookupDatagridTooltipService, 'init').and.returnValue();
	}));

	beforeEach(function () {
		window.Slick = {
			Grid: SlickGridMock
		};
	});

	afterEach(function () {
		window.Slick = realSlickGrid;
	});

	describe('on creation', function() {
		it('should init the other datagrid services', inject(function (LookupDatagridGridService, LookupDatagridColumnService,
																	   LookupDatagridStyleService, LookupDatagridTooltipService) {
			//when
			LookupDatagridGridService.initGrid();

			//then
			expect(LookupDatagridColumnService.init).toHaveBeenCalled();
			expect(LookupDatagridStyleService.init).toHaveBeenCalled();
			expect(LookupDatagridTooltipService.init).toHaveBeenCalled();
		}));

		it('should add grid listeners', inject(function (LookupDatagridGridService) {
			//when
			LookupDatagridGridService.initGrid();

			//then
			expect(stateMock.playground.lookup.dataView.onRowCountChanged.subscribe).toHaveBeenCalled();
			expect(stateMock.playground.lookup.dataView.onRowsChanged.subscribe).toHaveBeenCalled();
		}));

		it('should add grid active cell change listener', inject(function ($rootScope, LookupDatagridGridService) {
			//when
			gridMock = LookupDatagridGridService.initGrid();
			gridEventsSpy();

			//then
			expect(gridMock.onActiveCellChanged.subscribe).toHaveBeenCalled();
		}));

		it('should add header click listener', inject(function (LookupDatagridGridService) {
			//when
			gridMock = LookupDatagridGridService.initGrid();
			gridEventsSpy();
			$rootScope.$digest();

			//then
			expect(gridMock.onHeaderClick.subscribe).toHaveBeenCalled();
		}));

		it('should add header right click listener', inject(function (LookupDatagridGridService) {
			//when
			gridMock = LookupDatagridGridService.initGrid();
			gridEventsSpy();
			$rootScope.$digest();

			//then
			expect(gridMock.onHeaderContextMenu.subscribe).toHaveBeenCalled();
		}));
	});

	describe('grid handlers', function() {
		it('should update row count and render grid on row count change', inject(function (LookupDatagridGridService) {
			//given
			var grid = LookupDatagridGridService.initGrid();
			spyOn(grid, 'updateRowCount').and.returnValue();
			spyOn(grid, 'render').and.returnValue();

			//when
			var onRowCountChanged = stateMock.playground.lookup.dataView.onRowCountChanged.subscribe.calls.argsFor(0)[0];
			onRowCountChanged();

			//then
			expect(grid.updateRowCount).toHaveBeenCalled();
			expect(grid.render).toHaveBeenCalled();
		}));

		it('should invalidate rows and render grid on rows changed', inject(function (LookupDatagridGridService) {
			//given
			var grid = LookupDatagridGridService.initGrid();
			spyOn(grid, 'invalidateRows').and.returnValue();
			spyOn(grid, 'render').and.returnValue();

			var args = {rows: []};

			//when
			var onRowsChanged = stateMock.playground.lookup.dataView.onRowsChanged.subscribe.calls.argsFor(0)[0];
			onRowsChanged(null, args);

			//then
			expect(grid.invalidateRows).toHaveBeenCalledWith(args.rows);
			expect(grid.render).toHaveBeenCalled();
		}));
	});
});
