describe('Lookup datagrid header controller', function () {
    'use strict';

    var createController, scope, stateMock;

    beforeEach(module('data-prep.lookup', function ($provide) {
        stateMock = {
            playground: {
                lookup: {
                    selectedColumn: {
                        id: '0000',
                        name: 'lookupGridColName'
                    },
                    columnsToAdd: ['0002', '0003']
                }
            }
        };
        $provide.constant('state', stateMock);
    }));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        createController = function () {
            return $controller('LookupDatagridHeaderCtrl', {
                $scope: scope
            });
        };
    }));

    it('should show the checkboxes', inject(function () {
        //given
        var ctrl = createController();
        ctrl.column = {
            id: '0001'
        };
        //when
        var showCheckbox = ctrl.showCheckbox();

        //then
        expect(showCheckbox).toBeTruthy();
    }));

    it('should hide the checkboxes', inject(function () {
        //given
        var ctrl = createController();
        ctrl.column = {
            id: '0000'
        };
        //when
        var showCheckbox = ctrl.showCheckbox();

        //then
        expect(showCheckbox).toBeFalsy();
    }));

    it('should update the array of the selected columns to be added to the lookup', inject(function (StateService) {
        //given
        var ctrl = createController();
        spyOn(StateService, 'updateLookupColumnsToAdd').and.returnValue();
        var event = angular.element.Event('click');

        //when
        ctrl.updateColsToAdd(event);

        //then
        expect(StateService.updateLookupColumnsToAdd).toHaveBeenCalled();
    }));
});