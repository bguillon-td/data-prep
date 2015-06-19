describe('Column suggestions controller', function() {
    'use strict';

    var createController, scope;

    beforeEach(module('data-prep.column-suggestions'));

    beforeEach(inject(function($rootScope, $controller, $q, PlaygroundService, TransformationService) {
        scope = $rootScope.$new();

        createController = function() {
            var ctrl =  $controller('ColumnSuggestionsCtrl', {
                $scope: scope
            });
            return ctrl;
        };

        spyOn(PlaygroundService, 'appendStep').and.returnValue($q.when());
        spyOn(TransformationService, 'initDynamicParameters').and.returnValue($q.when());
    }));

    it('should init vars and flags', inject(function() {
        //when
        var ctrl = createController();

        //then
        expect(ctrl.dynamicTransformation).toBe(null);
        expect(ctrl.dynamicFetchInProgress).toBe(false);
        expect(ctrl.showDynamicModal).toBe(false);
    }));

    it('should bind "column" getter to ColumnSuggestionService.currentColumn', inject(function(ColumnSuggestionService) {
        //given
        var ctrl = createController();
        var column = {id: '0001', name: 'col1'};

        //when
        ColumnSuggestionService.currentColumn = column;

        //then
        expect(ctrl.column).toBe(column);
    }));

    it('should bind "suggestions" getter to ColumnSuggestionService.transformations', inject(function(ColumnSuggestionService) {
        //given
        var ctrl = createController();
        var transformations = {'case': [{name: 'tolowercase'}, {name: 'touppercase'}]};

        //when
        ColumnSuggestionService.transformations = transformations;

        //then
        expect(ctrl.suggestions).toBe(transformations);
    }));

    describe('with initiated state', function() {
        var column = {id: '0001', name: 'col1'};

        beforeEach(inject(function(ColumnSuggestionService, PlaygroundService, PreparationService) {
            ColumnSuggestionService.currentColumn = column;
            PlaygroundService.currentMetadata = {id: 'dataset_id'};
            PreparationService.currentPreparationId = 'preparation_id';
        }));

        it('should call appendStep function on transform closure execution', inject(function(PlaygroundService) {
            //given
            var transformation = {name: 'tolowercase'};
            var params = {param: 'value'};
            var ctrl = createController();

            //when
            var closure = ctrl.transformClosure(transformation);
            closure(params);

            //then
            expect(PlaygroundService.appendStep).toHaveBeenCalledWith('tolowercase', column, params);
        }));

        it('should hide modal after step append', inject(function($rootScope) {
            //given
            var transformation = {name: 'tolowercase'};
            var params = {param: 'value'};
            var ctrl = createController();
            ctrl.showDynamicModal = true;

            //when
            var closure = ctrl.transformClosure(transformation);
            closure(params);
            $rootScope.$digest();

            //then
            expect(ctrl.showDynamicModal).toBe(false);
        }));

        it('should append new step on static transformation selection', inject(function(PlaygroundService) {
            //given
            var transformation = {name: 'tolowercase'};
            var ctrl = createController();

            //when
            ctrl.select(transformation);

            //then
            expect(PlaygroundService.appendStep).toHaveBeenCalledWith('tolowercase', column, undefined);
        }));

        it('should set current dynamic transformation and', inject(function() {
            //given
            var transformation = {name: 'cluster', dynamic: true};
            var ctrl = createController();
            ctrl.dynamicTransformation = null;

            //when
            ctrl.select(transformation);

            //then
            expect(ctrl.dynamicTransformation).toBe(transformation);
        }));

        it('should init dynamic params', inject(function(TransformationService) {
            //given
            var transformation = {name: 'cluster', dynamic: true};

            var ctrl = createController();

            //when
            ctrl.select(transformation);

            //then
            expect(TransformationService.initDynamicParameters).toHaveBeenCalledWith(transformation, {
                columnId: '0001',
                datasetId: 'dataset_id',
                preparationId: 'preparation_id'
            });
        }));

        it('should update fetch progress flag during dynamic parameters init', inject(function($rootScope) {
            //given
            var transformation = {name: 'cluster', dynamic: true};
            var ctrl = createController();
            ctrl.dynamicFetchInProgress = false;

            //when
            ctrl.select(transformation);
            expect(ctrl.dynamicFetchInProgress).toBe(true);
            $rootScope.$digest();

            //then
            expect(ctrl.dynamicFetchInProgress).toBe(false);
        }));
    });
});