/*global window:false */
/*global SlickGridMock:false */

describe('Lookup Datagrid grid service', function () {
	'use strict';

	var realSlickGrid = Slick;
	var dataViewMock, stateMock;
	//var gridMock;

	//var gridColumns = [
	//	{id: '0000', field: 'col0', tdpColMetadata: {id: '0000', name: 'col0'}},
	//	{id: '0001', field: 'col1', tdpColMetadata: {id: '0001', name: 'col1111111111111'}},
	//	{id: '0002', field: 'col2', tdpColMetadata: {id: '0002', name: 'col2'}},
	//	{id: '0003', field: 'col3', tdpColMetadata: {id: '0003', name: 'col3'}},
	//	{id: '0004', field: 'col4', tdpColMetadata: {id: '0004', name: 'col4'}},
	//	{id: 'tdpId', field: 'tdpId', tdpColMetadata: {id: 'tdpId', name: 'tdpId'}}
	//];

	//var gridEventsSpy = function(){
	//	spyOn(gridMock.onActiveCellChanged, 'subscribe').and.returnValue();
	//	spyOn(gridMock.onHeaderClick, 'subscribe').and.returnValue();
	//	spyOn(gridMock.onHeaderContextMenu, 'subscribe').and.returnValue();
	//};

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

		//it('should add grid active cell change listener', inject(function ($rootScope, LookupDatagridGridService) {
		//	//when
		//	gridMock = LookupDatagridGridService.initGrid();
		//	gridEventsSpy();
		//
		//	//then
		//	expect(gridMock.onActiveCellChanged.subscribe).toHaveBeenCalled();
		//}));
		//
		//it('should add header click listener', inject(function (LookupDatagridGridService) {
		//	//when
		//	gridMock = LookupDatagridGridService.initGrid();
		//	gridEventsSpy();
		//	$rootScope.$digest();
		//
		//	//then
		//	expect(gridMock.onHeaderClick.subscribe).toHaveBeenCalled();
		//}));
		//
		//it('should add header right click listener', inject(function (LookupDatagridGridService) {
		//	//when
		//	gridMock = LookupDatagridGridService.initGrid();
		//	gridEventsSpy();
		//	$rootScope.$digest();
		//
		//	//then
		//	expect(gridMock.onHeaderContextMenu.subscribe).toHaveBeenCalled();
		//}));
	});

	//describe('on active cell event', function () {
	//	it('should update current selectedColumn', inject(function ($timeout, LookupDatagridExternalService, StateService) {
	//		//given
	//		LookupDatagridExternalService.init(gridMock);
	//		var args = {cell: 1};
	//
	//		//when
	//		var onActiveCellChanged = gridMock.onActiveCellChanged.subscribe.calls.argsFor(0)[0];
	//		onActiveCellChanged(null, args);
	//
	//		//then
	//		expect(StateService.setLookupSelectedColumn).toHaveBeenCalled();
	//	}));
	//
	//	it('should NOT update current selectedColumn on cell changed', inject(function ($timeout, LookupDatagridExternalService, StateService) {
	//		//given
	//		LookupDatagridExternalService.init(gridMock);
	//		var args = {cell: 1};
	//
	//
	//		var onActiveCellChanged = gridMock.onActiveCellChanged.subscribe.calls.argsFor(0)[0];
	//		onActiveCellChanged(null, args);
	//		expect(StateService.setLookupSelectedColumn.calls.count()).toBe(1);
	//
	//		//when
	//		onActiveCellChanged(null, {cell: 1});
	//
	//		//then
	//		expect(StateService.setLookupSelectedColumn.calls.count()).toBe(1);
	//	}));
	//});

	//	describe('on header click event', function () {
	//		it('should update current selectedColumn on header left click', inject(function ($timeout, LookupDatagridExternalService, StateService) {
	//			//given
	//			LookupDatagridExternalService.init(gridMock);
	//			var args = {
	//				column: {id: '0001'}
	//			};
	//
	//			//when
	//			var onHeaderClick = gridMock.onHeaderClick.subscribe.calls.argsFor(0)[0];
	//			onHeaderClick(null, args);
	//
	//			expect(StateService.setLookupSelectedColumn).toHaveBeenCalled();
	//		}));
	//
	//		it('should NOT update current selectedColumn on header left click twice', inject(function ($timeout, LookupDatagridExternalService, StateService) {
	//			//given
	//			LookupDatagridExternalService.init(gridMock);
	//			var args = {
	//				column: {id: '0001'}
	//			};
	//
	//			var onHeaderClick = gridMock.onHeaderClick.subscribe.calls.argsFor(0)[0];
	//			onHeaderClick(null, args);
	//
	//			expect(StateService.setLookupSelectedColumn.calls.count()).toBe(1);
	//
	//			//when
	//			onHeaderClick(null, args);
	//
	//			//then
	//			expect(StateService.setLookupSelectedColumn.calls.count()).toBe(1);
	//		}));
	//
	//		it('should update current selectedColumn on header right click', inject(function ($timeout, LookupDatagridExternalService, StateService) {
	//			//given
	//			LookupDatagridExternalService.init(gridMock);
	//			var args = {
	//				column: {id: '0001'}
	//			};
	//			//when
	//			var onHeaderContextMenu = gridMock.onHeaderContextMenu.subscribe.calls.argsFor(0)[0];
	//			onHeaderContextMenu(null, args);
	//
	//			expect(StateService.setLookupSelectedColumn).toHaveBeenCalled();
	//		}));
	//
	//		it('should NOT update current selectedColumn on header right click twice', inject(function ($timeout, LookupDatagridExternalService, StateService) {
	//			//given
	//			LookupDatagridExternalService.init(gridMock);
	//			var args = {
	//				column: {id: '0001'}
	//			};
	//			var onHeaderContextMenu = gridMock.onHeaderContextMenu.subscribe.calls.argsFor(0)[0];
	//			onHeaderContextMenu(null, args);
	//			expect(StateService.setLookupSelectedColumn.calls.count()).toBe(1);
	//
	//			//when
	//			onHeaderContextMenu(null, args);
	//
	//			//then
	//			expect(StateService.setLookupSelectedColumn.calls.count()).toBe(1);
	//		}));
	//	});
	//});

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
