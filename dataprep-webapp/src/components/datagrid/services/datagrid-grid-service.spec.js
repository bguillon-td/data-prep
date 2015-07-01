describe('Datagrid grid service', function () {
    'use strict';

    var realSlickGrid = Slick;

    beforeEach(module('data-prep.datagrid'));

    beforeEach(inject(function (DatagridColumnService, DatagridStyleService, DatagridSizeService,
                                DatagridExternalService, DatagridTooltipService, DatagridService) {
        spyOn(DatagridColumnService, 'init').and.returnValue();
        spyOn(DatagridStyleService, 'init').and.returnValue();
        spyOn(DatagridSizeService, 'init').and.returnValue();
        spyOn(DatagridExternalService, 'init').and.returnValue();
        spyOn(DatagridTooltipService, 'init').and.returnValue();

        spyOn(DatagridService.dataView.onRowCountChanged, 'subscribe').and.returnValue();
        spyOn(DatagridService.dataView.onRowsChanged, 'subscribe').and.returnValue();
    }));

    beforeEach(function () {
        window.Slick = {
            /*global SlickGridMock:false */
            Grid: SlickGridMock
        };
    });

    afterEach(function () {
        window.Slick = realSlickGrid;
    });

    describe('on creation', function() {
        it('should init the other datagrid services', inject(function (DatagridGridService, DatagridColumnService,
                                                                       DatagridStyleService, DatagridSizeService,
                                                                       DatagridExternalService, DatagridTooltipService) {
            //when
            DatagridGridService.initGrid();

            //then
            expect(DatagridColumnService.init).toHaveBeenCalled();
            expect(DatagridStyleService.init).toHaveBeenCalled();
            expect(DatagridSizeService.init).toHaveBeenCalled();
            expect(DatagridExternalService.init).toHaveBeenCalled();
            expect(DatagridTooltipService.init).toHaveBeenCalled();
        }));

        it('should add grid listeners', inject(function (DatagridGridService, DatagridService) {
            //when
            DatagridGridService.initGrid();

            //then
            expect(DatagridService.dataView.onRowCountChanged.subscribe).toHaveBeenCalled();
            expect(DatagridService.dataView.onRowsChanged.subscribe).toHaveBeenCalled();
        }));
    });

    describe('grid handlers', function() {
        it('should update row count and render grid on row count change', inject(function (DatagridGridService, DatagridService) {
            //given
            var grid = DatagridGridService.initGrid();
            spyOn(grid, 'updateRowCount').and.returnValue();
            spyOn(grid, 'render').and.returnValue();

            //when
            var onRowCountChanged = DatagridService.dataView.onRowCountChanged.subscribe.calls.argsFor(0)[0];
            onRowCountChanged();

            //then
            expect(grid.updateRowCount).toHaveBeenCalled();
            expect(grid.render).toHaveBeenCalled();
        }));

        it('should invalidate rows and render grid on rows changed', inject(function (DatagridGridService, DatagridService) {
            //given
            var grid = DatagridGridService.initGrid();
            spyOn(grid, 'invalidateRows').and.returnValue();
            spyOn(grid, 'render').and.returnValue();

            var args = {rows: []};

            //when
            var onRowsChanged = DatagridService.dataView.onRowsChanged.subscribe.calls.argsFor(0)[0];
            onRowsChanged(null, args);

            //then
            expect(grid.invalidateRows).toHaveBeenCalledWith(args.rows);
            expect(grid.render).toHaveBeenCalled();
        }));
    });
});