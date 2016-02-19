/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

describe('Playground controller', function () {
    'use strict';

    var createController, scope, stateMock;
    var datasets = [
        {
            'id': 'de3cc32a-b624-484e-b8e7-dab9061a009c',
            'name': 'customers_jso_light',
            'author': 'anonymousUser',
            'records': 15,
            'nbLinesHeader': 1,
            'nbLinesFooter': 0,
            'created': '03-30-2015 08:06'
        },
        {
            'id': '3b21388c-f54a-4334-9bef-748912d0806f',
            'name': 'customers_jso',
            'author': 'anonymousUser',
            'records': 1000,
            'nbLinesHeader': 1,
            'nbLinesFooter': 0,
            'created': '03-30-2015 07:35'
        }
    ];

    var preparations = [
        {
            'id': 'ab136cbf0923a7f11bea713adb74ecf919e05cfa',
            'dataSetId': 'de3cc32a-b624-484e-b8e7-dab9061a009c',
            'author': 'anonymousUser',
            'creationDate': 1427447300300
        },
        {
            'id': 'fbaa18e82e913e97e5f0e9d40f04413412be1126',
            'dataSetId': '3b21388c-f54a-4334-9bef-748912d0806f',
            'author': 'anonymousUser',
            'creationDate': 1427447330693
        }
    ];

    const createPreparation = {
        id: 'create-preparation-id'
    };

    beforeEach(angular.mock.module('data-prep.playground', ($provide) => {
        stateMock = {
            playground: {
                dataset: {},
                lookup: {
                    actions: []
                },
                previousState: 'nav.home.preparations',
                preparationName: ''
            }
        };
        $provide.constant('state', stateMock);
    }));

    beforeEach(inject(($rootScope, $q, $controller, $state, PlaygroundService) => {
        scope = $rootScope.$new();

        createController = function () {
            return $controller('PlaygroundCtrl', {
                $scope: scope
            });
        };

        spyOn(PlaygroundService, 'createOrUpdatePreparation').and.returnValue($q.when(createPreparation));
        spyOn($state, 'go').and.returnValue();
    }));

    afterEach(inject(($stateParams) => {
        $stateParams.prepid = null;
        $stateParams.datasetid = null;
    }));

    describe('bindings', () => {
        it('should bind hasActiveStep getter', inject(function (RecipeService) {
            //given
            var ctrl = createController();
            expect(ctrl.hasActiveStep).toBeFalsy();

            //when
            RecipeService.getRecipe().push({inactive: false});

            //then
            expect(ctrl.hasActiveStep).toBe(true);
        }));
    });

    describe('recipe header', () => {
        it('should create/update preparation with clean name on name edition confirmation', inject(function (PlaygroundService) {
            //given
            var ctrl = createController();
            stateMock.playground.preparationName = '  my new name  ';

            //when
            ctrl.confirmPrepNameEdition(stateMock.playground.preparationName);

            //then
            expect(PlaygroundService.createOrUpdatePreparation).toHaveBeenCalledWith('my new name');
        }));

        it('should change route to preparation route on name edition confirmation', inject(function ($rootScope, $state) {
            //given
            var ctrl = createController();
            stateMock.playground.preparationName = '  my new name  ';
            stateMock.playground.preparation = {id: 'fe6843da512545e'};

            //when
            ctrl.confirmPrepNameEdition(stateMock.playground.preparationName);
            $rootScope.$digest();

            //then
            expect($state.go).toHaveBeenCalledWith('playground.preparation', {prepid: createPreparation.id});
        }));

        it('should not call service create/updateName service if name is blank on name edition confirmation', inject(function (PlaygroundService) {
            //given
            var ctrl = createController();

            //when
            ctrl.confirmPrepNameEdition(' ');

            //then
            expect(PlaygroundService.createOrUpdatePreparation).not.toHaveBeenCalled();
        }));
    });

    describe('lookup', () => {
        beforeEach(inject(function ($q, LookupService, StateService) {
            spyOn(LookupService, 'initLookups').and.returnValue($q.when());
            spyOn(StateService, 'setLookupVisibility').and.returnValue();
        }));

        it('should load lookup panel when it is hidden', inject(function (LookupService) {
            //given
            stateMock.playground.lookup.visibility = false;
            var ctrl = createController();

            //when
            ctrl.toggleLookup();

            //then
            expect(LookupService.initLookups).toHaveBeenCalled();
        }));

        it('should display lookup panel when it is hidden', inject(function (StateService) {
            //given
            stateMock.playground.lookup.visibility = false;
            var ctrl = createController();

            //when
            ctrl.toggleLookup();
            scope.$digest();

            //then
            expect(StateService.setLookupVisibility).toHaveBeenCalledWith(true, undefined);
        }));

        it('should hide lookup panel when it is visible', inject(function (LookupService, StateService) {
            //given
            stateMock.playground.lookup.visibility = true;
            var ctrl = createController();

            //when
            ctrl.toggleLookup();

            //then
            expect(LookupService.initLookups).not.toHaveBeenCalled();
            expect(StateService.setLookupVisibility).toHaveBeenCalledWith(false);
        }));
    });

    describe('close', () => {
        var ctrl;
        var preparation;

        beforeEach(inject(($q, PreparationService, StateService) => {
            preparation = {id: '9af874865e42b546', draft: true};
            stateMock.playground.preparation = preparation;
            stateMock.playground.previousState = 'nav.home.preparations';

            spyOn(PreparationService, 'delete').and.returnValue($q.when(true));
            spyOn(StateService, 'resetPlayground').and.returnValue();

            ctrl = createController();
        }));

        describe('before close', () => {
            it('should reset and redirect with NOT implicit preparation', inject(($timeout, $state, StateService) => {
                //given
                preparation.draft = false;
                expect(StateService.resetPlayground).not.toHaveBeenCalled();

                //when
                ctrl.beforeClose();
                $timeout.flush();
                //then
                expect(StateService.resetPlayground).toHaveBeenCalled();
                expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
            }));

            it('should show preparation save/discard modal with implicit preparation', function () {
                //given
                expect(ctrl.showNameValidation).toBeFalsy();

                //when
                ctrl.beforeClose();

                //then
                expect(ctrl.showNameValidation).toBe(true);
            });
        });

        describe('discard preparation', () => {
            it('should delete current preparation', inject(function (PreparationService) {
                //when
                ctrl.discardSaveOnClose();

                //then
                expect(PreparationService.delete).toHaveBeenCalledWith(preparation);
            }));

            it('should reset and redirect to previous route', inject(function ($timeout, $state, StateService) {
                //when
                ctrl.discardSaveOnClose();
                scope.$digest();
                $timeout.flush();

                //then
                expect(StateService.resetPlayground).toHaveBeenCalled();
                expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
            }));
        });

        describe('save preparation', () => {
            it('should change preparation name on save confirm', inject(function (PlaygroundService) {
                //given
                stateMock.playground.preparationName = '  my preparation ';

                //when
                ctrl.confirmSaveOnClose();

                //then
                expect(PlaygroundService.createOrUpdatePreparation).toHaveBeenCalledWith('my preparation');
            }));

            it('should reset and redirect to previous route', inject(function ($timeout, $state, StateService) {
                //when
                ctrl.confirmSaveOnClose();
                scope.$digest();
                $timeout.flush();

                //then
                expect(StateService.resetPlayground).toHaveBeenCalled();
                expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
            }));
        });
    });

    describe('feedback', () => {
        it('should open feedback modal', inject(function (StateService) {
            //given
            spyOn(StateService, 'showFeedback').and.returnValue();
            var ctrl = createController();

            //when
            ctrl.openFeedbackForm();

            //then
            expect(StateService.showFeedback).toHaveBeenCalled();
        }));
    });

    describe('dataset parameters', () => {
        beforeEach(inject(function ($q, StateService, PlaygroundService) {
            spyOn(StateService, 'hideDatasetParameters').and.returnValue();
            spyOn(StateService, 'toggleDatasetParameters').and.returnValue();
            spyOn(StateService, 'setIsSendingDatasetParameters').and.returnValue();
            spyOn(PlaygroundService, 'changeDatasetParameters').and.returnValue($q.when());
        }));

        it('should open dataset parameters', inject(function (StateService) {
            //given
            var ctrl = createController();
            expect(StateService.toggleDatasetParameters).not.toHaveBeenCalled();

            //when
            ctrl.toggleParameters();

            //then
            expect(StateService.toggleDatasetParameters).toHaveBeenCalled();
        }));

        it('should manage progress flag', inject(function (StateService) {
            //given
            var ctrl = createController();
            var parameters = {separator: ';', encoding: 'UTF-8'};

            expect(StateService.setIsSendingDatasetParameters).not.toHaveBeenCalled();

            //when
            ctrl.changeDatasetParameters(parameters);
            expect(StateService.setIsSendingDatasetParameters).toHaveBeenCalledWith(true);
            scope.$digest();

            //then
            expect(StateService.setIsSendingDatasetParameters).toHaveBeenCalledWith(false);
        }));

        it('should call parameter change function', inject(function (PlaygroundService) {
            //given
            var ctrl = createController();
            var parameters = {separator: ';', encoding: 'UTF-8'};

            expect(PlaygroundService.changeDatasetParameters).not.toHaveBeenCalled();

            //when
            ctrl.changeDatasetParameters(parameters);

            //then
            expect(PlaygroundService.changeDatasetParameters).toHaveBeenCalled();
        }));

        it('should hide dataset parameters', inject(function (StateService) {
            //given
            var ctrl = createController();
            var parameters = {separator: ';', encoding: 'UTF-8'};

            expect(StateService.hideDatasetParameters).not.toHaveBeenCalled();

            //when
            ctrl.changeDatasetParameters(parameters);
            scope.$digest();

            //then
            expect(StateService.hideDatasetParameters).toHaveBeenCalled();
        }));
    });

    describe('initialization', () => {
        beforeEach(inject(($q, MessageService) => {
            spyOn(MessageService, 'error').and.returnValue();
            stateMock.inventory = {preparations: preparations, datasets: datasets};
        }));

        it('should load playground', inject(($q, $stateParams, PlaygroundService) => {
            //given
            $stateParams.prepid = preparations[0].id;
            spyOn(PlaygroundService, 'load').and.returnValue($q.when());

            //when
            createController();

            //then
            expect(PlaygroundService.load).toHaveBeenCalledWith(preparations[0]);
        }));

        it('should go back to previous state when preparation does NOT exist', inject(($state, $stateParams, MessageService) => {
            //given
            $stateParams.prepid = 'non existing prep';
            $stateParams.datasetid = null;

            //when
            createController();

            //then
            expect(MessageService.error).toHaveBeenCalledWith('PLAYGROUND_FILE_NOT_FOUND_TITLE', 'PLAYGROUND_FILE_NOT_FOUND', {type: 'preparation'});
            expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
        }));

        it('should go back to previous state when preparation content GET return an error', inject(($q, $state, $stateParams, MessageService, PlaygroundService) => {
            //given
            $stateParams.prepid = 'non existing prep';
            $stateParams.datasetid = null;
            spyOn(PlaygroundService, 'load').and.returnValue($q.reject());

            //when
            createController();

            //then
            expect(MessageService.error).toHaveBeenCalledWith('PLAYGROUND_FILE_NOT_FOUND_TITLE', 'PLAYGROUND_FILE_NOT_FOUND', {type: 'preparation'});
            expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
        }));

        it('should load dataset', inject(($q, $stateParams, PlaygroundService) => {
            //given
            $stateParams.prepid = null;
            $stateParams.datasetid = 'de3cc32a-b624-484e-b8e7-dab9061a009c';
            spyOn(PlaygroundService, 'initPlayground').and.returnValue($q.when());

            //when
            createController();

            //then
            expect(PlaygroundService.initPlayground).toHaveBeenCalledWith(datasets[0]);
        }));

        it('should go back to previous state when dataset does NOT exist', inject(($state, $stateParams, MessageService) => {
            //given
            $stateParams.prepid = null;
            $stateParams.datasetid = 'non existing dataset';

            //when
            createController();

            //then
            expect(MessageService.error).toHaveBeenCalledWith('PLAYGROUND_FILE_NOT_FOUND_TITLE', 'PLAYGROUND_FILE_NOT_FOUND', {type: 'dataset'});
            expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
        }));

        it('should go back to previous state when dataset content GET return an error', inject(($q, $state, $stateParams, MessageService, PlaygroundService) => {
            //given
            $stateParams.prepid = null;
            $stateParams.datasetid = 'non existing dataset';
            spyOn(PlaygroundService, 'initPlayground').and.returnValue($q.reject());

            //when
            createController();

            //then
            expect(MessageService.error).toHaveBeenCalledWith('PLAYGROUND_FILE_NOT_FOUND_TITLE', 'PLAYGROUND_FILE_NOT_FOUND', {type: 'dataset'});
            expect($state.go).toHaveBeenCalledWith('nav.home.preparations');
        }));
    });
});
