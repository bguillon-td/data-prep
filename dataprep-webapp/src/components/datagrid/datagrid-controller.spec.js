describe('Datagrid controller', function () {
    'use strict';

    var createController, scope;

    beforeEach(module('data-prep.datagrid'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();

        createController = function () {
            var ctrl = $controller('DatagridCtrl', {
                $scope: scope
            });
            return ctrl;
        };
    }));

    it('should set tooltip infos and display it after a 300ms delay', inject(function($rootScope, $timeout) {
        //given
        var ctrl = createController();
        ctrl.showTooltip = false;

        var record = {id: '345bc63a5cd5928', name: 'toto'};
        var colId = 'name';
        var position = {x: 123, y: 456};

        //when
        ctrl.updateTooltip(record, colId, position);

        //then
        expect(ctrl.record).toBeFalsy();
        expect(ctrl.colId).toBeFalsy();
        expect(ctrl.position).toBeFalsy();
        expect(ctrl.showTooltip).toBeFalsy();

        //when
        $timeout.flush(300);

        //then
        expect(ctrl.record).toBe(record);
        expect(ctrl.colId).toBe(colId);
        expect(ctrl.position).toBe(position);
        expect(ctrl.showTooltip).toBe(true);
    }));

    it('should set tooltip infos and display it immediately when it is already visible', inject(function($rootScope, $timeout) {
        //given
        var ctrl = createController();
        ctrl.showTooltip = true;

        var record = {id: '345bc63a5cd5928', name: 'toto'};
        var colId = 'name';
        var position = {x: 123, y: 456};

        //when
        ctrl.updateTooltip(record, colId, position);

        //then
        expect(ctrl.record).toBeFalsy();
        expect(ctrl.colId).toBeFalsy();
        expect(ctrl.position).toBeFalsy();
        expect(ctrl.showTooltip).toBe(true);

        //when
        $timeout.flush(0);

        //then
        expect(ctrl.record).toBe(record);
        expect(ctrl.colId).toBe(colId);
        expect(ctrl.position).toBe(position);
        expect(ctrl.showTooltip).toBe(true);
    }));

    it('should cancel existing hide promise on new tooltip update', inject(function($rootScope, $timeout) {
        //given
        var ctrl = createController();
        ctrl.showTooltip = true;

        var record = {id: '345bc63a5cd5928', name: 'toto'};
        var colId = 'name';
        var position = {x: 123, y: 456};

        ctrl.hideTooltip();
        $timeout.flush(299);
        expect(ctrl.showTooltip).toBe(true);

        //when
        ctrl.updateTooltip(record, colId, position);
        $timeout.flush(1);

        //then
        expect(ctrl.showTooltip).toBe(true);
    }));

    it('should hide tooltip after a 300ms delay', inject(function($rootScope, $timeout) {
        //given
        var ctrl = createController();
        ctrl.showTooltip = true;

        //when
        ctrl.hideTooltip();

        //then
        expect(ctrl.showTooltip).toBe(true);

        //when
        $timeout.flush(300);

        //then
        expect(ctrl.showTooltip).toBe(false);
    }));

    it('should cancel existing update promise on new hide promise', inject(function($rootScope, $timeout) {
        //given
        var ctrl = createController();
        ctrl.showTooltip = false;

        var record = {id: '345bc63a5cd5928', name: 'toto'};
        var colId = 'name';
        var position = {x: 123, y: 456};

        ctrl.updateTooltip(record, colId, position);
        $timeout.flush(299);
        expect(ctrl.showTooltip).toBe(false);

        //when
        ctrl.hideTooltip();
        $timeout.flush(1);

        //then
        expect(ctrl.record).toBeFalsy();
        expect(ctrl.colId).toBeFalsy();
        expect(ctrl.position).toBeFalsy();
        expect(ctrl.showTooltip).toBe(false);
    }));
});