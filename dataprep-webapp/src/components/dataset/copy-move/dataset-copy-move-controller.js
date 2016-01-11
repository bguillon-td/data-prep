(function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name data-prep.dataset-list.controller:DatasetListCtrl
     * @description Dataset list controller.
     On creation, it fetch dataset list from backend and load playground if 'datasetid' query param is provided
     * @requires data-prep.services.state.service:StateService
     * @requires data-prep.services.dataset.service:DatasetService
     * @requires data-prep.services.dataset.service:DatasetListSortService
     * @requires data-prep.services.folder.service:FolderService
     * @requires data-prep.services.playground.service:PlaygroundService
     * @requires data-prep.services.uploadWorkflowService.service:UploadWorkflowService
     * @requires data-prep.services.datasetWorkflowService.service:UpdateWorkflowService
     * @requires data-prep.services.utils.service:MessageService
     * @requires talend.widget.service:TalendConfirmService
     */
    function DatasetCopyMoveCtrl ($timeout, $translate, $stateParams, StateService, DatasetService, DatasetListSortService, PlaygroundService,
                              TalendConfirmService, MessageService, UploadWorkflowService, UpdateWorkflowService, FolderService, state) {
        var vm = this;

        vm.datasetService = DatasetService;

        vm.state = false;

    }


    angular.module('data-prep.dataset-copy-move')
        .controller('DatasetCopyMoveCtrl', DatasetCopyMoveCtrl);
})();
