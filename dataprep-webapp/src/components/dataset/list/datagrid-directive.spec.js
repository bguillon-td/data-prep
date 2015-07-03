describe('Datagrid directive', function() {
    'use strict';

    var scope, createElement, element, grid;

    beforeEach(module('data-prep.datagrid'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function($rootScope, $compile, DatagridGridService, DatagridColumnService, DatagridSizeService, DatagridStyleService) {
        scope = $rootScope.$new();
        createElement = function() {
            element = angular.element('<datagrid></datagrid>');
            $compile(element)(scope);
            scope.$digest();

            angular.element('body').append(element);
            return element;
        };

        // decorate grid creation to keep the resulting grid ref and attach spy on its functions
        var realInitGrid = DatagridGridService.initGrid;
        DatagridGridService.initGrid = function(parentId) {
            grid = realInitGrid(parentId);
            spyOn(grid, 'invalidate').and.callThrough();
            spyOn(grid, 'scrollRowToTop').and.callThrough();

            return grid;
        };

        spyOn(DatagridGridService, 'initGrid').and.callThrough();
        spyOn(DatagridColumnService, 'updateColumns').and.returnValue();
        spyOn(DatagridSizeService, 'autosizeColumns').and.returnValue();
        spyOn(DatagridStyleService, 'manageColumnStyle').and.returnValue();
        spyOn(DatagridStyleService, 'resetCellStyles').and.returnValue();
    }));

    afterEach(function() {
        scope.$destroy();
        element.remove();
    });

    describe('on data change', function() {
        var data;

        beforeEach(inject(function(DatagridService) {
            //given
            createElement();
            data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};

            //when
            DatagridService.data = data;
            scope.$digest();
        }));

        it('should init grid', inject(function(DatagridGridService) {
            //then
            expect(DatagridGridService.initGrid).toHaveBeenCalledWith('#datagrid');
        }));

        it('should init grid only once', inject(function(DatagridService, DatagridGridService) {
            //given
            expect(DatagridGridService.initGrid.calls.count()).toBe(1);

            //when
            DatagridService.data = {};
            scope.$digest();

            //then
            expect(DatagridGridService.initGrid.calls.count()).toBe(1);
        }));

        it('should tooltip ruler', inject(function(DatagridTooltipService) {
            //then
            expect(DatagridTooltipService.tooltipRuler).toBeDefined();
        }));

        it('should update columns', inject(function(DatagridColumnService) {
            //then
            expect(DatagridColumnService.updateColumns).toHaveBeenCalledWith(data.columns, data.preview, false);
        }));

        it('should update grid style', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.manageColumnStyle).toHaveBeenCalledWith(data.preview);
        }));

        it('should invalidate grid', function() {
            //then
            expect(grid.invalidate).toHaveBeenCalled();
        });
    });

    describe('on metadata change', function() {
        beforeEach(inject(function(DatagridService) {
            //given
            createElement();
            DatagridService.data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};
            scope.$digest();

            //when
            DatagridService.metadata = {};
            scope.$digest();
        }));

        it('should reset cell styles', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetCellStyles).toHaveBeenCalled();
        }));

        it('should scroll to top', function() {
            //then
            expect(grid.scrollRowToTop).toHaveBeenCalledWith(0);
        });
    });

    describe('on filter change', function() {
        beforeEach(inject(function(DatagridService, FilterService) {
            //given
            createElement();
            DatagridService.data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};
            scope.$digest();

            //when
            FilterService.filters = [{}];
            scope.$digest();
        }));

        it('should reset cell styles', inject(function(DatagridStyleService) {
            //then
            expect(DatagridStyleService.resetCellStyles).toHaveBeenCalled();
        }));

        it('should scroll to top', function() {
            //then
            expect(grid.scrollRowToTop).toHaveBeenCalledWith(0);
        });
    });

    describe('on headers elements change', function() {
        var createDummyElementWithId;

        beforeEach(inject(function($rootScope, $compile) {
            //create a div with provided id
            createDummyElementWithId = function(elementId) {
                var dummyElement = angular.element('<div id="' + elementId + '"></div>');
                $compile(dummyElement)($rootScope.$new());
                return dummyElement;
            };
        }));

        beforeEach(inject(function(DatagridService, DatagridColumnService) {
            //given
            createElement();

            //given : init grid
            DatagridService.data = {columns: [{id: '0000'}, {id: '0001'}], preview: false};
            scope.$digest();

            //given : set grid columns
            var columns = [
                {
                    id: '0000',
                    field: '0000',
                    name: '<div id="datagrid-header-0"></div>',
                    minWidth: 80
                },
                {
                    id: '0001',
                    field: '0001',
                    name: '<div id="datagrid-header-1"></div>',
                    minWidth: 80
                },
                {
                    id: '0002',
                    field: '0002',
                    name: '<div id="datagrid-header-2"></div>',
                    minWidth: 80
                }
            ];
            grid.setColumns(columns);
            grid.invalidate();

            //when : header elements changed
            DatagridColumnService.colHeaderElements = [
                {element: createDummyElementWithId('header0')},
                {element: createDummyElementWithId('header1')},
                {element: createDummyElementWithId('header2')}
            ];
            scope.$digest();
        }));

        it('should insert headers elements in grid columns headers', function() {
            //then
            var header0 = element.find('#datagrid-header-0').eq(0);
            var header1 = element.find('#datagrid-header-1').eq(0);
            var header2 = element.find('#datagrid-header-2').eq(0);
            expect(header0.find('#header0').length).toBe(1);
            expect(header1.find('#header1').length).toBe(1);
            expect(header2.find('#header2').length).toBe(1);
        });
    });

});