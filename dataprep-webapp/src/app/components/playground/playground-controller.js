/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc controller
 * @name data-prep.playground.controller:PlaygroundCtrl
 * @description Playground controller.
 * @requires data-prep.services.state.constant:state
 * @requires data-prep.services.state.service:StateService
 * @requires data-prep.services.playground.service:PlaygroundService
 * @requires data-prep.services.preparation.service:PreparationService
 * @requires data-prep.services.playground.service:PreviewService
 * @requires data-prep.services.recipe.service:RecipeService
 * @requires data-prep.services.recipe.service:RecipeBulletService
 * @requires data-prep.services.onboarding.service:OnboardingService
 * @requires data-prep.services.lookup.service:LookupService
 * @requires data-prep.services.utils.service:MessageService
 */
export default function PlaygroundCtrl($timeout, $state, $stateParams, state, StateService, PlaygroundService, PreparationService,
                                       PreviewService, RecipeService, RecipeBulletService, OnboardingService,
                                       LookupService, MessageService) {
    'ngInject';

    var vm = this;
    vm.state = state;
    vm.recipeService = RecipeService;

    vm.toggleRecipe = RecipeBulletService.toggleRecipe;
    vm.openFeedbackForm = StateService.showFeedback;
    vm.toggleParameters = StateService.toggleDatasetParameters;
    vm.previewInProgress = PreviewService.previewInProgress;
    vm.startOnBoarding = OnboardingService.startTour;

    /**
     * @ngdoc property
     * @name showNameValidation
     * @propertyOf data-prep.playground.controller:PlaygroundCtrl
     * @description Flag that controls the display of the save/discard window on implicit preparation close.
     */
    vm.showNameValidation = false;

    //--------------------------------------------------------------------------------------------------------------
    //--------------------------------------------------RECIPE HEADER-----------------------------------------------
    //--------------------------------------------------------------------------------------------------------------
    /**
     * @ngdoc method
     * @name confirmPrepNameEdition
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description Change the preparation name
     */
    vm.confirmPrepNameEdition = function confirmPrepNameEdition(name) {
        var cleanName = name.trim();
        if (!vm.changeNameInProgress && cleanName) {
            changeName(cleanName)
                .then((preparation) => $state.go('playground.preparation', {prepid: preparation.id}));
        }
    };

    /**
     * @ngdoc method
     * @name changeName
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description [PRIVATE] Create a preparation or update existing preparation name if it already exists
     * @param {string} name The preparation name
     * @returns {Promise} The create/update promise
     */
    function changeName(name) {
        vm.changeNameInProgress = true;
        return PlaygroundService.createOrUpdatePreparation(name)
            .finally(() => vm.changeNameInProgress = false);
    }

    //--------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------LOOKUP--------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------
    /**
     * @ngdoc method
     * @name toggleLookup
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description show hides lookup panel and populates its grid
     */
    vm.toggleLookup = function toggleLookup() {
        if (state.playground.lookup.visibility) {
            StateService.setLookupVisibility(false);
        }
        else {
            LookupService.initLookups()
                .then(StateService.setLookupVisibility.bind(null, true));
        }
    };

    //--------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------CLOSE---------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------
    /**
     * @ngdoc method
     * @name beforeClose
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description When the preparation is an implicit preparation, we show the save/discard modal and block the playground close.
     * @returns {boolean} True if the playground can be closed (no implicit preparation), False otherwise
     */
    vm.beforeClose = function beforeClose() {
        var isDraft = state.playground.preparation && state.playground.preparation.draft;
        if (isDraft) {
            vm.showNameValidation = true;
        }
        else {
            close();
        }
    };

    /**
     * @ngdoc method
     * @name discardSaveOnClose
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description Discard implicit preparation save. This trigger a preparation delete.
     */
    vm.discardSaveOnClose = function discardSaveOnClose() {
        PreparationService.delete(state.playground.preparation).then(close);
    };

    /**
     * @ngdoc method
     * @name confirmSaveOnClose
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description Save implicit preparation with provided name. The playground is then closed.
     */
    vm.confirmSaveOnClose = function confirmSaveOnClose() {
        vm.saveInProgress = true;
        var cleanName = vm.state.playground.preparationName.trim();
        changeName(cleanName).then(close);
    };

    /**
     * @ngdoc method
     * @name close
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description Playground close callback. It reset the playground and redirect to the previous page
     */
    function close () {
        $timeout(StateService.resetPlayground, 500, false);
        $state.go(state.playground.previousState);
    }

    //--------------------------------------------------------------------------------------------------------------
    //------------------------------------------DATASET PARAMS------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------
    /**
     * @ngdoc method
     * @name changeDatasetParameters
     * @methodOf data-prep.playground.controller:PlaygroundCtrl
     * @description Change the dataset parameters
     * @param {object} parameters The new dataset parameters
     */
    vm.changeDatasetParameters = function changeDatasetParameters(parameters) {
        StateService.setIsSendingDatasetParameters(true);
        PlaygroundService.changeDatasetParameters(parameters)
            .then(StateService.hideDatasetParameters)
            .finally(StateService.setIsSendingDatasetParameters.bind(null, false));
    };

    //--------------------------------------------------------------------------------------------------------------
    //------------------------------------------------INIT----------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------
    function errorGoBack(errorOptions) {
        MessageService.error('PLAYGROUND_FILE_NOT_FOUND_TITLE', 'PLAYGROUND_FILE_NOT_FOUND', errorOptions);
        $state.go(state.playground.previousState);
    }

    if ($stateParams.prepid) {
        var preparation = _.find(state.inventory.preparations, {id: $stateParams.prepid});
        if (!preparation) {
            errorGoBack({type: 'preparation'});
        }
        else {
            PlaygroundService.load(preparation)
                .catch(() => errorGoBack({type: 'preparation'}));
        }
    }
    else if ($stateParams.datasetid) {
        var dataset = _.find(state.inventory.datasets, {id: $stateParams.datasetid});
        if (!dataset) {
            errorGoBack({type: 'dataset'});
        }
        else {
            PlaygroundService.initPlayground(dataset)
                .catch(() => errorGoBack({type: 'dataset'}));
        }
    }
}

/**
 * @ngdoc property
 * @name hasActiveStep
 * @propertyOf data-prep.playground.controller:PlaygroundCtrl
 * @description checks if there is at least 1 active step, by checking the 1st step in the recipe
 * It is bound to {@link data-prep.services.recipe.service:RecipeService RecipeService} status of the 1st step in the returned recipe array by the getRecipe() function
 * @type boolean
 */
Object.defineProperty(PlaygroundCtrl.prototype,
    'hasActiveStep', {
        enumerable: true,
        configurable: false,
        get: function () {
            var firstStep = this.recipeService.getRecipe()[0];
            return firstStep && !firstStep.inactive;
        },
        set: () => {}
    });

