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
    function DatasetCopyMoveCtrl ($translate, $stateParams, StateService, DatasetService, DatasetListSortService, PlaygroundService,
                              MessageService, FolderService, state) {
        var vm = this;

        vm.datasetService = DatasetService;

        vm.state = false;

        vm.isCloningDs = false;
        vm.isMovingDs = false;

        vm.cloneName;

        /**
         * @ngdoc method
         * @name clone
         * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
         * @description perform the dataset cloning to the folder destination
         */
        vm.clone = function () {
            vm.isCloningDs = true;
            vm.cloneNameForm.$commitViewValue();

            DatasetService.clone(state.folder.datasetToCopyClone, state.folder.choosedFolder, vm.cloneName)
                .then(function () {
                    MessageService.success('COPY_SUCCESS_TITLE', 'COPY_SUCCESS');

                    // force going to current folder to refresh the content
                    FolderService.getContent(state.folder.currentFolder);
                    // reset some values to initial values
                    vm.folderDestinationModal = false;
                    StateService.setDatasetToCopyClone(null);
                    StateService.setChoosedFolder(null);
                    vm.cloneName = '';
                    vm.isCloningDs = false;
                    vm.state = false;
                }, function () {
                    vm.isCloningDs = false;
                    setTimeout(vm.focusOnNameInput, 1100);
                });
        };

        /**
         * @ngdoc method
         * @name move
         * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
         * @description perform the dataset moving to the folder destination
         */
        vm.move = function () {
            vm.isMovingDs = true;
            vm.cloneNameForm.$commitViewValue();

            DatasetService.move(state.folder.datasetToCopyClone, state.folder.currentFolder, state.folder.choosedFolder, vm.cloneName)
                .then(function () {
                    MessageService.success('MOVE_SUCCESS_TITLE', 'MOVE_SUCCESS');

                    // force going to current folder to refresh the content
                    FolderService.getContent(state.folder.currentFolder);

                    // reset some values to initial values
                    vm.folderDestinationModal = false;
                    StateService.setDatasetToCopyClone(null);
                    StateService.setChoosedFolder(null);
                    vm.cloneName = '';
                    vm.isMovingDs = false;
                    vm.state = false;
                }, function () {
                    vm.isMovingDs = false;
                    setTimeout(vm.focusOnNameInput, 1100);
                });
        };

        vm.init = function(){
          vm.cloneName = state.folder.datasetToCopyClone.name;
        };

    }


    angular.module('data-prep.dataset-copy-move')
        .controller('datasetCopyMoveCtrl', DatasetCopyMoveCtrl);
})();
