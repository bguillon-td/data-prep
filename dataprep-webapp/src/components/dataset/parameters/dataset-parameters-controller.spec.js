describe('Dataset parameters controller', function () {
    'use strict';

    var scope, createController;

    beforeEach(module('data-prep.dataset-parameters'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new(true);

        createController = function () {
            var ctrl = $controller('DatasetParametersCtrl', {
                $scope: scope
            });
            ctrl.configuration = {
                separators: [
                    {label: ';', value: ';'},
                    {label: ',', value: ','},
                    {label: '<space>', value: ' '},
                    {label: '<tab>', value: '\t'}
                ]
            };
            return ctrl;
        };
    }));

    describe('separator in list', function() {
        it('should return true when current separator is an item of the separators list', function() {
            //given
            var ctrl = createController();
            ctrl.parameters = {
                separator: ';'
            };

            //when
            var result = ctrl.separatorIsInList();

            //then
            expect(result).toBeTruthy();
        });

        it('should return false when current separator is NOT an item of the separators list', function() {
            //given
            var ctrl = createController();
            ctrl.parameters = {
                separator: '|'
            };

            //when
            var result = ctrl.separatorIsInList();

            //then
            expect(result).toBeFalsy();
        });

        it('should return false when current separator is falsy', function() {
            //given
            var ctrl = createController();
            ctrl.parameters = {
                separator: ''
            };

            //when
            var result = ctrl.separatorIsInList();

            //then
            expect(result).toBeFalsy();
        });
    });

    describe('validate', function() {
        it('should return true when current separator is an item of the separators list', function() {
            //given
            var ctrl = createController();
            ctrl.dataset = {id: '1348b684f2e548'};
            ctrl.onParametersChange = jasmine.createSpy('on parameter change');
            ctrl.parameters = {
                separator: ';',
                encoding: 'UTF-8'
            };

            expect(ctrl.onParametersChange).not.toHaveBeenCalledWith();

            //when
            ctrl.validate();

            //then
            expect(ctrl.onParametersChange).toHaveBeenCalledWith({
                dataset: {id: '1348b684f2e548'},
                parameters: {
                    separator: ';',
                    encoding: 'UTF-8'
                }
            });
        });
    });
});